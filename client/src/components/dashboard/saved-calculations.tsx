import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  AlertDialog, AlertDialogAction, AlertDialogCancel, 
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter, 
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from "@/components/ui/table";
import { 
  BarChart, Calendar, Eye, Search, Trash2, User 
} from "lucide-react";
import { formatNumberWithCommas } from "@/lib/format-utils";
import { useSavedCalculations, type SavedCalculation } from "@/hooks/use-saved-calculations";
import { Badge } from "@/components/ui/badge";

// Format date to locale string (e.g., "Apr 26, 2025")
const formatDateToLocale = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

interface SavedCalculationsProps {
  demo?: boolean;
}

export function SavedCalculations({ demo = false }: SavedCalculationsProps) {
  const [_, navigate] = useLocation();
  const { 
    savedCalculations, 
    isLoading, 
    deleteCalculation 
  } = useSavedCalculations();
  const [searchTerm, setSearchTerm] = useState("");

  // Filter calculations based on search term
  const filteredCalculations = savedCalculations.filter(calc => {
    const searchLower = searchTerm.toLowerCase();
    
    // Cast to our extended type with firstName and lastName
    const advisorInfo = calc.advisorInfo as {
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
    
    // Create fullName from firstName and lastName, or use existing fullName for backward compatibility
    const fullName = advisorInfo.firstName && advisorInfo.lastName 
      ? `${advisorInfo.firstName} ${advisorInfo.lastName}`
      : advisorInfo.fullName || "";
    
    return (
      fullName.toLowerCase().includes(searchLower) ||
      calc.advisorInfo.currentFirm.toLowerCase().includes(searchLower) ||
      calc.selectedFirms.some(firm => firm.toLowerCase().includes(searchLower))
    );
  });

  // Handle viewing a specific calculation
  const handleViewCalculation = (calculation: SavedCalculation) => {
    // Navigate to calculator with the saved calculation data
    navigate(`/calculator?id=${calculation.id}`);
  };

  // Handle deleting a calculation
  const handleDeleteCalculation = (id: number) => {
    deleteCalculation.mutate(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Saved Calculations</h2>
        <Button 
          onClick={() => navigate("/calculator")}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <BarChart className="w-4 h-4 mr-2" />
          New Calculation
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search calculations..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      ) : savedCalculations.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-8">
            <div className="text-center space-y-3">
              <BarChart className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-medium">No Calculations Yet</h3>
              <p className="text-muted-foreground text-sm">
                You haven't saved any calculations yet. Start a new calculation to analyze transition opportunities.
              </p>
              <Button 
                onClick={() => navigate("/calculator")}
                className="mt-2"
              >
                Start New Calculation
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Advisor</TableHead>
                <TableHead>Current Firm</TableHead>
                <TableHead>AUM</TableHead>
                <TableHead>Target Firms</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCalculations.map((calc) => (
                <TableRow key={calc.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-muted-foreground" />
                      {(() => {
                        // Cast to our extended type with firstName and lastName
                        const advisorInfo = calc.advisorInfo as {
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
                        
                        return advisorInfo.firstName && advisorInfo.lastName 
                          ? `${advisorInfo.firstName} ${advisorInfo.lastName}`
                          : advisorInfo.fullName || "Unknown";
                      })()}
                    </div>
                  </TableCell>
                  <TableCell>{calc.advisorInfo.currentFirm}</TableCell>
                  <TableCell>${formatNumberWithCommas(calc.advisorInfo.aum)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {calc.selectedFirms.slice(0, 2).map((firm, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {firm}
                        </Badge>
                      ))}
                      {calc.selectedFirms.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{calc.selectedFirms.length - 2} more
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDateToLocale(new Date(calc.createdAt))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewCalculation(calc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive border-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Calculation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this calculation? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleDeleteCalculation(calc.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}