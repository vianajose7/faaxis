import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Type definitions for saved calculations
export interface SavedCalculation {
  id: number;
  userId: number;
  advisorInfo: {
    fullName?: string;
    firstName?: string;
    lastName?: string;
    phone: string;
    email: string;
    aum: string;
    revenue: string;
    feeBasedPercentage: string;
    currentFirm: string;
  };
  selectedFirms: string[];
  results: any; // Detailed results of calculations
  createdAt: string;
  notes?: string;
}

/**
 * Hook for fetching and managing saved calculations
 */
export function useSavedCalculations() {
  const { toast } = useToast();

  // Fetch saved calculations
  const { 
    data: savedCalculations = [], 
    isLoading,
    error,
    refetch
  } = useQuery<SavedCalculation[]>({
    queryKey: ['/api/saved-calculations'],
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/saved-calculations');
      if (!res.ok) {
        throw new Error('Failed to fetch saved calculations');
      }
      return res.json();
    }
  });

  // Delete a saved calculation
  const deleteCalculation = useMutation({
    mutationFn: async (calculationId: number) => {
      const res = await apiRequest('DELETE', `/api/saved-calculations/${calculationId}`);
      if (!res.ok) {
        throw new Error('Failed to delete calculation');
      }
      return calculationId;
    },
    onSuccess: (calculationId) => {
      // Update the query cache to remove the deleted calculation
      queryClient.setQueryData(
        ['/api/saved-calculations'],
        (oldData: SavedCalculation[] | undefined) => 
          oldData ? oldData.filter(calc => calc.id !== calculationId) : []
      );

      toast({
        title: "Calculation Deleted",
        description: "The calculation has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Delete Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  // Save a new calculation
  const saveCalculation = useMutation({
    mutationFn: async (calculationData: Omit<SavedCalculation, 'id' | 'userId' | 'createdAt'>) => {
      const res = await apiRequest('POST', '/api/saved-calculations', calculationData);
      if (!res.ok) {
        throw new Error('Failed to save calculation');
      }
      return res.json();
    },
    onSuccess: (newCalculation) => {
      // Update the query cache to add the new calculation
      queryClient.setQueryData(
        ['/api/saved-calculations'],
        (oldData: SavedCalculation[] | undefined) => 
          oldData ? [...oldData, newCalculation] : [newCalculation]
      );

      toast({
        title: "Calculation Saved",
        description: "Your calculation has been saved successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    savedCalculations,
    isLoading,
    error,
    refetch,
    deleteCalculation,
    saveCalculation
  };
}