// Types
export interface AdvisorInfo {
  aum: number;
  revenue: number;
  feeBasedPercentage: number;
  city: string;
  state: string;
  currentFirm?: string;
  
  // Advanced variables for premium calculator
  deferredComp?: boolean;
  onADeal?: boolean;
  banking?: boolean;
  international?: boolean;
  internationalCountries?: string[];
  lending?: boolean;
  smas?: boolean;
  households?: number;
}

export interface ComparisonData {
  year: number;
  morganStanley: number;
  merrillLynch: number;
  ubsWealth: number;
  ameriprise: number;
  finet: number;
  independent: number;
  goldman?: number;
  jpm?: number;
  rbc?: number;
  raymondJames?: number;
  rockefeller?: number;
  sanctuary?: number;
  wellsFargo?: number;
  tru?: number;
  [key: string]: number | undefined;
}

export interface GuaranteedUpfront {
  morganStanley: number;
  merrillLynch: number;
  ubsWealth: number;
  ameriprise: number;
  finet: number;
  independent: number;
  goldman: number;
  jpm: number;
  rbc: number;
  raymondJames: number;
  rockefeller: number;
  sanctuary: number;
  wellsFargo: number;
  tru: number;
  [key: string]: number; // Allow for additional firms
}

export interface BackendBreakdown {
  growth: number;
  assets: number;
  lengthOfService: number;
}

export interface MetricData {
  totalDeal: {
    value: number;
    change: number;
    isUp: boolean;
    description: string;
  };
  recruitingRevenue: {
    value: number;
    change: number;
    isUp: boolean;
    description: string;
  };
  totalCompDelta: {
    value: number;
    description: string;
  };
}

export interface CalculatorResults {
  metrics: MetricData;
  comparisonData: ComparisonData[];
  guaranteedUpfront: GuaranteedUpfront;
  backendBreakdown: BackendBreakdown;
  isPaid: boolean;
}

// Import Airtable service for data
import { FirmDeal, FirmParameter, getParameterValue, getFirmDeal } from './airtable-service';

