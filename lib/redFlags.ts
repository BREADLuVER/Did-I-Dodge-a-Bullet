// New Firebase-based Red Flags System
export interface RedFlag {
  id: string;
  text: string;
  category: 'culture' | 'leadership' | 'role' | 'process' | 'communication' | 'compensation' | 'stability' | 'environment';
  severity: 'light' | 'medium';
  explanation?: string;
  tags?: string[];
  createdAt: any; // Firestore timestamp
  updatedAt: any; // Firestore timestamp
  isActive: boolean;
  usageCount: number;
  priority: number; // For ordering/curation
}

// Firebase Red Flags Service
import { getFirestoreDB } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  doc,
  updateDoc,
  serverTimestamp,
  increment 
} from 'firebase/firestore';

export class RedFlagsService {
  private static instance: RedFlagsService;
  private cache: RedFlag[] | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  static getInstance(): RedFlagsService {
    if (!RedFlagsService.instance) {
      RedFlagsService.instance = new RedFlagsService();
    }
    return RedFlagsService.instance;
  }

  async getAllRedFlags(): Promise<RedFlag[]> {
    // Check cache first
    if (this.cache && Date.now() - this.lastFetch < this.CACHE_DURATION) {
      return this.cache;
    }

    try {
      const db = getFirestoreDB();
      const redFlagsRef = collection(db, 'red_flags');
      const q = query(
        redFlagsRef,
        where('isActive', '==', true),
        orderBy('priority', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const redFlags: RedFlag[] = [];
      
      querySnapshot.forEach((doc) => {
        redFlags.push({
          id: doc.id,
          ...doc.data()
        } as RedFlag);
      });

      // Sort by usage count in memory (more efficient than requiring composite index)
      redFlags.sort((a, b) => {
        // First sort by priority (already done by query)
        if (a.priority !== b.priority) {
          return b.priority - a.priority;
        }
        // Then by usage count
        return b.usageCount - a.usageCount;
      });

      // Update cache
      this.cache = redFlags;
      this.lastFetch = Date.now();
      
      return redFlags;
    } catch (error) {
      console.error('Error fetching red flags:', error);
      // Return fallback data if Firebase fails
      return this.getFallbackRedFlags();
    }
  }

  async getRedFlagsBySeverity(severity: 'light' | 'medium'): Promise<RedFlag[]> {
    const allFlags = await this.getAllRedFlags();
    return allFlags.filter(flag => flag.severity === severity);
  }

  async getRedFlagsByCategory(category: string): Promise<RedFlag[]> {
    const allFlags = await this.getAllRedFlags();
    return allFlags.filter(flag => flag.category === category);
  }

  async getCuratedFlags(count: number = 9): Promise<RedFlag[]> {
    const allFlags = await this.getAllRedFlags();
    
    // Separate by severity
    const mediumFlags = allFlags.filter(flag => flag.severity === 'medium');
    const lightFlags = allFlags.filter(flag => flag.severity === 'light');

    // Shuffle arrays
    const shuffle = <T>(array: T[]): T[] => {
      return [...array].sort(() => 0.5 - Math.random());
    };

    const shuffledMedium = shuffle(mediumFlags);
    const shuffledLight = shuffle(lightFlags);

    // Strategic selection based on count
    let selectedFlags: RedFlag[] = [];
    
    if (count === 9) {
      // 3x3 grid: 3 medium, 6 light
      selectedFlags = [
        ...shuffledMedium.slice(0, 3),
        ...shuffledLight.slice(0, 6)
      ];
    } else {
      // Flexible selection
      const mediumCount = Math.ceil(count * 0.3);
      const lightCount = count - mediumCount;
      
      selectedFlags = [
        ...shuffledMedium.slice(0, mediumCount),
        ...shuffledLight.slice(0, lightCount)
      ];
    }

    // Shuffle final selection
    return shuffle(selectedFlags);
  }

  async incrementUsageCount(flagId: string): Promise<void> {
    try {
      const db = getFirestoreDB();
      const flagRef = doc(db, 'red_flags', flagId);
      
      await updateDoc(flagRef, {
        usageCount: increment(1),
        updatedAt: serverTimestamp()
      });
      
      // Invalidate cache
      this.cache = null;
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  }

  async createRedFlag(flagData: Omit<RedFlag, 'id' | 'createdAt' | 'updatedAt' | 'usageCount'>): Promise<string> {
    try {
      const db = getFirestoreDB();
      const redFlagsRef = collection(db, 'red_flags');
      
      const newFlag = {
        ...flagData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        usageCount: 0
      };
      
      const docRef = await addDoc(redFlagsRef, newFlag);
      
      // Invalidate cache
      this.cache = null;
      
      return docRef.id;
    } catch (error) {
      console.error('Error creating red flag:', error);
      throw error;
    }
  }

  // Fallback data for when Firebase is unavailable
  private getFallbackRedFlags(): RedFlag[] {
    return [
      {
        id: 'fallback-1',
        text: 'They described the team as a "family"',
        category: 'culture',
        severity: 'light',
        explanation: 'Often code for "we expect you to work overtime without complaint"',
        tags: ['overtime', 'boundaries'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        usageCount: 0,
        priority: 1
      },
      {
        id: 'fallback-2',
        text: 'Conflicting job descriptions from different interviewers',
        category: 'role',
        severity: 'medium',
        explanation: 'Nobody knows what you\'ll actually be doing',
        tags: ['confusion', 'disorganization'],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        usageCount: 0,
        priority: 2
      }
    ];
  }
}

// Export singleton instance
export const redFlagsService = RedFlagsService.getInstance();

// Legacy exports for backward compatibility
export const redFlags: RedFlag[] = [];

export const getBalancedRedFlags = async (): Promise<RedFlag[]> => {
  return await redFlagsService.getCuratedFlags(9);
};

// Helper function to get flags by severity
export const getFlagsBySeverity = async (severity: 'light' | 'medium'): Promise<RedFlag[]> => {
  return await redFlagsService.getRedFlagsBySeverity(severity);
};

// Helper function to get flags by category
export const getFlagsByCategory = async (category: string): Promise<RedFlag[]> => {
  return await redFlagsService.getRedFlagsByCategory(category);
}; 