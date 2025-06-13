import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FirmParameter } from "@/lib/airtable-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Check, 
  XCircle, 
  Save, 
  RefreshCw, 
  PencilIcon,
  Sliders,
  PercentIcon
} from "lucide-react";

// Define parameter categories
const PARAMETER_CATEGORIES = [
  "Upfront Minimum",
  "Upfront Maximum",
  "Backend Minimum",
  "Backend Maximum",
  "Total Deal Minimum",
  "Total Deal Maximum",
  "Deferred Match Percentage"
];

interface ParameterEditorProps {
  firms: string[];
  parameters: FirmParameter[];
  onSave: (parameters: FirmParameter[]) => void;
  isLoading: boolean;
}

export function ParameterEditor({
  firms,
  parameters,
  onSave,
  isLoading
}: ParameterEditorProps) {
  const [selectedFirm, setSelectedFirm] = useState<string>("");
  const [adjustedParameters, setAdjustedParameters] = useState<Map<string, number>>(new Map());
  const [adjustmentPercent, setAdjustmentPercent] = useState<number>(0);
  const [saveMessage, setSaveMessage] = useState<string>("");
  
  // Reset adjustment values when selected firm changes
  useEffect(() => {
    if (selectedFirm) {
      const initialParams = new Map<string, number>();
      
      // Find parameters for this firm
      PARAMETER_CATEGORIES.forEach(category => {
        const param = parameters.find(p => 
          p.firm === selectedFirm && p.paramName === category
        );
        
        if (param) {
          initialParams.set(category, param.paramValue);
        } else {
          // If parameter doesn't exist, set a default value
          initialParams.set(category, 0);
        }
      });
      
      setAdjustedParameters(initialParams);
      setAdjustmentPercent(0);
    }
  }, [selectedFirm, parameters]);
  
  // Apply global adjustment to all parameters
  const applyGlobalAdjustment = (percent: number) => {
    setAdjustmentPercent(percent);
    
    const newParams = new Map<string, number>(adjustedParameters);
    
    // Find original parameters for this firm
    PARAMETER_CATEGORIES.forEach(category => {
      const param = parameters.find(p => 
        p.firm === selectedFirm && p.paramName === category
      );
      
      if (param) {
        const originalValue = param.paramValue;
        // Apply percentage adjustment
        const adjustedValue = originalValue * (1 + percent / 100);
        newParams.set(category, adjustedValue);
      }
    });
    
    setAdjustedParameters(newParams);
  };
  
  // Update a specific parameter
  const updateParameter = (category: string, value: number) => {
    const newParams = new Map(adjustedParameters);
    newParams.set(category, value);
    setAdjustedParameters(newParams);
  };
  
  // Handle save
  const handleSave = () => {
    if (!selectedFirm) {
      toast({
        title: "Please select a firm",
        variant: "destructive"
      });
      return;
    }
    
    // Create an array of updated parameters
    const updatedParams: FirmParameter[] = [];
    
    adjustedParameters.forEach((value, category) => {
      // Find existing parameter or create new ID
      const existingParam = parameters.find(p => 
        p.firm === selectedFirm && p.paramName === category
      );
      
      updatedParams.push({
        id: existingParam?.id || `param_${Date.now()}_${category.replace(/\s+/g, '')}`,
        firm: selectedFirm,
        paramName: category,
        paramValue: value,
        notes: existingParam?.notes || `${category} parameter for ${selectedFirm}`
      });
    });
    
    onSave(updatedParams);
    setSaveMessage(`Parameters for ${selectedFirm} saved successfully.`);
    
    setTimeout(() => {
      setSaveMessage("");
    }, 3000);
  };
  
  // Calculate the difference from original value
  const calculateDifference = (category: string, currentValue: number): number => {
    const originalParam = parameters.find(p => 
      p.firm === selectedFirm && p.paramName === category
    );
    
    if (!originalParam) return 0;
    
    const originalValue = originalParam.paramValue;
    if (originalValue === 0) return 0;
    
    return ((currentValue - originalValue) / originalValue) * 100;
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sliders className="h-5 w-5" />
          Deal Parameter Adjustment
        </CardTitle>
        <CardDescription>
          Customize deal parameters for each firm with precise percentage adjustments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Firm Selection */}
        <div className="space-y-2">
          <Label htmlFor="firmSelect">Select Firm</Label>
          <Select
            value={selectedFirm}
            onValueChange={setSelectedFirm}
            disabled={isLoading || firms.length === 0}
          >
            <SelectTrigger id="firmSelect" className="w-full">
              <SelectValue placeholder="Choose a firm to adjust parameters" />
            </SelectTrigger>
            <SelectContent>
              {firms.map(firm => (
                <SelectItem key={firm} value={firm}>
                  {firm}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedFirm && (
          <>
            {/* Global Adjustment Slider */}
            <div className="pt-4 pb-2">
              <div className="flex justify-between items-center mb-2">
                <Label>Global Deal Adjustment</Label>
                <span className="text-sm font-medium">
                  {adjustmentPercent > 0 && '+'}
                  {adjustmentPercent.toFixed(1)}%
                </span>
              </div>
              <div className="flex gap-3 items-center">
                <span className="text-xs text-muted-foreground">-30%</span>
                <Slider
                  value={[adjustmentPercent]}
                  min={-30}
                  max={30}
                  step={0.5}
                  onValueChange={(values) => applyGlobalAdjustment(values[0])}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground">+30%</span>
              </div>
            </div>
            
            {/* Parameter Table */}
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Parameter</TableHead>
                    <TableHead>Original Value</TableHead>
                    <TableHead>Adjusted Value</TableHead>
                    <TableHead className="text-right">Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(adjustedParameters.entries()).map(([category, value]) => {
                    const originalParam = parameters.find(p => 
                      p.firm === selectedFirm && p.paramName === category
                    );
                    const originalValue = originalParam?.paramValue || 0;
                    const percentChange = calculateDifference(category, value);
                    
                    return (
                      <TableRow key={category}>
                        <TableCell className="font-medium">{category}</TableCell>
                        <TableCell>{originalValue.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              value={value}
                              min={0}
                              step={0.1}
                              onChange={(e) => updateParameter(category, Number(e.target.value))}
                              className="w-24"
                            />
                            {category.includes('Percentage') && (
                              <PercentIcon className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={
                            percentChange > 0 ? "text-green-600 dark:text-green-400" : 
                            percentChange < 0 ? "text-red-600 dark:text-red-400" : ""
                          }>
                            {percentChange > 0 && '+'}
                            {percentChange.toFixed(1)}%
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
        
        {!selectedFirm && !isLoading && (
          <div className="flex items-center justify-center p-6 border border-dashed rounded-md">
            <div className="text-center text-muted-foreground">
              <Sliders className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Select a firm to adjust parameters</p>
            </div>
          </div>
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          {saveMessage && (
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Check className="h-4 w-4" />
              {saveMessage}
            </div>
          )}
        </div>
        <Button 
          onClick={handleSave} 
          disabled={!selectedFirm || isLoading}
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          Save Parameters
        </Button>
      </CardFooter>
    </Card>
  );
}