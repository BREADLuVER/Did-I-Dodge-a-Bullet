import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  limit, 
  orderBy,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { getFirestoreDB } from './firebase';

// Unified Company Interface
export interface Company {
  id: string;
  name: string;
  normalizedName: string;
  aliases: string[];
  website?: string;
  location?: string;
  industry?: string;
  company_size?: string;
  company_type?: string;
  founded_year?: number;
  specialities?: string;
  locations?: string;
  
  // Dynamic fields from submissions
  submissionCount: number;
  lastSubmission?: Date;
  commonFlags: string[];
  averageFlagCount: number;
  severityTrends: {
    light: number;
    medium: number;
  };
  
  // Metadata
  createdAt?: Date;
  updatedAt?: Date;
}

// Search Result with relevance score
export interface SearchResult {
  company: Company;
  relevanceScore: number;
  matchType: 'exact' | 'partial' | 'fuzzy' | 'alias';
}

// Cache interface
interface CompanyCache {
  companies: Company[];
  lastUpdated: number;
  isLoaded: boolean;
}

// Global cache with TTL
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let companyCache: CompanyCache = {
  companies: [],
  lastUpdated: 0,
  isLoaded: false
};

/**
 * Normalize company name for consistent searching
 */
export const normalizeCompanyName = (input: string): string => {
  if (!input) return '';
  
  return input
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/\b(inc|corp|corporation|llc|ltd|limited|co|company|group|holdings|enterprises|ventures|partners|associates)\b/g, '') // Remove common suffixes
    .replace(/\b(the|a|an)\b/g, '') // Remove common prefixes
    .replace(/\s+/g, ' ') // Normalize whitespace again
    .trim();
};

/**
 * Generate aliases for a company name
 */