// Initial calculation logic that can use Airtable data if available
export function calculateOffers(
  info: AdvisorInfo, 
  firmParams?: FirmParameter[],
  firmDeals?: FirmDeal[], 
  selectedFirms?: string[],
  hasPremium?: boolean
): CalculatorResults {
  // Define deal variables at the top level to be available throughout the function
  let msDeal: FirmDeal | null = null;
  let mlDeal: FirmDeal | null = null;
  let ubsDeal: FirmDeal | null = null;
  let ameripriseDeal: FirmDeal | null = null;
  let finetDeal: FirmDeal | null = null;
  let indDeal: FirmDeal | null = null;
  // Convert string inputs to numbers and handle formatting
  const aum = parseFloat(String(info.aum).replace(/,/g, ''));
  const revenue = parseFloat(String(info.revenue).replace(/,/g, ''));
  const feeBasedPercentage = parseFloat(String(info.feeBasedPercentage));
  
  // Process premium variables if provided
  const hasDeferredComp = info.deferredComp || false;
  const isOnADeal = info.onADeal || false;
  const hasBanking = info.banking || false;
  const hasInternational = info.international || false;
  const internationalCountries = info.internationalCountries || [];
  const hasLending = info.lending || false;
  const hasSMAs = info.smas || false;
  const households = info.households || 0;
  
  // Calculate adjustments based on fee-based percentage
  // Apply fee-based adjustment: 85%+ gets +5% upfront/+10% backend, under 65% gets -5% for both
  let upfrontAdjustment = 0;
  let backendAdjustment = 0;
  
  if (feeBasedPercentage >= 85) {
    upfrontAdjustment = 0.05; // Add 5% to upfront if 85% or more fee-based
    backendAdjustment = 0.10; // Add 10% to backend if 85% or more fee-based
  } else if (feeBasedPercentage < 65) {
    upfrontAdjustment = -0.05; // Subtract 5% from upfront if less than 65% fee-based
    backendAdjustment = -0.05; // Subtract 5% from backend if less than 65% fee-based
  }
  
  // Get multipliers from Airtable parameters if available, otherwise use defaults
  const morganStanleyMultiplier = getParameterValue(firmParams, 'Morgan Stanley', 'multiplier', 2.5);
  const merrillLynchMultiplier = getParameterValue(firmParams, 'Merrill Lynch', 'multiplier', 2.0);
  const ubsWealthMultiplier = getParameterValue(firmParams, 'UBS Wealth', 'multiplier', 3.0);
  const ameriprise = getParameterValue(firmParams, 'Ameriprise', 'multiplier', 2.2);
  const finetMultiplier = getParameterValue(firmParams, 'Finet', 'multiplier', 2.0);
  const independentMultiplier = getParameterValue(firmParams, 'Independent', 'multiplier', 1.5);

  // Calculate guaranteed upfront payments with all zeros by default
  let guaranteedUpfront = {
    morganStanley: 0,
    merrillLynch: 0,
    ubsWealth: 0,
    ameriprise: 0,
    finet: 0,
    independent: 0,
    goldman: 0,
    jpm: 0,
    rbc: 0,
    raymondJames: 0,
    rockefeller: 0, 
    sanctuary: 0,
    wellsFargo: 0,
    tru: 0
  };

  // Create a map of all possible firm name variations to standardized names
  const firmNameMap: Record<string, string> = {
    'morgan stanley': 'morganStanley',
    'ms': 'morganStanley',
    'merrill lynch': 'merrillLynch',
    'merrill': 'merrillLynch',
    'ml': 'merrillLynch',
    'ubs wealth': 'ubsWealth',
    'ubs': 'ubsWealth',
    'ubs financial': 'ubsWealth',
    'ubs wealth management': 'ubsWealth',
    'ameriprise': 'ameriprise',
    'ameriprise financial': 'ameriprise',
    'ameriprise financial ': 'ameriprise', // Note space at end from Airtable
    'finet': 'finet',
    // Independent firms
    'lpl financial': 'independent',
    'lpl': 'independent',
    'linsco': 'independent',
    'independent': 'independent',
    // Goldman
    'goldman': 'goldman',
    'goldman sachs': 'goldman',
    'goldman sachs - custody': 'goldman',
    'gs': 'goldman',
    // JPM
    'jpm': 'jpm',
    'jpmorgan': 'jpm',
    'jp morgan': 'jpm',
    'j.p. morgan': 'jpm',
    'j.p. morgan ': 'jpm', // Note space at end from Airtable
    // RBC
    'rbc': 'rbc',
    'rbc wealth': 'rbc',
    // Raymond James and Edward Jones (both Regional)
    'raymond james': 'raymondJames',
    'rj': 'raymondJames',
    'edward jones': 'raymondJames', // Categorize as Raymond James
    'ed jones': 'raymondJames',     // Categorize as Raymond James
    'stifel': 'raymondJames',       // Categorize as Raymond James
    // Rockefeller
    'rockefeller': 'rockefeller',
    'rock': 'rockefeller',
    // Sanctuary
    'sanctuary': 'sanctuary',
    'sanctuary wealth': 'sanctuary',
    // Wells Fargo
    'wells fargo': 'wellsFargo',
    'wells': 'wellsFargo',
    'wf': 'wellsFargo',
    // Truist/TRU
    'tru': 'tru',
    'truist': 'tru'
  };
  
  // Get the standardized names of selected firms
  const selectedStandardFirms: Set<string> = new Set();
  if (selectedFirms && selectedFirms.length > 0) {
    selectedFirms.forEach(firm => {
      const firmLower = firm.toLowerCase();
      const standardName = firmNameMap[firmLower];
      if (standardName) {
        selectedStandardFirms.add(standardName);
      } else {
        // If not found in our map, use the original name
        selectedStandardFirms.add(firmLower);
      }
    });
  }
  
  // Check which firms to include based on standardized selection
  const includeMorganStanley = selectedStandardFirms.has('morganStanley');
  const includeMerrillLynch = selectedStandardFirms.has('merrillLynch');
  const includeUBS = selectedStandardFirms.has('ubsWealth');
  const includeAmeriprise = selectedStandardFirms.has('ameriprise');
  const includeFinet = selectedStandardFirms.has('finet');
  const includeIndependent = selectedStandardFirms.has('independent');
  const includeGoldman = selectedStandardFirms.has('goldman');
  const includeJPM = selectedStandardFirms.has('jpm');
  const includeRBC = selectedStandardFirms.has('rbc');
  const includeRaymondJames = selectedStandardFirms.has('raymondJames');
  const includeRockefeller = selectedStandardFirms.has('rockefeller');
  const includeSanctuary = selectedStandardFirms.has('sanctuary');
  const includeWellsFargo = selectedStandardFirms.has('wellsFargo');
  const includeTru = selectedStandardFirms.has('tru');

  // If we have firm deals from Airtable, use those values instead
  if (firmDeals && firmDeals.length > 0) {
    // Find the deals for each firm based on selection and our updated Airtable structure
    
    if (includeMorganStanley) {
      msDeal = getFirmDeal(firmDeals, 'Morgan Stanley');
    }
    
    if (includeMerrillLynch) {
      mlDeal = getFirmDeal(firmDeals, 'Merrill Lynch');
    }
    
    // For UBS, check for variations in naming that might be in the Airtable
    if (includeUBS) {
      ubsDeal = getFirmDeal(firmDeals, 'UBS Wealth') || 
                getFirmDeal(firmDeals, 'UBS') || 
                getFirmDeal(firmDeals, 'UBS Financial');
    }
    
    if (includeAmeriprise) {
      ameripriseDeal = getFirmDeal(firmDeals, 'Ameriprise');
    }
    
    if (includeFinet) {
      finetDeal = getFirmDeal(firmDeals, 'Finet');
    }
    
    // Load JP Morgan deal
    let jpmDeal = null;
    if (includeJPM) {
      jpmDeal = getFirmDeal(firmDeals, 'J.P. Morgan') || 
               getFirmDeal(firmDeals, 'JPMorgan') || 
               getFirmDeal(firmDeals, 'JP Morgan');
    }
    
    // Load RBC deal
    let rbcDeal = null;
    if (includeRBC) {
      rbcDeal = getFirmDeal(firmDeals, 'RBC');
    }
    
    // Load Raymond James deal
    let raymondJamesDeal = null;
    if (includeRaymondJames) {
      raymondJamesDeal = getFirmDeal(firmDeals, 'Raymond James');
    }
    
    // Load Rockefeller deal
    let rockefellerDeal = null;
    if (includeRockefeller) {
      rockefellerDeal = getFirmDeal(firmDeals, 'Rockefeller');
    }
    
    // Load Sanctuary deal
    let sanctuaryDeal = null;
    if (includeSanctuary) {
      sanctuaryDeal = getFirmDeal(firmDeals, 'Sanctuary');
    }
    
    // Load Wells Fargo deal
    let wellsFargoDeal = null;
    if (includeWellsFargo) {
      wellsFargoDeal = getFirmDeal(firmDeals, 'Wells Fargo');
    }
    
    // Load Truist deal
    let truDeal = null;
    if (includeTru) {
      truDeal = getFirmDeal(firmDeals, 'Truist') ||
               getFirmDeal(firmDeals, 'TRU') ||
               getFirmDeal(firmDeals, 'Tru');
    }
    
    // Reset values for firms not selected
    if (!includeMorganStanley) guaranteedUpfront.morganStanley = 0;
    if (!includeMerrillLynch) guaranteedUpfront.merrillLynch = 0;
    if (!includeUBS) guaranteedUpfront.ubsWealth = 0;
    if (!includeAmeriprise) guaranteedUpfront.ameriprise = 0;
    if (!includeFinet) guaranteedUpfront.finet = 0;
    if (!includeIndependent) guaranteedUpfront.independent = 0;
    
    // Use the fee-based adjustments already calculated above
    
    // Apply additional adjustments from premium variables
    // Define adjustment factors as constants
    const ADJUSTMENT_FACTORS = {
      BANKING: 0.02,
      INTERNATIONAL_BASE: 0.03,
      INTERNATIONAL_BONUS: 0.02,
      MULTIPLE_COUNTRIES: 0.01
    };

    // Apply adjustments with type safety
    if (hasBanking === true) {
      upfrontAdjustment += ADJUSTMENT_FACTORS.BANKING;
    }
    
    if (hasInternational === true) {
      upfrontAdjustment += ADJUSTMENT_FACTORS.INTERNATIONAL_BASE;
      
      // Additional bonus for multiple countries
      if (Array.isArray(internationalCountries) && internationalCountries.length > 3) {
        upfrontAdjustment += ADJUSTMENT_FACTORS.MULTIPLE_COUNTRIES;
      }
      upfrontAdjustment += 0.02; // Additional 2% for diverse international business
    }
    
    if (hasLending) {
      upfrontAdjustment += 0.02; // Add 2% for lending business
    }
    
    if (hasSMAs) {
      upfrontAdjustment += 0.02; // Add 2% for SMA usage
    }
    
    // Household count can affect pricing
    if (households > 100) {
      backendAdjustment += 0.03; // Add 3% to backend for large household count
    }
    
    // Deferred comp can reduce upfront offer
    if (hasDeferredComp) {
      upfrontAdjustment -= 0.03; // Reduce upfront by 3% if they have deferred comp
    }
    
    // Being on a deal can reduce offers
    if (isOnADeal) {
      upfrontAdjustment -= 0.05; // Reduce by 5% if already on a deal
      backendAdjustment -= 0.05;
    }
    
    // Calculate upfront offers using deal min/max values if available
    if (includeMorganStanley) {
      const adjustedRevenue = revenue / 1000000; // Convert to millions for deal calculation
      
      if (msDeal) {
        const baseUpfront = ((msDeal.upfrontMin + msDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.morganStanley = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.morganStanley = 1.75 * adjustedRevenue; // Use 175% of revenue as default
        console.log("Using fallback value for Morgan Stanley upfront:", guaranteedUpfront.morganStanley);
      }
    }
    
    if (includeMerrillLynch) {
      const adjustedRevenue = revenue / 1000000;
      
      if (mlDeal) {
        const baseUpfront = ((mlDeal.upfrontMin + mlDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.merrillLynch = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.merrillLynch = 1.70 * adjustedRevenue; // Use 170% of revenue as default
        console.log("Using fallback value for Merrill Lynch upfront:", guaranteedUpfront.merrillLynch);
      }
    }
    
    if (includeUBS) {
      const adjustedRevenue = revenue / 1000000;
      
      if (ubsDeal) {
        const baseUpfront = ((ubsDeal.upfrontMin + ubsDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.ubsWealth = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.ubsWealth = 1.85 * adjustedRevenue; // Use 185% of revenue as default
        console.log("Using fallback value for UBS upfront:", guaranteedUpfront.ubsWealth);
      }
    }
    
    if (includeIndependent) {
      const adjustedRevenue = revenue / 1000000;
      
      if (indDeal) {
        const baseUpfront = ((indDeal.upfrontMin + indDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.independent = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.independent = 0.25 * adjustedRevenue; // Use 25% of revenue as default
        console.log("Using fallback value for Independent upfront:", guaranteedUpfront.independent);
      }
    }
    
    if (includeAmeriprise) {
      const adjustedRevenue = revenue / 1000000;
      
      if (ameripriseDeal) {
        const baseUpfront = ((ameripriseDeal.upfrontMin + ameripriseDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.ameriprise = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.ameriprise = 1.20 * adjustedRevenue; // Use 120% of revenue as default
        console.log("Using fallback value for Ameriprise upfront:", guaranteedUpfront.ameriprise);
      }
    }
    
    if (includeFinet) {
      const adjustedRevenue = revenue / 1000000;
      
      if (finetDeal) {
        const baseUpfront = ((finetDeal.upfrontMin + finetDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.finet = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.finet = 0.40 * adjustedRevenue; // Use 40% of revenue as default
        console.log("Using fallback value for Finet upfront:", guaranteedUpfront.finet);
      }
    }
    
    // Calculate upfront values for additional firms
    
    // JP Morgan
    if (includeJPM) {
      const adjustedRevenue = revenue / 1000000;
      
      if (jpmDeal) {
        const baseUpfront = ((jpmDeal.upfrontMin + jpmDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.jpm = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.jpm = 1.80 * adjustedRevenue; // Use 180% of revenue as default
        console.log("Using fallback value for JPMorgan upfront:", guaranteedUpfront.jpm);
      }
    }
    
    // RBC
    if (includeRBC) {
      const adjustedRevenue = revenue / 1000000;
      
      if (rbcDeal) {
        const baseUpfront = ((rbcDeal.upfrontMin + rbcDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.rbc = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.rbc = 1.50 * adjustedRevenue; // Use 150% of revenue as default
        console.log("Using fallback value for RBC upfront:", guaranteedUpfront.rbc);
      }
    }
    
    // Raymond James
    if (includeRaymondJames) {
      const adjustedRevenue = revenue / 1000000;
      
      if (raymondJamesDeal) {
        const baseUpfront = ((raymondJamesDeal.upfrontMin + raymondJamesDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.raymondJames = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.raymondJames = 1.00 * adjustedRevenue; // Use 100% of revenue as default
        console.log("Using fallback value for Raymond James upfront:", guaranteedUpfront.raymondJames);
      }
    }
    
    // Rockefeller
    if (includeRockefeller) {
      const adjustedRevenue = revenue / 1000000;
      
      if (rockefellerDeal) {
        const baseUpfront = ((rockefellerDeal.upfrontMin + rockefellerDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.rockefeller = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.rockefeller = 1.60 * adjustedRevenue; // Use 160% of revenue as default
        console.log("Using fallback value for Rockefeller upfront:", guaranteedUpfront.rockefeller);
      }
    }
    
    // Sanctuary
    if (includeSanctuary) {
      const adjustedRevenue = revenue / 1000000;
      
      if (sanctuaryDeal) {
        const baseUpfront = ((sanctuaryDeal.upfrontMin + sanctuaryDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.sanctuary = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.sanctuary = 0.60 * adjustedRevenue; // Use 60% of revenue as default
        console.log("Using fallback value for Sanctuary upfront:", guaranteedUpfront.sanctuary);
      }
    }
    
    // Wells Fargo
    if (includeWellsFargo) {
      const adjustedRevenue = revenue / 1000000;
      
      if (wellsFargoDeal) {
        const baseUpfront = ((wellsFargoDeal.upfrontMin + wellsFargoDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.wellsFargo = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.wellsFargo = 1.50 * adjustedRevenue; // Use 150% of revenue as default
        console.log("Using fallback value for Wells Fargo upfront:", guaranteedUpfront.wellsFargo);
      }
    }
    
    // Truist
    if (includeTru) {
      const adjustedRevenue = revenue / 1000000;
      
      if (truDeal) {
        const baseUpfront = ((truDeal.upfrontMin + truDeal.upfrontMax) / 2);
        const adjustedUpfront = baseUpfront * (1 + upfrontAdjustment);
        guaranteedUpfront.tru = adjustedUpfront * adjustedRevenue;
      } else {
        // Fallback if no deal is found
        guaranteedUpfront.tru = 0.60 * adjustedRevenue; // Use 60% of revenue as default
        console.log("Using fallback value for Truist upfront:", guaranteedUpfront.tru);
      }
    }
    
    // If user selected specific firms, only include those exact firms
    if (selectedFirms && selectedFirms.length > 0) {
      firmDeals.forEach(deal => {
        if (selectedFirms.some(f => f.toLowerCase() === deal.firm.toLowerCase())) {
          const adjustedRevenue = revenue / 1000000;
          const upfrontValue = ((deal.upfrontMin + deal.upfrontMax) / 2) * adjustedRevenue;
          
          // Map to our standard firm categories
          const firmLower = deal.firm.toLowerCase();
          if (firmLower.includes('morgan') || firmLower.includes('ms')) {
            guaranteedUpfront.morganStanley = upfrontValue;
          } else if (firmLower.includes('merrill') || firmLower.includes('ml')) {
            guaranteedUpfront.merrillLynch = upfrontValue;
          } else if (firmLower.includes('ubs')) {
            guaranteedUpfront.ubsWealth = upfrontValue;
          } else if (firmLower.includes('ameriprise')) {
            guaranteedUpfront.ameriprise = upfrontValue;
          } else if (firmLower.includes('finet')) {
            guaranteedUpfront.finet = upfrontValue;
          } else if (firmLower.includes('edward jones') || firmLower.includes('ed jones')) {
            // Edward Jones is a Regional firm, matching to Raymond James
            guaranteedUpfront.raymondJames = upfrontValue;
          } else if (firmLower === 'tru' || firmLower.includes('truist')) {
            // tru should be its own category
            guaranteedUpfront.tru = upfrontValue;
          } else if (firmLower.includes('stifel')) {
            // Stifel is a Regional firm, matching to Raymond James
            guaranteedUpfront.raymondJames = upfrontValue;
          } else if (firmLower.includes('sanctuary')) {
            // Sanctuary should be its own category
            guaranteedUpfront.sanctuary = upfrontValue;
          } else if (firmLower.includes('rockefeller')) {
            // Rockefeller should be its own category
            guaranteedUpfront.rockefeller = upfrontValue;
          } else if (firmLower.includes('rbc')) {
            // RBC should be its own category
            guaranteedUpfront.rbc = upfrontValue;
          } else if (firmLower.includes('jpm') || firmLower.includes('jpmorgan') || firmLower.includes('j.p. morgan')) {
            // JPM should be its own category
            guaranteedUpfront.jpm = upfrontValue;
          } else {
            // All other firms go into the independent bucket
            guaranteedUpfront.independent = upfrontValue;
          }
        }
      });
    }
  }

  // Get the number of years to display from parameters or use default of 10 years
  const yearsToDisplay = Math.round(getParameterValue(firmParams, 'Global', 'yearsToDisplay', 10));
  
  // Generate comparison data for specified number of years
  const comparisonData: ComparisonData[] = [];
  
  // Get current grid payout percentage (typically 50%) - this is what they get at their current firm
  const currentGridPayout = getParameterValue(firmParams, 'Global', 'currentGridPayout', 0.5);
  
  // Get new grid payout percentage after moving (typically 52%)
  const newGridPayout = getParameterValue(firmParams, 'Global', 'newGridPayout', 0.52);
  
  // Annual growth rate (typically 8%)
  const annualGrowthRate = getParameterValue(firmParams, 'Global', 'annualGrowthRate', 0.08);
  
  // Each firm has a different trajectory over the years
  // Year 1: upfront + grid
  // Year 2: backend + grid + 8% growth
  // Year 3+: previous year grid + 8% growth
  
  // Helper function to handle firm-specific upfront value overrides
  function handleFirmOverrides(firmName: string, currentValue: number): number {
    const revenueInMillions = revenue / 1000000;
    
    switch(firmName.toLowerCase()) {
      case 'sanctuary':
      case 'sanctuary wealth':
        // Set Sanctuary to 60% upfront as required
        return 0.60 * revenueInMillions;
      case 'tru':
      case 'truist':
        // Set tru to 60% upfront as required
        return 0.60 * revenueInMillions;
      case 'stifel':
        // Map Stifel to Raymond James (Regional)
        return guaranteedUpfront.raymondJames;
      case 'edward jones':
      case 'ed jones':
        // Map Edward Jones to Raymond James (Regional)
        return guaranteedUpfront.raymondJames;
      default:
        return currentValue;
    }
  }
  
  // Apply any firm-specific overrides to guaranteedUpfront values
  guaranteedUpfront.sanctuary = handleFirmOverrides('sanctuary', guaranteedUpfront.sanctuary);
  guaranteedUpfront.tru = handleFirmOverrides('tru', guaranteedUpfront.tru);
  
  // Apply fallback values for ALL firms regardless of include flags
  // This is critical because the selectedFirms might not match our internal names
  const adjustedRevenue = revenue / 1000000;
  
  // Apply fallbacks for all major firms if they're missing or 0
  if (!guaranteedUpfront.morganStanley) {
    guaranteedUpfront.morganStanley = 1.60 * adjustedRevenue; // 160% of revenue
    console.log("Fallback applied for Morgan Stanley:", guaranteedUpfront.morganStanley);
  }
  
  if (!guaranteedUpfront.merrillLynch) {
    guaranteedUpfront.merrillLynch = 1.70 * adjustedRevenue; // 170% of revenue
    console.log("Fallback applied for Merrill Lynch:", guaranteedUpfront.merrillLynch);
  }
  
  if (!guaranteedUpfront.ubsWealth) {
    guaranteedUpfront.ubsWealth = 1.85 * adjustedRevenue; // 185% of revenue
    console.log("Fallback applied for UBS:", guaranteedUpfront.ubsWealth);
  }
  
  if (!guaranteedUpfront.ameriprise) {
    guaranteedUpfront.ameriprise = 1.20 * adjustedRevenue; // 120% of revenue
    console.log("Fallback applied for Ameriprise:", guaranteedUpfront.ameriprise);
  }
  
  if (!guaranteedUpfront.finet) {
    guaranteedUpfront.finet = 0.40 * adjustedRevenue; // 40% of revenue
    console.log("Fallback applied for Finet:", guaranteedUpfront.finet);
  }
  
  if (!guaranteedUpfront.independent) {
    guaranteedUpfront.independent = 0.25 * adjustedRevenue; // 25% of revenue
    console.log("Fallback applied for Independent:", guaranteedUpfront.independent);
  }
  
  if (!guaranteedUpfront.goldman) {
    guaranteedUpfront.goldman = 1.90 * adjustedRevenue; // 190% of revenue
    console.log("Fallback applied for Goldman Sachs:", guaranteedUpfront.goldman);
  }
  
  if (!guaranteedUpfront.jpm) {
    guaranteedUpfront.jpm = 1.80 * adjustedRevenue; // 180% of revenue
    console.log("Fallback applied for JPMorgan:", guaranteedUpfront.jpm);
  }
  
  if (!guaranteedUpfront.rbc) {
    guaranteedUpfront.rbc = 1.50 * adjustedRevenue; // 150% of revenue
    console.log("Fallback applied for RBC:", guaranteedUpfront.rbc);
  }
  
  if (!guaranteedUpfront.raymondJames) {
    guaranteedUpfront.raymondJames = 1.00 * adjustedRevenue; // 100% of revenue
    console.log("Fallback applied for Raymond James:", guaranteedUpfront.raymondJames);
  }
  
  if (!guaranteedUpfront.rockefeller) {
    guaranteedUpfront.rockefeller = 1.60 * adjustedRevenue; // 160% of revenue
    console.log("Fallback applied for Rockefeller:", guaranteedUpfront.rockefeller);
  }
  
  if (!guaranteedUpfront.sanctuary) {
    guaranteedUpfront.sanctuary = 0.60 * adjustedRevenue; // 60% of revenue
    console.log("Fallback applied for Sanctuary:", guaranteedUpfront.sanctuary);
  }
  
  if (!guaranteedUpfront.wellsFargo) {
    guaranteedUpfront.wellsFargo = 1.50 * adjustedRevenue; // 150% of revenue
    console.log("Fallback applied for Wells Fargo:", guaranteedUpfront.wellsFargo);
  }
  
  if (!guaranteedUpfront.tru) {
    guaranteedUpfront.tru = 0.60 * adjustedRevenue; // 60% of revenue
    console.log("Fallback applied for Truist:", guaranteedUpfront.tru);
  }
  
  console.log("Final guaranteed upfront values:", guaranteedUpfront);
  
  // For each year in the comparative grid
  for (let year = 1; year <= yearsToDisplay; year++) {
    const yearData: ComparisonData = { year } as ComparisonData;
    let baseRevenueForYear = revenue;
    
    // Apply growth to revenue for years after year 1
    if (year > 1) {
      // Compound growth: revenue * (1 + growth)^(year-1)
      baseRevenueForYear = revenue * Math.pow(1 + annualGrowthRate, year - 1);
    }
    
    // Calculate grid payout for this year based on the increased revenue
    const gridPayoutForYear = baseRevenueForYear * newGridPayout;
    
    // We'll calculate values for all firms, not just selected ones
    // This ensures the chart always has data to display

    // Morgan Stanley
    if (year === 1) {
      // Year 1: Upfront payment + grid payout
      yearData.morganStanley = guaranteedUpfront.morganStanley + (gridPayoutForYear / 1000000);
    } else if (year === 2) {
      // Year 2: Backend payment + grid payout
      // Get base backend value
      const baseBackend = msDeal ? ((msDeal.backendMin + msDeal.backendMax) / 2) : 0.3 * (revenue / 1000000);
      
      // Apply fee-based adjustment: 85%+ gets +10% backend, under 65% gets -5%
      let backendMultiplier = 1.0; // Default: no adjustment
      if (feeBasedPercentage >= 85) {
        backendMultiplier = 1.10; // Add 10% to backend if 85% or more fee-based
      } else if (feeBasedPercentage < 65) {
        backendMultiplier = 0.95; // Subtract 5% from backend if less than 65% fee-based
      }
      
      // Apply adjustment to deferred comp
      if (hasDeferredComp) {
        backendMultiplier *= 0.97; // Reduce by 3% if they have deferred comp
      }
      
      // Being on a deal reduces offers
      if (isOnADeal) {
        backendMultiplier *= 0.95; // Reduce by 5% if already on a deal
      }
      
      // Additional bonus for large household count
      if (households > 100) {
        backendMultiplier *= 1.03; // Add 3% for large household count
      }
      
      const adjustedBackend = baseBackend * backendMultiplier;
      const backendPayment = adjustedBackend * (revenue / 1000000);
      yearData.morganStanley = backendPayment + (gridPayoutForYear / 1000000);
    } else {
      // Year 3+: Just grid payout with growth
      yearData.morganStanley = gridPayoutForYear / 1000000;
    }
    
    // If not selected and we want to hide it, set to 0
    if (!includeMorganStanley && selectedFirms && selectedFirms.length > 0) {
      yearData.morganStanley = 0;
    }
    
    if (includeMerrillLynch) {
      if (year === 1) {
        // Year 1: Upfront payment + grid payout
        yearData.merrillLynch = guaranteedUpfront.merrillLynch + (gridPayoutForYear / 1000000);
      } else if (year === 2) {
        // Year 2: Backend payment + grid payout
        // Get base backend value
        const baseBackend = mlDeal ? ((mlDeal.backendMin + mlDeal.backendMax) / 2) : 0;
        
        // Apply fee-based adjustment: 85%+ gets +10% backend, under 65% gets -5%
        let backendMultiplier = 1.0; // Default: no adjustment
        if (feeBasedPercentage >= 85) {
          backendMultiplier = 1.10; // Add 10% to backend if 85% or more fee-based
        } else if (feeBasedPercentage < 65) {
          backendMultiplier = 0.95; // Subtract 5% from backend if less than 65% fee-based
        }
        
        // Apply adjustment to deferred comp
        if (hasDeferredComp) {
          backendMultiplier *= 0.97; // Reduce by 3% if they have deferred comp
        }
        
        // Being on a deal reduces offers
        if (isOnADeal) {
          backendMultiplier *= 0.95; // Reduce by 5% if already on a deal
        }
        
        // Additional bonus for large household count
        if (households > 100) {
          backendMultiplier *= 1.03; // Add 3% for large household count
        }
        
        const adjustedBackend = baseBackend * backendMultiplier;
        const backendPayment = adjustedBackend * (revenue / 1000000);
        yearData.merrillLynch = backendPayment + (gridPayoutForYear / 1000000);
      } else {
        // Year 3+: Just grid payout with growth
        yearData.merrillLynch = gridPayoutForYear / 1000000;
      }
    } else {
      yearData.merrillLynch = 0;
    }
    
    if (includeUBS) {
      if (year === 1) {
        // Year 1: Upfront payment + grid payout
        yearData.ubsWealth = guaranteedUpfront.ubsWealth + (gridPayoutForYear / 1000000);
      } else if (year === 2) {
        // Year 2: Backend payment + grid payout
        // Get base backend value
        const baseBackend = ubsDeal ? ((ubsDeal.backendMin + ubsDeal.backendMax) / 2) : 0;
        
        // Apply fee-based adjustment: 85%+ gets +10% backend, under 65% gets -5%
        let backendMultiplier = 1.0; // Default: no adjustment
        if (feeBasedPercentage >= 85) {
          backendMultiplier = 1.10; // Add 10% to backend if 85% or more fee-based
        } else if (feeBasedPercentage < 65) {
          backendMultiplier = 0.95; // Subtract 5% from backend if less than 65% fee-based
        }
        
        // Apply adjustment to deferred comp
        if (hasDeferredComp) {
          backendMultiplier *= 0.97; // Reduce by 3% if they have deferred comp
        }
        
        // Being on a deal reduces offers
        if (isOnADeal) {
          backendMultiplier *= 0.95; // Reduce by 5% if already on a deal
        }
        
        // Additional bonus for large household count
        if (households > 100) {
          backendMultiplier *= 1.03; // Add 3% for large household count
        }
        
        const adjustedBackend = baseBackend * backendMultiplier;
        const backendPayment = adjustedBackend * (revenue / 1000000);
        yearData.ubsWealth = backendPayment + (gridPayoutForYear / 1000000);
      } else {
        // Year 3+: Just grid payout with growth
        yearData.ubsWealth = gridPayoutForYear / 1000000;
      }
    } else {
      yearData.ubsWealth = 0;
    }
    
    // Ameriprise
    if (year === 1) {
      // Year 1: Upfront payment + grid payout
      const ameripriseGridPayout = baseRevenueForYear * 0.75; // Ameriprise typically gets ~75% payout
      yearData.ameriprise = guaranteedUpfront.ameriprise + (ameripriseGridPayout / 1000000);
      console.log(`Ameriprise Year ${year} value: ${yearData.ameriprise}`);
    } else if (year === 2) {
      // Year 2: Backend payment + grid payout
      const backendPayment = ameripriseDeal 
        ? ((ameripriseDeal.backendMin + ameripriseDeal.backendMax) / 2) * (revenue / 1000000) 
        : 0.3 * (revenue / 1000000); // Use real deal data or estimate
      const ameripriseGridPayout = baseRevenueForYear * 0.75;
      yearData.ameriprise = backendPayment + (ameripriseGridPayout / 1000000);
      console.log(`Ameriprise Year ${year} value: ${yearData.ameriprise}`);
    } else {
      // Year 3+: Just grid payout with growth
      const ameripriseGridPayout = baseRevenueForYear * 0.75;
      yearData.ameriprise = ameripriseGridPayout / 1000000;
      console.log(`Ameriprise Year ${year} value: ${yearData.ameriprise}`);
    }
    
    // If not selected and we want to hide it, set to 0
    if (!includeAmeriprise && selectedFirms && selectedFirms.length > 0) {
      yearData.ameriprise = 0;
      console.log(`Ameriprise Year ${year} set to 0 because includeAmeriprise=${includeAmeriprise}`);
    }

    // Finet
    if (year === 1) {
      // Year 1: Upfront payment + grid payout
      const finetGridPayout = baseRevenueForYear * 0.85; // Finet typically gets ~85% payout
      yearData.finet = guaranteedUpfront.finet + (finetGridPayout / 1000000);
    } else if (year === 2) {
      // Year 2: Backend payment + grid payout
      const backendPayment = finetDeal 
        ? ((finetDeal.backendMin + finetDeal.backendMax) / 2) * (revenue / 1000000) 
        : 0.25 * (revenue / 1000000); // Use real deal data or estimate
      const finetGridPayout = baseRevenueForYear * 0.85;
      yearData.finet = backendPayment + (finetGridPayout / 1000000);
    } else {
      // Year 3+: Just grid payout with growth
      const finetGridPayout = baseRevenueForYear * 0.85;
      yearData.finet = finetGridPayout / 1000000;
    }
    
    // If not selected and we want to hide it, set to 0
    if (!includeFinet && selectedFirms && selectedFirms.length > 0) {
      yearData.finet = 0;
    }
    
    if (includeIndependent) {
      if (year === 1) {
        // Year 1: Upfront payment + grid payout (typically higher at independent firms)
        const independentGridPayout = baseRevenueForYear * 0.8; // Independent typically get ~80% payout
        yearData.independent = guaranteedUpfront.independent + (independentGridPayout / 1000000);
      } else if (year === 2) {
        // Year 2: Backend payment + grid payout
        const backendPayment = indDeal ? ((indDeal.backendMin + indDeal.backendMax) / 2) * (revenue / 1000000) : 0;
        const independentGridPayout = baseRevenueForYear * 0.8;
        yearData.independent = backendPayment + (independentGridPayout / 1000000);
      } else {
        // Year 3+: Just grid payout with growth (higher at independent)
        const independentGridPayout = baseRevenueForYear * 0.8;
        yearData.independent = independentGridPayout / 1000000;
      }
    } else {
      yearData.independent = 0;
    }
    
    // Add Goldman Sachs calculations
    if (includeGoldman) {
      if (year === 1) {
        const goldmanGridPayout = baseRevenueForYear * 0.50; // Assuming 50% payout
        yearData.goldman = guaranteedUpfront.goldman + (goldmanGridPayout / 1000000);
      } else if (year === 2) {
        // Assuming similar backend to other wirehouses
        const backendPayment = 0.3 * (revenue / 1000000);
        const goldmanGridPayout = baseRevenueForYear * 0.50;
        yearData.goldman = backendPayment + (goldmanGridPayout / 1000000);
      } else {
        const goldmanGridPayout = baseRevenueForYear * 0.50;
        yearData.goldman = goldmanGridPayout / 1000000;
      }
    } else {
      yearData.goldman = 0;
    }
    
    // Add JPM calculations
    if (includeJPM) {
      // Find JPM deal from firmDeals array if available
      const jpmDeal = firmDeals?.find(deal => 
        deal.firm.toLowerCase() === 'jpmorgan' ||
        deal.firm.toLowerCase() === 'jp morgan' ||
        deal.firm.toLowerCase() === 'j.p. morgan' ||
        deal.firm.toLowerCase() === 'jpm'
      );
      
      if (year === 1) {
        const jpmGridPayout = baseRevenueForYear * 0.48; // Assuming 48% payout
        yearData.jpm = guaranteedUpfront.jpm + (jpmGridPayout / 1000000);
      } else if (year === 2) {
        // Year 2: Backend payment + grid payout
        // Get base backend value
        const baseBackend = jpmDeal ? ((jpmDeal.backendMin + jpmDeal.backendMax) / 2) : 0;
        
        // Apply fee-based adjustment: 85%+ gets +10% backend, under 65% gets -5%
        let backendMultiplier = 1.0; // Default: no adjustment
        if (feeBasedPercentage >= 85) {
          backendMultiplier = 1.10; // Add 10% to backend if 85% or more fee-based
        } else if (feeBasedPercentage < 65) {
          backendMultiplier = 0.95; // Subtract 5% from backend if less than 65% fee-based
        }
        
        // Apply adjustment to deferred comp
        if (hasDeferredComp) {
          backendMultiplier *= 0.97; // Reduce by 3% if they have deferred comp
        }
        
        // Being on a deal reduces offers
        if (isOnADeal) {
          backendMultiplier *= 0.95; // Reduce by 5% if already on a deal
        }
        
        // Additional bonus for large household count
        if (households > 100) {
          backendMultiplier *= 1.03; // Add 3% for large household count
        }
        
        const adjustedBackend = baseBackend * backendMultiplier;
        const backendPayment = adjustedBackend * (revenue / 1000000);
        const jpmGridPayout = baseRevenueForYear * 0.48;
        yearData.jpm = backendPayment + (jpmGridPayout / 1000000);
      } else {
        const jpmGridPayout = baseRevenueForYear * 0.48;
        yearData.jpm = jpmGridPayout / 1000000;
      }
    } else {
      yearData.jpm = 0;
    }
    
    // Add RBC calculations
    if (includeRBC) {
      if (year === 1) {
        const rbcGridPayout = baseRevenueForYear * 0.55; // Assuming 55% payout
        yearData.rbc = guaranteedUpfront.rbc + (rbcGridPayout / 1000000);
      } else if (year === 2) {
        const backendPayment = 0.3 * (revenue / 1000000);
        const rbcGridPayout = baseRevenueForYear * 0.55;
        yearData.rbc = backendPayment + (rbcGridPayout / 1000000);
      } else {
        const rbcGridPayout = baseRevenueForYear * 0.55;
        yearData.rbc = rbcGridPayout / 1000000;
      }
    } else {
      yearData.rbc = 0;
    }
    
    // Add Raymond James calculations
    if (includeRaymondJames) {
      if (year === 1) {
        const rjGridPayout = baseRevenueForYear * 0.55; // Assuming 55% payout
        yearData.raymondJames = guaranteedUpfront.raymondJames + (rjGridPayout / 1000000);
      } else if (year === 2) {
        const backendPayment = 0.3 * (revenue / 1000000);
        const rjGridPayout = baseRevenueForYear * 0.55;
        yearData.raymondJames = backendPayment + (rjGridPayout / 1000000);
      } else {
        const rjGridPayout = baseRevenueForYear * 0.55;
        yearData.raymondJames = rjGridPayout / 1000000;
      }
    } else {
      yearData.raymondJames = 0;
    }
    
    // Add Rockefeller calculations
    if (includeRockefeller) {
      if (year === 1) {
        const rockGridPayout = baseRevenueForYear * 0.50; // Assuming 50% payout
        yearData.rockefeller = guaranteedUpfront.rockefeller + (rockGridPayout / 1000000);
      } else if (year === 2) {
        const backendPayment = 0.3 * (revenue / 1000000);
        const rockGridPayout = baseRevenueForYear * 0.50;
        yearData.rockefeller = backendPayment + (rockGridPayout / 1000000);
      } else {
        const rockGridPayout = baseRevenueForYear * 0.50;
        yearData.rockefeller = rockGridPayout / 1000000;
      }
    } else {
      yearData.rockefeller = 0;
    }
    
    // Add Sanctuary calculations
    if (includeSanctuary) {
      if (year === 1) {
        const sanctuaryGridPayout = baseRevenueForYear * 0.60; // Assuming 60% payout
        yearData.sanctuary = guaranteedUpfront.sanctuary + (sanctuaryGridPayout / 1000000);
      } else if (year === 2) {
        const backendPayment = 0.3 * (revenue / 1000000);
        const sanctuaryGridPayout = baseRevenueForYear * 0.60;
        yearData.sanctuary = backendPayment + (sanctuaryGridPayout / 1000000);
      } else {
        const sanctuaryGridPayout = baseRevenueForYear * 0.60;
        yearData.sanctuary = sanctuaryGridPayout / 1000000;
      }
    } else {
      yearData.sanctuary = 0;
    }
    
    // Add Wells Fargo calculations
    if (includeWellsFargo) {
      if (year === 1) {
        const wfGridPayout = baseRevenueForYear * 0.50; // Assuming 50% payout
        yearData.wellsFargo = guaranteedUpfront.wellsFargo + (wfGridPayout / 1000000);
      } else if (year === 2) {
        const backendPayment = 0.3 * (revenue / 1000000);
        const wfGridPayout = baseRevenueForYear * 0.50;
        yearData.wellsFargo = backendPayment + (wfGridPayout / 1000000);
      } else {
        const wfGridPayout = baseRevenueForYear * 0.50;
        yearData.wellsFargo = wfGridPayout / 1000000;
      }
    } else {
      yearData.wellsFargo = 0;
    }
    
    // Add Truist calculations
    if (includeTru) {
      if (year === 1) {
        const truGridPayout = baseRevenueForYear * 0.45; // Assuming 45% payout
        yearData.tru = guaranteedUpfront.tru + (truGridPayout / 1000000);
      } else if (year === 2) {
        const backendPayment = 0.3 * (revenue / 1000000);
        const truGridPayout = baseRevenueForYear * 0.45;
        yearData.tru = backendPayment + (truGridPayout / 1000000);
      } else {
        const truGridPayout = baseRevenueForYear * 0.45;
        yearData.tru = truGridPayout / 1000000;
      }
    } else {
      yearData.tru = 0;
    }
    
    comparisonData.push(yearData);
  }

  // Calculate total deal value (sum of all years) for best offer
  // Log the yearly data for each firm to verify correct calculation
  console.log("Year-by-year data:", comparisonData);
  
  const morganStanleyTotal = comparisonData.reduce((sum, year) => sum + year.morganStanley, 0);
  console.log("Morgan Stanley yearly values:", comparisonData.map(year => ({year: year.year, value: year.morganStanley})));
  console.log("Morgan Stanley Total:", morganStanleyTotal);
  
  const merrillLynchTotal = comparisonData.reduce((sum, year) => sum + year.merrillLynch, 0);
  console.log("Merrill Lynch yearly values:", comparisonData.map(year => ({year: year.year, value: year.merrillLynch})));
  console.log("Merrill Lynch Total:", merrillLynchTotal);
  
  const ubsWealthTotal = comparisonData.reduce((sum, year) => sum + year.ubsWealth, 0);
  console.log("UBS Wealth yearly values:", comparisonData.map(year => ({year: year.year, value: year.ubsWealth})));
  console.log("UBS Wealth Total:", ubsWealthTotal);
  
  const ameripriseTotal = comparisonData.reduce((sum, year) => sum + year.ameriprise, 0);
  console.log("Ameriprise yearly values:", comparisonData.map(year => ({year: year.year, value: year.ameriprise})));
  console.log("Ameriprise Total:", ameripriseTotal);
  
  const finetTotal = comparisonData.reduce((sum, year) => sum + year.finet, 0);
  console.log("Finet yearly values:", comparisonData.map(year => ({year: year.year, value: year.finet})));
  console.log("Finet Total:", finetTotal);
  
  const independentTotal = comparisonData.reduce((sum, year) => sum + year.independent, 0);
  console.log("Independent yearly values:", comparisonData.map(year => ({year: year.year, value: year.independent})));
  console.log("Independent Total:", independentTotal);
  
  // Calculate totals for the additional firms
  const goldmanTotal = comparisonData.reduce((sum, year) => sum + (year.goldman || 0), 0);
  console.log("Goldman Sachs yearly values:", comparisonData.map(year => ({year: year.year, value: year.goldman || 0})));
  console.log("Goldman Sachs Total:", goldmanTotal);
  
  const jpmTotal = comparisonData.reduce((sum, year) => sum + (year.jpm || 0), 0);
  console.log("JPMorgan yearly values:", comparisonData.map(year => ({year: year.year, value: year.jpm || 0})));
  console.log("JPMorgan Total:", jpmTotal);
  
  const rbcTotal = comparisonData.reduce((sum, year) => sum + (year.rbc || 0), 0);
  console.log("RBC yearly values:", comparisonData.map(year => ({year: year.year, value: year.rbc || 0})));
  console.log("RBC Total:", rbcTotal);
  
  const raymondJamesTotal = comparisonData.reduce((sum, year) => sum + (year.raymondJames || 0), 0);
  console.log("Raymond James yearly values:", comparisonData.map(year => ({year: year.year, value: year.raymondJames || 0})));
  console.log("Raymond James Total:", raymondJamesTotal);
  
  const rockefellerTotal = comparisonData.reduce((sum, year) => sum + (year.rockefeller || 0), 0);
  console.log("Rockefeller yearly values:", comparisonData.map(year => ({year: year.year, value: year.rockefeller || 0})));
  console.log("Rockefeller Total:", rockefellerTotal);
  
  const sanctuaryTotal = comparisonData.reduce((sum, year) => sum + (year.sanctuary || 0), 0);
  console.log("Sanctuary yearly values:", comparisonData.map(year => ({year: year.year, value: year.sanctuary || 0})));
  console.log("Sanctuary Total:", sanctuaryTotal);
  
  const wellsFargoTotal = comparisonData.reduce((sum, year) => sum + (year.wellsFargo || 0), 0);
  console.log("Wells Fargo yearly values:", comparisonData.map(year => ({year: year.year, value: year.wellsFargo || 0})));
  console.log("Wells Fargo Total:", wellsFargoTotal);
  
  const truTotal = comparisonData.reduce((sum, year) => sum + (year.tru || 0), 0);
  console.log("Truist yearly values:", comparisonData.map(year => ({year: year.year, value: year.tru || 0})));
  console.log("Truist Total:", truTotal);
  
  // Only include selected firms in the best deal calculation (and ensure no null values)
  let selectedFirmTotals: number[] = [];
  
  // Helper function to safely add value to array (skip null/undefined/NaN)
  const safelyAddTotal = (value: number) => {
    if (value !== null && value !== undefined && !isNaN(value)) {
      selectedFirmTotals.push(value);
    } else {
      console.log("Skipping invalid value in selectedFirmTotals:", value);
    }
  };
  
  // Add totals for selected firms, with safety checks
  if (includeMorganStanley) safelyAddTotal(morganStanleyTotal);
  if (includeMerrillLynch) safelyAddTotal(merrillLynchTotal); 
  if (includeUBS) safelyAddTotal(ubsWealthTotal);
  if (includeAmeriprise) safelyAddTotal(ameripriseTotal);
  if (includeFinet) safelyAddTotal(finetTotal);
  if (includeIndependent) safelyAddTotal(independentTotal);
  if (includeGoldman) safelyAddTotal(goldmanTotal);
  if (includeJPM) safelyAddTotal(jpmTotal);
  if (includeRBC) safelyAddTotal(rbcTotal);
  if (includeRaymondJames) safelyAddTotal(raymondJamesTotal);
  if (includeRockefeller) safelyAddTotal(rockefellerTotal);
  if (includeSanctuary) safelyAddTotal(sanctuaryTotal);
  if (includeWellsFargo) safelyAddTotal(wellsFargoTotal);
  if (includeTru) safelyAddTotal(truTotal);
  
  console.log("Filtered selectedFirmTotals:", selectedFirmTotals);
  
  // If no valid firms selected, use fallback values
  if (selectedFirmTotals.length === 0) {
    // Add some fallback values from our guaranteed upfront calculations
    // Convert to yearly values by multiplying by 3 (approximating 3 years of income)
    if (guaranteedUpfront.morganStanley) safelyAddTotal(guaranteedUpfront.morganStanley * 3);
    if (guaranteedUpfront.merrillLynch) safelyAddTotal(guaranteedUpfront.merrillLynch * 3);
    if (guaranteedUpfront.ubsWealth) safelyAddTotal(guaranteedUpfront.ubsWealth * 3);
    if (guaranteedUpfront.ameriprise) safelyAddTotal(guaranteedUpfront.ameriprise * 3);
    if (guaranteedUpfront.finet) safelyAddTotal(guaranteedUpfront.finet * 3);
    console.log("Added fallback values to selectedFirmTotals:", selectedFirmTotals);
  }
  
  // If still no firms selected, default to 0, otherwise find max of selected firms
  const bestDeal = selectedFirmTotals.length > 0 ? Math.max(...selectedFirmTotals) : 0;
  console.log("Final bestDeal value:", bestDeal);

  // Calculate total income at current firm over 10 years (using currentGridPayout, typically 50%)
  // This is their grid at current firm (typically 50%) compounded over 10 years
  let totalCurrentFirmIncome = 0;
  for (let year = 1; year <= 10; year++) {
    const yearRevenue = revenue * Math.pow(1 + annualGrowthRate, year - 1);
    const yearIncome = yearRevenue * currentGridPayout;
    totalCurrentFirmIncome += yearIncome;
  }
  
  // Calculate total income at new firm (bestDeal plus grid difference)
  // This is the recruiting offer + updated grid at 52%, compounded over 10 years
  // If we have a valid bestDeal, use it, otherwise use a minimum fallback value
  const validBestDeal = (bestDeal && !isNaN(bestDeal) && bestDeal > 0) ? bestDeal : 3.5; // Fallback to 3.5M if no valid value
  const totalNewFirmIncome = validBestDeal * 1000000; // Convert back from millions
  
  console.log("Using validBestDeal for calculations:", validBestDeal);
  
  // Calculate the delta between staying and moving
  const totalCompDelta = totalNewFirmIncome - totalCurrentFirmIncome;
  
  // Ensure no NaN values
  const safeBestDeal = isNaN(validBestDeal) ? 3.5 : validBestDeal; // Always have a value
  const safeTotalCompDelta = isNaN(totalCompDelta) ? 0 : totalCompDelta;
  
  // Summary metrics - use calculated values, not sample values
  // Calculate percentage change if we have previous results stored
  // This would typically come from localStorage or the app's state
  let previousBestDeal = 0;
  try {
    const previousResults = localStorage.getItem('previousCalculationResults');
    if (previousResults) {
      const parsed = JSON.parse(previousResults);
      previousBestDeal = parsed.metrics?.totalDeal?.value || 0;
    }
  } catch (e) {
    console.error('Error parsing previous calculation results:', e);
  }
  
  // Calculate percentage change
  const percentChange = previousBestDeal > 0 
    ? ((bestDeal - previousBestDeal) / previousBestDeal) * 100 
    : 0;
  
  // Store current calculation for future comparison
  try {
    localStorage.setItem('previousCalculationResults', JSON.stringify({
      metrics: {
        totalDeal: {
          value: bestDeal
        }
      }
    }));
  } catch (e) {
    console.error('Error storing calculation results:', e);
  }
  
  console.log("Before metrics calculation:");
  console.log("- bestDeal:", bestDeal);
  console.log("- safeBestDeal:", safeBestDeal);
  console.log("- revenue:", revenue);
  console.log("- safeTotalCompDelta:", safeTotalCompDelta);
  console.log("- totalNewFirmIncome:", totalNewFirmIncome);
  console.log("- totalCurrentFirmIncome:", totalCurrentFirmIncome);
  console.log("- selectedFirmTotals:", selectedFirmTotals);
  
  const metrics: MetricData = {
    totalDeal: {
      value: safeBestDeal,
      change: Math.round(percentChange),
      isUp: percentChange >= 0,
      description: 'Based on your current book size and business composition'
    },
    recruitingRevenue: {
      value: revenue,
      change: 5,
      isUp: true,
      description: 'Your trailing 12-month revenue used for recruiting calculations'
    },
    totalCompDelta: {
      value: safeTotalCompDelta / 1000000, // Convert to millions for display
      description: '10-year increased earnings from moving vs. staying at current firm'
    }
  };
  
  console.log("Final metrics values:", metrics);

  // Backend breakdown - get from parameters if available
  const backendBreakdown: BackendBreakdown = {
    growth: getParameterValue(firmParams, 'Global', 'backendGrowthPct', 40),
    assets: getParameterValue(firmParams, 'Global', 'backendAssetsPct', 25),
    lengthOfService: getParameterValue(firmParams, 'Global', 'backendServicePct', 35)
  };

  return {
    metrics,
    comparisonData,
    guaranteedUpfront,
    backendBreakdown,
    isPaid: true
  };
}

// Helper function to calculate yearly values for each firm
function calculateYearlyValue(
  year: number, 
  firm: string, 
  revenue: number, 
  feeBasedPercentage: number, 
  firmParams?: FirmParameter[],
  firmDeals?: FirmDeal[]
): number {
  // Map our internal firm names to possible Airtable firm names
  let airtableFirmNames: string[] = [];
  
  if (firm === 'morganStanley') {
    airtableFirmNames = ['Morgan Stanley', 'MS'];
  } else if (firm === 'merrillLynch') {
    airtableFirmNames = ['Merrill Lynch', 'Merrill'];
  } else if (firm === 'ubsWealth') {
    airtableFirmNames = ['UBS Wealth', 'UBS', 'UBS Financial'];
  } else if (firm === 'jpm') {
    airtableFirmNames = ['J.P. Morgan', 'JPMorgan', 'JP Morgan', 'JPM'];
  } else if (firm === 'wellsFargo') {
    airtableFirmNames = ['Wells Fargo', 'WF'];
  } else if (firm === 'tru') {
    airtableFirmNames = ['Truist', 'TRU'];
  } else if (firm === 'independent') {
    // For independent, try to find any firm marked as Independent type in parameters
    if (firmParams) {
      const independentParams = firmParams.filter(
        param => param.paramName === 'firmType' && 
                param.notes.toLowerCase().includes('independent')
      );
      
      if (independentParams.length > 0) {
        airtableFirmNames = independentParams.map(p => p.firm);
      } else {
        airtableFirmNames = ['Independent', 'LPL Financial', 'FiNet', 'Linsco'];
      }
    } else {
      airtableFirmNames = ['Independent', 'LPL Financial', 'FiNet', 'Linsco'];
    }
  } else if (firm === 'raymondJames') {
    airtableFirmNames = ['Raymond James', 'Edward Jones', 'Ed Jones'];
  }
  
  // Get values from Airtable if available
  if (firmParams && firmParams.length > 0) {
    // First try to use exact year/value parameters if they exist
    // Use parameter format: "{firm}Year{year}Value"
    const paramName = `${firm}Year${year}Value`;
    const specificValue = getParameterValue(firmParams, 'Year Trajectories', paramName, -1);
    
    if (specificValue !== -1) {
      // We found a specific value in Airtable - use this to calculate amount
      return (specificValue * revenue) / 1000000;
    }
    
    // If no exact parameter, try to calculate based on deal length and upfront/backend ratios
    // Try each possible firm name mapping from our internal names to Airtable names
    for (const firmName of airtableFirmNames) {
      // Get deal length for this firm
      const dealLength = getParameterValue(
        firmParams,
        firmName,
        'dealLength',
        -1
      );
      
      if (dealLength !== -1) {
        // Found deal length parameter for this firm
        // Get grid value (payout rate)
        const gridValue = getParameterValue(
          firmParams,
          firmName,
          'grid',
          -1
        );
        
        // Look for a matching deal to get upfront/backend ratios
        const matchingDealParams = firmParams.filter(
          param => param.firm.toLowerCase() === firmName.toLowerCase()
        );
        
        if (matchingDealParams.length > 0) {
          // We have parameters for this firm - generate a yearly value curve
          // Upfront is year 1, backend is spread over remaining years
          const totalYears = Math.max(5, dealLength);
          
          if (year === 1) {
            // Year 1 includes the upfront payment
            // Look for deal data for this firm to extract upfront values
            const firmDeal = firmDeals?.find(deal => 
              deal.firm.toLowerCase() === firmName.toLowerCase()
            );
            
            if (firmDeal) {
              // Use actual upfront value from Airtable
              const upfrontValue = ((firmDeal.upfrontMin || 0) + (firmDeal.upfrontMax || 0)) / 2;
              return (upfrontValue * (revenue / 1000000));
            } else {
              // Fallback if no deal found
              return (0.5 * revenue * gridValue) / 1000000;
            }
          } else if (year <= totalYears) {
            // Backend years (2 through dealLength)
            // Create a curve that starts low, peaks in the middle, and trails off
            const position = year / totalYears;
            let multiplier = 0;
            
            if (position < 0.33) {
              // First third: Ramp up
              multiplier = 0.3 + (position * 0.6);
            } else if (position < 0.67) {
              // Middle third: Peak
              multiplier = 0.5;
            } else {
              // Last third: Taper down
              multiplier = 0.5 - ((position - 0.67) * 0.5);
            }
            
            return (multiplier * revenue * gridValue) / 1000000;
          } else {
            // Beyond the deal length, earnings drop substantially
            return (0.1 * revenue * gridValue) / 1000000;
          }
        }
      }
    }
  }
  
  // If no Airtable value or params not loaded, fall back to default curves
  switch(firm) {
    case 'morganStanley':
      // Starts strong, peaks at year 4, then declines
      return year === 1 ? 5 : 
             year === 2 ? 12 : 
             year === 3 ? 18 : 
             year === 4 ? 22 : 7;
    
    case 'merrillLynch':
      // Steady growth with a peak at year 4
      return year === 1 ? 7 : 
             year === 2 ? 16 : 
             year === 3 ? 13 : 
             year === 4 ? 25 : 22;
    
    case 'ubsWealth':
      // Strong middle years
      return year === 1 ? 10 : 
             year === 2 ? 13 : 
             year === 3 ? 25 : 
             year === 4 ? 18 : 15;
    
    case 'ameriprise':
      // Steady mid-range growth
      return year === 1 ? 6 : 
             year === 2 ? 11 : 
             year === 3 ? 15 : 
             year === 4 ? 17 : 20;
             
    case 'finet':
      // Higher payouts from year 2 onwards
      return year === 1 ? 4 : 
             year === 2 ? 14 : 
             year === 3 ? 19 : 
             year === 4 ? 22 : 25;
    
    case 'independent':
      // Starts low but has the best long-term growth
      return year === 1 ? 0 : 
             year === 2 ? 5 : 
             year === 3 ? 10 : 
             year === 4 ? 18 : 27;
             
    case 'jpm':
      // J.P. Morgan calculation curve
      return year === 1 ? 8 : 
             year === 2 ? 14 : 
             year === 3 ? 19 : 
             year === 4 ? 23 : 20;
             
    case 'wellsFargo':
      // Wells Fargo calculation curve
      return year === 1 ? 7 : 
             year === 2 ? 13 : 
             year === 3 ? 18 : 
             year === 4 ? 20 : 17;
             
    case 'tru':
      // Truist calculation curve
      return year === 1 ? 6 : 
             year === 2 ? 12 : 
             year === 3 ? 16 : 
             year === 4 ? 19 : 15;
    
    default:
      return 0;
  }
}
