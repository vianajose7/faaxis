import Airtable from 'airtable';
import { log } from './vite';

// Initialize Airtable with API key
Airtable.configure({
  apiKey: process.env.AIRTABLE_API_KEY
});

// Constants for the Airtable base and tables
const BASE_ID = 'appmVisf1pJhVLAhx';
const FIRM_DEALS_TABLE = 'Table 1'; // The main table in the Airtable base
const FIRM_PARAMS_TABLE = 'Table 1'; // We'll use the same table for parameters too

// Initialize the base
const base = Airtable.base(BASE_ID);

export interface FirmProfile {
  id: string;
  firm: string;
  ceo: string;
  bio: string;
  logoUrl: string;
  founded: string;
  headquarters: string;
}

export interface FirmDeal {
  id: string;
  firm: string;
  upfrontMin: number;
  upfrontMax: number;
  backendMin: number;
  backendMax: number;
  totalDealMin: number;
  totalDealMax: number;
  notes: string;
}

export interface FirmParameter {
  id: string;
  firm: string;
  paramName: string;
  paramValue: number;
  notes: string;
}

// Define the table name for firm profiles
const FIRM_PROFILES_TABLE = 'Firm Profiles';

// Cache for the data
let dealsCache: FirmDeal[] | null = null;
let paramsCache: FirmParameter[] | null = null;
let profilesCache: FirmProfile[] | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache TTL

/**
 * Fetch all firm deals from Airtable
 */
export async function getFirmDeals(): Promise<FirmDeal[]> {
  const now = Date.now();
  
  // If we have a fresh cache, return it
  if (dealsCache && (now - lastFetchTime < CACHE_TTL)) {
    return dealsCache;
  }
  
  try {
    log('Fetching firm deals from Airtable...', 'airtable');
    
    const records = await base(FIRM_DEALS_TABLE).select({
      view: 'Grid view'
    }).all();
    
    const deals: FirmDeal[] = records.map(record => {
      const fields = record.fields as any;
      
      // Based on the fields we observed in the response, creating a mapping
      // Using the "Firm Name" field for the firm name
      // "Upfront" for upfront values (as a percentage)
      // "Total Deal" for total deal values (as a percentage)
      // "Firm Overview" can be used for notes
      const upfrontPct = typeof fields.Upfront === 'number' ? fields.Upfront : 0;
      const totalDealPct = typeof fields['Total Deal'] === 'number' ? fields['Total Deal'] : 0;
      
      return {
        id: record.id,
        firm: fields['Firm Name'] || '',
        upfrontMin: upfrontPct * 0.9, // Using 90% of the upfront as min
        upfrontMax: upfrontPct * 1.1, // Using 110% of the upfront as max
        backendMin: (totalDealPct - upfrontPct) * 0.9, // Backend = Total - Upfront
        backendMax: (totalDealPct - upfrontPct) * 1.1,
        totalDealMin: totalDealPct * 0.9,
        totalDealMax: totalDealPct * 1.1,
        notes: fields['Firm Overview'] || ''
      };
    });
    
    // Update cache
    dealsCache = deals;
    lastFetchTime = now;
    
    log(`Fetched ${deals.length} firm deals from Airtable`, 'airtable');
    return deals;
  } catch (error: any) {
    log(`Error fetching firm deals: ${error.message}`, 'airtable');
    
    // If we have a cache, return it even if stale
    if (dealsCache) {
      log('Returning stale cache for firm deals', 'airtable');
      return dealsCache;
    }
    
    throw error;
  }
}

/**
 * Fetch all firm parameters from Airtable
 */