export const generateAliases = (name: string, website?: string): string[] => {
  const aliases: string[] = [];
  
  if (!name) return aliases;
  
  // Add original name
  aliases.push(name.trim());
  
  // Add lowercase version
  aliases.push(name.toLowerCase().trim());
  
  // Add without common suffixes
  const nameClean = name.toLowerCase()
    .replace(/\b(inc|corp|corporation|llc|ltd|limited|co|company|group|holdings|enterprises|ventures|partners|associates)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  if (nameClean && nameClean !== name.toLowerCase().trim()) {
    aliases.push(nameClean);
  }
  
  // Add domain-based alias if website exists
  if (website) {
    try {
      const url = new URL(website);
      const domain = url.hostname;
      if (domain && domain !== name.toLowerCase()) {
        aliases.push(domain);
        // Add without www
        if (domain.startsWith('www.')) {
          aliases.push(domain.substring(4));
        }
      }
    } catch {
      // Invalid URL, skip
    }
  }
  
  // Remove duplicates and empty strings
  return Array.from(new Set(aliases.filter(alias => alias.trim())));
};

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
export const calculateSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  
  const matrix = [];
  const len1 = str1.length;
  const len2 = str2.length;

  // Initialize matrix
  for (let i = 0; i <= len2; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= len1; j++) {
    matrix[0][j] = j;
  }

  // Fill matrix
  for (let i = 1; i <= len2; i++) {
    for (let j = 1; j <= len1; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  // Calculate similarity percentage
  const maxLength = Math.max(len1, len2);
  return maxLength === 0 ? 1 : (maxLength - matrix[len2][len1]) / maxLength;
};

/**
 * Optimized company search and management with caching
 */
export class CompanyService {
  private static instance: CompanyService;
  private db = getFirestoreDB();

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): CompanyService {
    if (!CompanyService.instance) {
      CompanyService.instance = new CompanyService();
    }
    return CompanyService.instance;
  }

  /**
   * Load all companies from database with caching
   */
  private async loadAllCompanies(): Promise<Company[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (companyCache.isLoaded && (now - companyCache.lastUpdated) < CACHE_TTL) {
      return companyCache.companies;
    }
    
    try {
      if (!this.db) {
        console.warn('Firebase not initialized');
        return [];
      }

      const companiesRef = collection(this.db, 'companies');
      const snapshot = await getDocs(companiesRef);
      
      const companies = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          normalizedName: data.normalizedName || '',
          aliases: data.aliases || [],
          website: data.website,
          location: data.location,
          industry: data.industry,
          company_size: data.company_size,
          company_type: data.company_type,
          founded_year: data.founded_year,
          specialities: data.specialities,
          locations: data.locations,
          submissionCount: data.submissionCount || 0,
          lastSubmission: data.lastSubmission?.toDate(),
          commonFlags: data.commonFlags || [],
          averageFlagCount: data.averageFlagCount || 0,
          severityTrends: data.severityTrends || { light: 0, medium: 0 },
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
        };
      });

      // Update cache
      companyCache = {
        companies,
        lastUpdated: now,
        isLoaded: true
      };

      console.log(`Loaded ${companies.length} companies`);
      return companies;
    } catch (error) {
      console.error('Error loading companies:', error);
      return [];
    }
  }

  /**
   * Search companies with optimized caching
   */
  async searchCompanies(query: string, limit: number = 10): Promise<Company[]> {
    if (!query.trim()) return [];
    
    const companies = await this.loadAllCompanies();
    const normalizedQuery = normalizeCompanyName(query);
    
    const results: SearchResult[] = [];
    
    for (const company of companies) {
      let bestScore = 0;
      let matchType: 'exact' | 'partial' | 'fuzzy' | 'alias' = 'fuzzy';
      
      // Check exact matches first
      if (company.normalizedName === normalizedQuery) {
        bestScore = 1.0;
        matchType = 'exact';
      } else if (company.name.toLowerCase().includes(query.toLowerCase())) {
        bestScore = 0.9;
        matchType = 'partial';
      } else {
        // Check aliases
        for (const alias of company.aliases) {
          const aliasNormalized = normalizeCompanyName(alias);
          if (aliasNormalized === normalizedQuery) {
            bestScore = 0.8;
            matchType = 'alias';
            break;
          }
        }
        
        // If no exact matches, try fuzzy matching
        if (bestScore === 0) {
          const similarity = calculateSimilarity(normalizedQuery, company.normalizedName);
          if (similarity > 0.7) {
            bestScore = similarity;
            matchType = 'fuzzy';
          }
        }
      }
      
      if (bestScore > 0) {
        results.push({ company, relevanceScore: bestScore, matchType });
      }
    }
    
    // Sort by relevance and return top results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit)
      .map(result => result.company);
  }

  /**
   * Find or create company with caching
   */
  async findOrCreateCompany(companyName: string): Promise<Company> {
    if (!companyName.trim()) {
      throw new Error('Company name cannot be empty');
    }
    
    // First try to find existing company
    const searchResults = await this.searchCompanies(companyName, 1);
    if (searchResults.length > 0) {
      const bestMatch = searchResults[0];
      const similarity = calculateSimilarity(
        normalizeCompanyName(companyName), 
        bestMatch.normalizedName
      );
      
      // If similarity is high enough, return existing company
      if (similarity > 0.8) {
        return bestMatch;
      }
    }
    
    // Create new company if no good match found
    return this.createCompany(companyName);
  }

  /**
   * Create new company
   */
  private async createCompany(companyName: string): Promise<Company> {
    if (!this.db) {
      throw new Error('Firebase not initialized');
    }
    
    const normalizedName = normalizeCompanyName(companyName);
    const aliases = generateAliases(companyName);
    
    const companyData = {
      name: companyName.trim(),
      normalizedName,
      aliases,
      submissionCount: 0,
      commonFlags: [],
      averageFlagCount: 0,
      severityTrends: { light: 0, medium: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    try {
      const docRef = await addDoc(collection(this.db, 'companies'), companyData);
      
      const newCompany: Company = {
        id: docRef.id,
        ...companyData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add to cache
      companyCache.companies.push(newCompany);
      
      return newCompany;
    } catch (error) {
      console.error('Error creating company:', error);
      throw error;
    }
  }

  /**
   * Update company with submission data
   */
  async updateCompanyWithSubmission(
    companyId: string, 
    submissionData: {
      markedFlags: string[];
      severityBreakdown: { light: number; medium: number };
    }
  ): Promise<void> {
    if (!this.db) {
      console.warn('Firebase not initialized. Skipping company update.');
      return;
    }
    
    try {
      const docRef = doc(this.db, 'companies', companyId);
      
      // Get current company data
      const company = companyCache.companies.find(c => c.id === companyId);
      if (!company) {
        console.warn('Company not found in cache for update');
        return;
      }
      
      const updatedData = {
        submissionCount: company.submissionCount + 1,
        commonFlags: Array.from(new Set([...company.commonFlags, ...submissionData.markedFlags])),
        averageFlagCount: (company.averageFlagCount * company.submissionCount + submissionData.markedFlags.length) / (company.submissionCount + 1),
        severityTrends: {
          light: company.severityTrends.light + submissionData.severityBreakdown.light,
          medium: company.severityTrends.medium + submissionData.severityBreakdown.medium
        },
        lastSubmission: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      
      await updateDoc(docRef, updatedData);
      
      // Update cache
      const cacheIndex = companyCache.companies.findIndex(c => c.id === companyId);
      if (cacheIndex !== -1) {
        companyCache.companies[cacheIndex] = {
          ...company,
          ...updatedData,
          lastSubmission: new Date(),
          updatedAt: new Date(),
        };
      }
    } catch (error) {
      console.error('Error updating company with submission:', error);
      // Don't throw error - company update is not critical
    }
  }

  /**
   * Refresh companies cache
   */
  async refreshCompanies(): Promise<void> {
    companyCache = {
      companies: [],
      lastUpdated: 0,
      isLoaded: false
    };
    await this.loadAllCompanies();
  }

  /**
   * Get all companies (cached)
   */
  async getAllCompanies(): Promise<Company[]> {
    return this.loadAllCompanies();
  }
}

// Export singleton instance
export const companyService = CompanyService.getInstance();

// Legacy functions for backward compatibility
export const getCompanyInsights = async (companyName: string) => {
  const companies = await companyService.searchCompanies(companyName, 1);
  return companies.length > 0 ? companies[0] : null;
};

export const updateCompanyInsights = async (companyName: string, submissionData: any) => {
  const companies = await companyService.searchCompanies(companyName, 1);
  if (companies.length > 0) {
    await companyService.updateCompanyWithSubmission(companies[0].id, submissionData);
  }
}; 