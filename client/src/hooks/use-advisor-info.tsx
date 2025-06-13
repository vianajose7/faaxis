import { createContext, ReactNode, useContext, useState, useEffect } from "react";
import { AdvisorInfo, CalculatorResults } from "@/lib/calculator";

interface AdvisorInfoContextType {
  advisorInfo: AdvisorInfo;
  calculationResults: CalculatorResults | null;
  setAdvisorInfo: (info: AdvisorInfo) => void;
  setCalculationResults: (results: CalculatorResults) => void;
  clearAdvisorInfo: () => void;
}

// Default initial values for the advisor info form
export const defaultAdvisorInfo: AdvisorInfo = {
  aum: 0,
  revenue: 0,
  feeBasedPercentage: 0,
  city: "",
  state: ""
};

const AdvisorInfoContext = createContext<AdvisorInfoContextType | null>(null);

export function AdvisorInfoProvider({ children }: { children: ReactNode }) {
  // Initialize with default value instead of null to ensure we always have a valid object
  const [advisorInfo, setAdvisorInfoState] = useState<AdvisorInfo>(defaultAdvisorInfo);
  const [calculationResults, setCalculationResultsState] = useState<CalculatorResults | null>(null);
  
  // On initial load, try to get values from localStorage
  useEffect(() => {
    try {
      console.log("AdvisorInfoProvider: Initializing from localStorage");
      const savedInfo = localStorage.getItem('advisorInfo');
      const savedResults = localStorage.getItem('calculationResults');
      
      if (savedInfo) {
        console.log("AdvisorInfoProvider: Found saved advisor info");
        const parsedInfo = JSON.parse(savedInfo);
        // Merge with default values to ensure all required fields exist
        setAdvisorInfoState({...defaultAdvisorInfo, ...parsedInfo});
      } else {
        console.log("AdvisorInfoProvider: No saved info found, using defaults");
      }
      
      if (savedResults) {
        console.log("AdvisorInfoProvider: Found saved calculation results");
        setCalculationResultsState(JSON.parse(savedResults));
      }
    } catch (error) {
      console.error("AdvisorInfoProvider: Error loading from localStorage", error);
      // On error, ensure we still have valid default values
      setAdvisorInfoState(defaultAdvisorInfo);
    }
  }, []);
  
  const setAdvisorInfo = (info: AdvisorInfo) => {
    try {
      console.log("AdvisorInfoProvider: Setting advisor info", info);
      // Store the advisor info in state
      setAdvisorInfoState(info);
      
      // Also store in localStorage for persistence across page refreshes
      localStorage.setItem('advisorInfo', JSON.stringify(info));
    } catch (error) {
      console.error("Error saving advisor info to localStorage", error);
    }
  };
  
  const setCalculationResults = (results: CalculatorResults) => {
    try {
      console.log("AdvisorInfoProvider: Setting calculation results");
      // Store calculation results in state
      setCalculationResultsState(results);
      
      // Also store in localStorage for persistence
      localStorage.setItem('calculationResults', JSON.stringify(results));
    } catch (error) {
      console.error("Error saving calculation results to localStorage", error);
    }
  };
  
  const clearAdvisorInfo = () => {
    console.log("AdvisorInfoProvider: Clearing advisor info and results");
    // Reset to default values instead of null
    setAdvisorInfoState(defaultAdvisorInfo);
    setCalculationResultsState(null);
    localStorage.removeItem('advisorInfo');
    localStorage.removeItem('calculationResults');
  };
  
  return (
    <AdvisorInfoContext.Provider
      value={{
        advisorInfo,
        calculationResults,
        setAdvisorInfo,
        setCalculationResults,
        clearAdvisorInfo
      }}
    >
      {children}
    </AdvisorInfoContext.Provider>
  );
}

export function useAdvisorInfo() {
  const context = useContext(AdvisorInfoContext);
  
  if (!context) {
    throw new Error("useAdvisorInfo must be used within an AdvisorInfoProvider");
  }
  
  return context;
}