export async function getFirmParameters(): Promise<FirmParameter[]> {
  const now = Date.now();
  
  // If we have a fresh cache, return it
  if (paramsCache && (now - lastFetchTime < CACHE_TTL)) {
    return paramsCache;
  }
  
  try {
    log('Fetching firm parameters from Airtable...', 'airtable');
    
    const records = await base(FIRM_PARAMS_TABLE).select({
      view: 'Grid view'
    }).all();
    
    // Since we're using the same table for both deals and parameters,
    // we'll extract additional fields as parameters
    const params: FirmParameter[] = [];
    
    records.forEach(record => {
      const fields = record.fields as any;
      const firmName = fields['Firm Name'] || '';
      
      // For each firm, add relevant parameters
      if (fields['Length of Deal']) {
        params.push({
          id: `${record.id}_deal_length`,
          firm: firmName,
          paramName: 'dealLength',
          paramValue: Number(fields['Length of Deal']) || 0,
          notes: 'Length of deal in years'
        });
      }
      
      if (fields['Hurdles']) {
        params.push({
          id: `${record.id}_hurdles`,
          firm: firmName,
          paramName: 'hurdles',
          paramValue: Number(fields['Hurdles']) || 0,
          notes: 'Performance hurdles'
        });
      }
      
      if (fields['Grid']) {
        params.push({
          id: `${record.id}_grid`,
          firm: firmName,
          paramName: 'grid',
          paramValue: typeof fields['Grid'] === 'number' ? fields['Grid'] : 0,
          notes: 'Grid percentage'
        });
      }
      
      if (fields['Deferred Match']) {
        params.push({
          id: `${record.id}_deferred_match`,
          firm: firmName,
          paramName: 'deferredMatch',
          paramValue: typeof fields['Deferred Match'] === 'number' ? fields['Deferred Match'] : 0,
          notes: 'Deferred match percentage'
        });
      }
      
      // Also add the type if available
      if (fields['Type']) {
        params.push({
          id: `${record.id}_type`,
          firm: firmName,
          paramName: 'firmType',
          paramValue: 0, // No numeric value for type
          notes: fields['Type'] || ''
        });
      }
    });
    
    // Update cache
    paramsCache = params;
    lastFetchTime = now;
    
    log(`Fetched ${params.length} firm parameters from Airtable`, 'airtable');
    return params;
  } catch (error: any) {
    log(`Error fetching firm parameters: ${error.message}`, 'airtable');
    
    // If we have a cache, return it even if stale
    if (paramsCache) {
      log('Returning stale cache for firm parameters', 'airtable');
      return paramsCache;
    }
    
    throw error;
  }
}

/**
 * Fetch all firm profiles from Airtable
 */
export async function getFirmProfiles(): Promise<FirmProfile[]> {
  const now = Date.now();
  
  // If we have a fresh cache, return it
  if (profilesCache && (now - lastFetchTime < CACHE_TTL)) {
    return profilesCache;
  }
  
  try {
    log('Fetching firm profiles from Airtable...', 'airtable');
    
    // First check if the table exists, if not return sample data for now
    // In a real implementation, we would create the table first
    try {
      const records = await base(FIRM_PROFILES_TABLE).select({
        view: 'Grid view'
      }).all();
      
      const profiles: FirmProfile[] = records.map(record => {
        const fields = record.fields as any;
        
        return {
          id: record.id,
          firm: fields['Firm Name'] || '',
          ceo: fields['CEO'] || '',
          bio: fields['Bio'] || '',
          logoUrl: fields['Logo'] ? fields['Logo'][0].url : '',
          founded: fields['Founded'] || '',
          headquarters: fields['Headquarters'] || ''
        };
      });
      
      // Update cache
      profilesCache = profiles;
      lastFetchTime = now;
      
      log(`Fetched ${profiles.length} firm profiles from Airtable`, 'airtable');
      return profiles;
    } catch (error) {
      // Table might not exist yet, return sample data
      log('Firm profiles table may not exist yet, using generated profiles based on existing firms', 'airtable');
      
      // Use existing firm deals to create sample profiles
      const deals = await getFirmDeals();
      const sampleProfiles: FirmProfile[] = deals.map(deal => ({
        id: deal.id + '_profile',
        firm: deal.firm,
        ceo: 'CEO information not available',
        bio: deal.notes || 'No company bio available',
        logoUrl: '',
        founded: 'Year not available',
        headquarters: 'Location not available'
      }));
      
      profilesCache = sampleProfiles;
      return sampleProfiles;
    }
  } catch (error: any) {
    log(`Error fetching firm profiles: ${error.message}`, 'airtable');
    
    // If we have a cache, return it even if stale
    if (profilesCache) {
      log('Returning stale cache for firm profiles', 'airtable');
      return profilesCache;
    }
    
    // Use existing firm deals to create sample profiles
    const deals = await getFirmDeals();
    return deals.map(deal => ({
      id: deal.id + '_profile',
      firm: deal.firm,
      ceo: 'CEO information not available',
      bio: deal.notes || 'No company bio available',
      logoUrl: '',
      founded: 'Year not available',
      headquarters: 'Location not available'
    }));
  }
}

/**
 * Invalidate the cache to force a fresh fetch
 */
export function invalidateCache() {
  dealsCache = null;
  paramsCache = null;
  profilesCache = null;
  lastFetchTime = 0;
  log('Airtable cache invalidated', 'airtable');
  
  // Check if Airtable API key is available
  if (!process.env.AIRTABLE_API_KEY) {
    log('AIRTABLE_API_KEY is not set in environment variables', 'airtable');
    throw new Error('Airtable API key is missing. Please set the AIRTABLE_API_KEY environment variable.');
  }
  
  return {
    message: 'Cache invalidated successfully',
    cacheStatus: {
      dealsCache: dealsCache === null ? 'invalidated' : 'active',
      paramsCache: paramsCache === null ? 'invalidated' : 'active',
      profilesCache: profilesCache === null ? 'invalidated' : 'active',
    }
  };
}