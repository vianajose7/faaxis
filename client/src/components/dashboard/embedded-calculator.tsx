import { useState } from "react";
import { useLocation } from "wouter";
import { 
  Card, CardContent, CardDescription, 
  CardFooter, CardHeader, CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, SelectContent, SelectItem, 
  SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { formatNumberWithCommas, parseFormattedNumber } from "@/lib/format-utils";
import { ArrowRight, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

// US States for dropdown
const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC"
];

interface EmbeddedCalculatorProps {
  demo?: boolean;
}

export function EmbeddedCalculator({ demo = false }: EmbeddedCalculatorProps) {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  // Form state initialized with user data when available
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    email: user?.username || "",
    state: user?.state || "",
    aum: user?.aum ? formatNumberWithCommas(user.aum) : "",
    revenue: user?.revenue ? formatNumberWithCommas(user.revenue) : "",
    feeBasedPercentage: user?.feeBasedPercentage || "",
    currentFirm: user?.firm || ""
  });

  // Handle input changes with special formatting for numbers
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name === 'aum' || name === 'revenue') {
      // Remove commas for calculation but display with commas
      const numericValue = value.replace(/,/g, '');
      
      if (numericValue === '' || /^\d*$/.test(numericValue)) {
        setFormData({
          ...formData,
          [name]: formatNumberWithCommas(numericValue)
        });
      }
    } else if (name === 'phone') {
      // Only allow numbers and common phone formatting characters for phone field
      if (value === '' || /^[\d\-+() ]*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else if (name === 'feeBasedPercentage') {
      // Only allow numbers and decimal points for percentage fields
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        // Limit to values between 0-100
        const numValue = parseFloat(value);
        if (value === '' || (numValue >= 0 && numValue <= 100) || value.endsWith('.')) {
          setFormData({
            ...formData,
            [name]: value
          });
        }
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Handle dropdown changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Proceed to full calculator
  const handleStartCalculation = () => {
    // Validate the form
    if (!formData.firstName || !formData.lastName) {
      alert("Please enter your first and last name.");
      return;
    }
    
    // Clean up numeric values for submission
    const cleanedData = {
      ...formData,
      aum: formData.aum.replace(/,/g, ''),
      revenue: formData.revenue.replace(/,/g, '')
    };
    
    // Navigate to the calculator with form data as URL parameters
    const queryParams = new URLSearchParams({
      from: 'dashboard',
      ...cleanedData,
      // Add a flag to indicate this is from quick calculator
      quickCalculation: 'true'
    }).toString();
    
    // Use window.location.href instead of navigate to handle the transition properly
    window.location.href = `/calculator?${queryParams}`;
  };

  return (
    <Card className="w-full bg-card">
      <CardHeader>
        <CardTitle className="text-xl">Quick Calculation</CardTitle>
        <CardDescription>
          Enter your information to start a transition calculation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Your first name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Your last name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Your email address"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Your phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Select
              value={formData.state}
              onValueChange={(value) => handleSelectChange('state', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {US_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="currentFirm">Current Firm</Label>
            <Input
              id="currentFirm"
              name="currentFirm"
              value={formData.currentFirm}
              onChange={handleChange}
              placeholder="Your current firm"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="aum">AUM ($)</Label>
            <Input
              id="aum"
              name="aum"
              value={formData.aum}
              onChange={handleChange}
              placeholder="Assets under management"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="revenue">Annual Revenue ($)</Label>
            <Input
              id="revenue"
              name="revenue"
              value={formData.revenue}
              onChange={handleChange}
              placeholder="Your annual revenue"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="feeBasedPercentage">Fee-Based (%)</Label>
            <Input
              id="feeBasedPercentage"
              name="feeBasedPercentage"
              value={formData.feeBasedPercentage}
              onChange={handleChange}
              placeholder="Fee-based percentage"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => window.location.href = "/calculator"}
        >
          <Calculator className="w-4 h-4 mr-2" />
          Full Calculator
        </Button>
        <Button 
          onClick={handleStartCalculation}
          className="bg-primary text-white hover:bg-primary/90"
        >
          Start Calculation
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  );
}