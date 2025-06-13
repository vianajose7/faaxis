import { useQuery } from '@tanstack/react-query';
import { getQueryFn } from './queryClient';

export interface BioData {
  state?: string;
  value?: string | null;
  errorType?: string;
  isStale?: boolean;
}

export interface FirmProfile {
  id: string;
  firm: string;
  ceo: string;
  bio: string | BioData;
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

/**
 * Hook to fetch firm deals from the API
 */
export function useFirmDeals() {
  return useQuery<FirmDeal[], Error>({
    queryKey: ['/api/firm-deals'],
    queryFn: getQueryFn({ on401: 'throw' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    initialData: [], // Provide empty array as initial data to prevent null/undefined errors
  });
}

/**
 * Hook to fetch firm parameters from the API
 */
export function useFirmParameters() {
  return useQuery<FirmParameter[], Error>({
    queryKey: ['/api/firm-parameters'],
    queryFn: getQueryFn({ on401: 'throw' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 10000),
    initialData: [], // Provide empty array as initial data to prevent null/undefined errors
  });
}

/**
 * Hook to fetch firm profiles from the API
 */
export function useFirmProfiles() {
  return useQuery<FirmProfile[], Error>({
    queryKey: ['/api/firm-profiles'],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch a specific firm profile
 */
export function useFirmProfile(firmName: string | null) {
  return useQuery<FirmProfile, Error>({
    queryKey: ['/api/firm-profiles', firmName],
    queryFn: getQueryFn({ on401: 'returnNull' }),
    enabled: !!firmName, // Only run the query if firmName is provided
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Helper function to get parameter value for a specific firm and parameter name
 * @param params List of firm parameters
 * @param firm Firm name
 * @param paramName Parameter name
 * @param defaultValue Default value if parameter not found
 */
export function getParameterValue(
  params: FirmParameter[] | undefined, 
  firm: string, 
  paramName: string, 
  defaultValue: number
): number {
  if (!params) return defaultValue;
  
  // Handle different naming variations
  const firmLower = firm.toLowerCase().trim();
  
  // Define mappings from firm names to possible variations in Airtable
  const firmMappings: Record<string, string[]> = {
    'morgan stanley': ['morgan stanley', 'ms'],
    'merrill lynch': ['merrill lynch', 'merrill'],
    'ubs wealth': ['ubs wealth management', 'ubs', 'ubs wealth', 'ubs financial'],
    'ameriprise': ['ameriprise financial ', 'ameriprise financial', 'ameriprise'], // Note space in first variation
    'finet': ['finet'],
    'j.p. morgan': ['j.p. morgan ', 'jpmorgan', 'jp morgan', 'j.p. morgan', 'jpm'], // Note space in first variation
    'rbc': ['rbc wealth', 'rbc'],
    'raymond james': ['raymond james'],
    'edward jones': ['raymond james'], // Map Edward Jones to Raymond James
    'stifel': ['raymond james'], // Map Stifel to Raymond James
    'rockefeller': ['rockefeller'],
    'sanctuary': ['sanctuary wealth', 'sanctuary'],
    'wells fargo': ['wells fargo', 'wf'],
    'tru': ['tru', 'truist'],
    'lpl financial': ['lpl financial', 'lpl', 'linsco']
  };
  
  // Get possible firm names in Airtable for the requested firm
  let possibleFirmNames: string[] = [];
  
  // Find the key in our mappings
  for (const [key, variations] of Object.entries(firmMappings)) {
    if (key === firmLower || variations.includes(firmLower)) {
      possibleFirmNames = variations;
      break;
    }
  }
  
  // If no mapping found, just use the original firm name
  if (possibleFirmNames.length === 0) {
    possibleFirmNames = [firmLower];
  }
  
  // Try each possible firm name and return the first match
  for (const possibleName of possibleFirmNames) {
    const param = params.find(p => 
      p && p.firm && p.paramName && 
      p.firm.toLowerCase().trim() === possibleName && 
      p.paramName.toLowerCase() === paramName.toLowerCase()
    );
    
    if (param) return param.paramValue;
  }
  
  // If we get here, no match was found
  return defaultValue;
}

/**
 * Helper function to get deal details for a specific firm
 * @param deals List of firm deals
 * @param firm Firm name
 */
export function getFirmDeal(
  deals: FirmDeal[] | undefined,
  firm: string
): FirmDeal | null {
  if (!deals) return null;
  
  // Handle different naming variations
  const firmLower = firm.toLowerCase().trim();
  
  // Define mappings from firm names to possible variations in Airtable
  const firmMappings: Record<string, string[]> = {
    'morgan stanley': ['morgan stanley', 'ms'],
    'merrill lynch': ['merrill lynch', 'merrill'],
    'ubs': ['ubs wealth management', 'ubs', 'ubs wealth', 'ubs financial'],
    'ameriprise': ['ameriprise financial ', 'ameriprise financial', 'ameriprise'], // Note space in first variation
    'finet': ['finet'],
    'j.p. morgan': ['j.p. morgan ', 'jpmorgan', 'jp morgan', 'j.p. morgan', 'jpm'], // Note space in first variation
    'rbc': ['rbc wealth', 'rbc'],
    'raymond james': ['raymond james'],
    'edward jones': ['raymond james'], // Map Edward Jones to Raymond James
    'stifel': ['raymond james'], // Map Stifel to Raymond James
    'rockefeller': ['rockefeller'],
    'sanctuary': ['sanctuary wealth', 'sanctuary'],
    'wells fargo': ['wells fargo', 'wf'],
    'tru': ['tru', 'truist'],
    'lpl financial': ['lpl financial', 'lpl', 'linsco']
  };
  
  // Get possible firm names in Airtable for the requested firm
  let possibleFirmNames: string[] = [];
  
  // Find the key in our mappings
  for (const [key, variations] of Object.entries(firmMappings)) {
    if (key === firmLower || variations.includes(firmLower)) {
      possibleFirmNames = variations;
      break;
    }
  }
  
  // If no mapping found, just use the original firm name
  if (possibleFirmNames.length === 0) {
    possibleFirmNames = [firmLower];
  }
  
  // Try each possible firm name and return the first match
  for (const possibleName of possibleFirmNames) {
    const deal = deals.find(d => d && d.firm && d.firm.toLowerCase().trim() === possibleName);
    if (deal) return deal;
  }
  
  // Special handling for specific firms if not found
  if (firmLower === 'morgan stanley' || firmLower === 'ms') {
    const deal = deals.find(d => d && d.firm && (d.firm.toLowerCase().includes('morgan') || d.firm.toLowerCase().includes('ms')));
    if (deal) return deal;
  }
  
  // If we get here, no match was found
  return null;
}

/**
 * Helper function to get profile details for a specific firm
 * @param profiles List of firm profiles
 * @param firm Firm name
 */
export function getFirmProfile(
  profiles: FirmProfile[] | undefined,
  firm: string
): FirmProfile | null {
  if (!profiles) return null;
  
  // Handle different naming variations
  const firmLower = firm.toLowerCase().trim();
  
  // Define mappings from firm names to possible variations in Airtable
  const firmMappings: Record<string, string[]> = {
    'morgan stanley': ['morgan stanley', 'ms'],
    'merrill lynch': ['merrill lynch', 'merrill'],
    'ubs': ['ubs wealth management', 'ubs', 'ubs wealth', 'ubs financial'],
    'ameriprise': ['ameriprise financial ', 'ameriprise financial', 'ameriprise'], // Note space in first variation
    'finet': ['finet'],
    'j.p. morgan': ['j.p. morgan ', 'jpmorgan', 'jp morgan', 'j.p. morgan', 'jpm'], // Note space in first variation
    'rbc': ['rbc wealth', 'rbc'],
    'raymond james': ['raymond james'],
    'edward jones': ['raymond james'], // Map Edward Jones to Raymond James
    'stifel': ['raymond james'], // Map Stifel to Raymond James
    'rockefeller': ['rockefeller'],
    'sanctuary': ['sanctuary wealth', 'sanctuary'],
    'wells fargo': ['wells fargo', 'wf'],
    'tru': ['tru', 'truist'],
    'lpl financial': ['lpl financial', 'lpl', 'linsco']
  };
  
  // Get possible firm names in Airtable for the requested firm
  let possibleFirmNames: string[] = [];
  
  // Find the key in our mappings
  for (const [key, variations] of Object.entries(firmMappings)) {
    if (key === firmLower || variations.includes(firmLower)) {
      possibleFirmNames = variations;
      break;
    }
  }
  
  // If no mapping found, just use the original firm name
  if (possibleFirmNames.length === 0) {
    possibleFirmNames = [firmLower];
  }
  
  // Try each possible firm name and return the first match
  for (const possibleName of possibleFirmNames) {
    const profile = profiles.find(p => p && p.firm && p.firm.toLowerCase().trim() === possibleName);
    if (profile) return profile;
  }
  
  // If no direct match found, try fuzzy matching
  return profiles.find(p => 
    p && p.firm && (
      p.firm.toLowerCase().includes(firmLower) || 
      firmLower.includes(p.firm.toLowerCase())
    )
  ) || null;
}