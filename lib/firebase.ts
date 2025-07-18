import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  addDoc, 
  updateDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  serverTimestamp 
} from 'firebase/firestore';

// Firebase configuration - will be validated before use
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Singleton pattern to prevent multiple initializations
let firebaseApp: FirebaseApp | null = null;
let firestoreDB: Firestore | null = null;
let isInitialized = false;

// Validate configuration with better debugging
export const validateFirebaseConfig = (): boolean => {
  const requiredKeys = [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID',
  ];

  // Check if any values are missing or invalid
  const missingKeys = requiredKeys.filter(key => {
    const value = process.env[key];
    return !value || value === 'your_api_key_here' || value === '';
  });
  
  if (missingKeys.length > 0) {
    console.error('Missing Firebase configuration keys:', missingKeys);
    console.error('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      hasStorageBucket: !!process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      hasMessagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      hasAppId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    });
    console.error('Debug: Actual values (first 10 chars):', {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.substring(0, 10) + '...',
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.substring(0, 10) + '...',
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET?.substring(0, 10) + '...',
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID?.substring(0, 10) + '...',
    });
    return false;
  }

  console.log('✅ Firebase configuration validation passed');
  return true;
};

// Initialize Firebase lazily when first needed
const ensureFirebaseInitialized = () => {
  if (isInitialized) return;
  
  if (typeof window !== 'undefined') {
    // Only initialize on client side
    try {
      if (validateFirebaseConfig()) {
        initializeFirebase();
        isInitialized = true;
        console.log('✅ Firebase initialized successfully');
      } else {
        console.warn('⚠️ Firebase configuration incomplete - running in offline mode');
        // Set a flag to indicate Firebase is not available
        (window as any).__FIREBASE_OFFLINE_MODE__ = true;
      }
    } catch (error) {
      console.error('❌ Firebase initialization failed:', error);
      (window as any).__FIREBASE_OFFLINE_MODE__ = true;
    }
  }
};

// Initialize Firebase only once
export const initializeFirebase = (): { app: FirebaseApp; db: Firestore } => {
  if (!firebaseApp) {
    // Check if Firebase is already initialized
    const existingApps = getApps();
    if (existingApps.length > 0) {
      firebaseApp = existingApps[0];
    } else {
      firebaseApp = initializeApp(firebaseConfig);
    }
  }

  if (!firestoreDB) {
    firestoreDB = getFirestore(firebaseApp);
  }

  return { app: firebaseApp, db: firestoreDB };
};

// Get Firebase instances
export const getFirebaseApp = (): FirebaseApp => {
  ensureFirebaseInitialized();
  if (!firebaseApp) {
    const { app } = initializeFirebase();
    return app;
  }
  return firebaseApp;
};

export const getFirestoreDB = (): Firestore => {
  ensureFirebaseInitialized();
  if (!firestoreDB) {
    const { db } = initializeFirebase();
    return db;
  }
  return firestoreDB;
};

// Export for backward compatibility (lazy initialization)
export const db = getFirestoreDB();
export const app = getFirebaseApp();



// Database types
export interface InterviewSubmission {
  companyName?: string | null;
  markedFlags: string[];
  totalFlags: number;
  severityBreakdown: {
    light: number;
    medium: number;
  };
  timestamp: any; // Firestore timestamp
  userAgent?: string;
  ipHash?: string;
  sessionId: string;
}

export interface CompanyInsights {
  companyName: string;
  totalSubmissions: number;
  commonFlags: string[];
  averageFlagCount: number;
  severityTrends: {
    light: number;
    medium: number;
  };
  lastUpdated: any; // Firestore timestamp
}

// Database functions
export const submitInterviewCheckup = async (data: Omit<InterviewSubmission, 'timestamp'>) => {
  // Check if we're in offline mode
  if (typeof window !== 'undefined' && (window as any).__FIREBASE_OFFLINE_MODE__) {
    console.log('📱 Running in offline mode - data saved locally only');
    // Save to localStorage as fallback
    const offlineData = {
      ...data,
      timestamp: new Date().toISOString(),
      offline: true
    };
    const offlineSubmissions = JSON.parse(localStorage.getItem('offline_submissions') || '[]');
    offlineSubmissions.push(offlineData);
    localStorage.setItem('offline_submissions', JSON.stringify(offlineSubmissions));
    return 'offline_' + Date.now();
  }

  if (!firestoreDB) {
    throw new Error('Firebase not initialized. Please set up your Firebase configuration.');
  }
  
  try {
    const submissionData: InterviewSubmission = {
      ...data,
      timestamp: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(firestoreDB, 'submissions'), submissionData);
    
    // Update company insights if company name provided
    if (data.companyName) {
      await updateCompanyInsights(data.companyName, submissionData);
    }
    
    return docRef.id;
  } catch (error) {
    console.error('Error submitting interview checkup:', error);
    throw error;
  }
};

export const updateCompanyInsights = async (companyName: string, submissionData: InterviewSubmission) => {
  if (!firestoreDB) {
    console.warn('Firebase not initialized. Skipping company insights update.');
    return;
  }
  
  try {
    const normalizedCompanyName = normalizeCompanyName(companyName);
    
    // Check if company insights already exist
    const companyQuery = query(
      collection(firestoreDB, 'company_insights'),
      where('companyName', '==', normalizedCompanyName)
    );
    
    const querySnapshot = await getDocs(companyQuery);
    
    if (!querySnapshot.empty) {
      // Update existing company insights
      const docRef = doc(firestoreDB, 'company_insights', querySnapshot.docs[0].id);
      const existingData = querySnapshot.docs[0].data() as CompanyInsights;
      
      const updatedData = {
        totalSubmissions: existingData.totalSubmissions + 1,
        commonFlags: Array.from(new Set([...existingData.commonFlags, ...submissionData.markedFlags])),
        averageFlagCount: (existingData.averageFlagCount * existingData.totalSubmissions + submissionData.markedFlags.length) / (existingData.totalSubmissions + 1),
        severityTrends: {
          light: existingData.severityTrends.light + submissionData.severityBreakdown.light,
          medium: existingData.severityTrends.medium + submissionData.severityBreakdown.medium
        },
        lastUpdated: serverTimestamp()
      };
      
      await updateDoc(docRef, updatedData);
    } else {
      // Create new company insights
      await addDoc(collection(firestoreDB, 'company_insights'), {
        companyName: normalizedCompanyName,
        totalSubmissions: 1,
        commonFlags: submissionData.markedFlags,
        averageFlagCount: submissionData.markedFlags.length,
        severityTrends: submissionData.severityBreakdown,
        lastUpdated: serverTimestamp()
      });
    }
  } catch (error) {
    console.error('Error updating company insights:', error);
    // Don't throw error - company insights update is not critical
  }
};

export const getCompanyInsights = async (companyName: string): Promise<CompanyInsights | null> => {
  // Check if we're in offline mode
  if (typeof window !== 'undefined' && (window as any).__FIREBASE_OFFLINE_MODE__) {
    console.log('📱 Running in offline mode - no company insights available');
    return null;
  }

  if (!firestoreDB) {
    console.warn('Firebase not initialized. Cannot get company insights.');
    return null;
  }
  
  try {
    const normalizedCompanyName = normalizeCompanyName(companyName);
    
    const companyQuery = query(
      collection(firestoreDB, 'company_insights'),
      where('companyName', '==', normalizedCompanyName)
    );
    
    const querySnapshot = await getDocs(companyQuery);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].data() as CompanyInsights;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting company insights:', error);
    return null;
  }
};

// Utility functions
export const normalizeCompanyName = (input: string): string => {
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s-]/g, '')
    .replace(/\b(inc|corp|llc|ltd|co|company)\b/g, '')
    .trim();
};

export const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

export const hashIP = async (ip: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}; 