import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { FirmDeal } from "@/lib/airtable-service";
import { Check, DollarSign, Calendar, PercentIcon } from "lucide-react";

// Extend FirmDeal interface with new fields
interface ExtendedFirmDeal extends FirmDeal {
  dealLength?: string;
  deferredMatchPercent?: number;
}

// Define props for the component
interface FirmDealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  deal: ExtendedFirmDeal | null;
  onSave: (deal: ExtendedFirmDeal) => void;
}

export function FirmDealDialog({ 
  open, 
  onOpenChange, 
  deal, 
  onSave 
}: FirmDealDialogProps) {
  // Form state
  const [firm, setFirm] = useState('');
  const [upfrontMin, setUpfrontMin] = useState(0);
  const [upfrontMax, setUpfrontMax] = useState(0);
  const [backendMin, setBackendMin] = useState(0);
  const [backendMax, setBackendMax] = useState(0);
  const [totalDealMin, setTotalDealMin] = useState(0);
  const [totalDealMax, setTotalDealMax] = useState(0);
  const [notes, setNotes] = useState('');
  const [dealLength, setDealLength] = useState('');
  const [deferredMatchPercent, setDeferredMatchPercent] = useState<number>(0);
  
  // Reset form when deal changes
  useEffect(() => {
    if (deal) {
      setFirm(deal.firm);
      setUpfrontMin(deal.upfrontMin);
      setUpfrontMax(deal.upfrontMax);
      setBackendMin(deal.backendMin);
      setBackendMax(deal.backendMax);
      setTotalDealMin(deal.totalDealMin);
      setTotalDealMax(deal.totalDealMax);
      setNotes(deal.notes);
      setDealLength(deal.dealLength || '');
      setDeferredMatchPercent(deal.deferredMatchPercent || 0);
    } else {
      // Reset form for new deal
      setFirm('');
      setUpfrontMin(0);
      setUpfrontMax(0);
      setBackendMin(0);
      setBackendMax(0);
      setTotalDealMin(0);
      setTotalDealMax(0);
      setNotes('');
      setDealLength('');
      setDeferredMatchPercent(0);
    }
  }, [deal]);
  
  // Automatically calculate total deal values when component inputs change
  useEffect(() => {
    const newTotalMin = upfrontMin + backendMin;
    const newTotalMax = upfrontMax + backendMax;
    
    setTotalDealMin(newTotalMin);
    setTotalDealMax(newTotalMax);
  }, [upfrontMin, upfrontMax, backendMin, backendMax]);

  // Handle form submission
  const handleSave = () => {
    if (!firm) {
      toast({
        title: "Firm name is required",
        variant: "destructive"
      });
      return;
    }
    
    // Validate that max values are not less than min values
    if (upfrontMax < upfrontMin) {
      toast({
        title: "Upfront max cannot be less than min",
        variant: "destructive"
      });
      return;
    }
    
    if (backendMax < backendMin) {
      toast({
        title: "Backend max cannot be less than min",
        variant: "destructive"
      });
      return;
    }
    
    // Create the deal object
    const dealData: ExtendedFirmDeal = {
      id: deal?.id || `deal_${Date.now()}`,
      firm,
      upfrontMin,
      upfrontMax,
      backendMin,
      backendMax,
      totalDealMin,
      totalDealMax,
      notes,
      dealLength,
      deferredMatchPercent
    };
    
    onSave(dealData);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {deal ? `Edit ${deal.firm} Deal` : 'Add New Firm Deal'}
          </DialogTitle>
          <DialogDescription>
            {deal 
              ? `Update the compensation deal structure for ${deal.firm}.` 
              : 'Create a new firm deal with compensation structure details.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="firm" className="text-right">
              Firm Name
            </Label>
            <Input
              id="firm"
              value={firm}
              onChange={(e) => setFirm(e.target.value)}
              className="col-span-3"
              required
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dealLength" className="text-right">
              Deal Length
            </Label>
            <div className="flex items-center gap-2 col-span-3">
              <Input
                id="dealLength"
                value={dealLength}
                onChange={(e) => setDealLength(e.target.value)}
                className="w-full"
                placeholder="E.g., 3 years"
              />
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="deferredMatchPercent" className="text-right">
              Deferred Match %
            </Label>
            <div className="flex items-center gap-2 col-span-3">
              <Input
                id="deferredMatchPercent"
                type="number"
                min="0"
                max="100"
                value={deferredMatchPercent.toString()}
                onChange={(e) => setDeferredMatchPercent(Number(e.target.value))}
                className="w-full"
                placeholder="E.g., 50"
              />
              <PercentIcon className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Upfront Range
            </Label>
            <div className="col-span-3 flex gap-4">
              <div className="flex-1">
                <Label htmlFor="upfrontMin" className="text-xs text-muted-foreground">
                  Min
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="upfrontMin"
                    type="number"
                    value={upfrontMin}
                    onChange={(e) => setUpfrontMin(Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="upfrontMax" className="text-xs text-muted-foreground">
                  Max
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="upfrontMax"
                    type="number"
                    value={upfrontMax}
                    onChange={(e) => setUpfrontMax(Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">
              Backend Range
            </Label>
            <div className="col-span-3 flex gap-4">
              <div className="flex-1">
                <Label htmlFor="backendMin" className="text-xs text-muted-foreground">
                  Min
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="backendMin"
                    type="number"
                    value={backendMin}
                    onChange={(e) => setBackendMin(Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="backendMax" className="text-xs text-muted-foreground">
                  Max
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="backendMax"
                    type="number"
                    value={backendMax}
                    onChange={(e) => setBackendMax(Number(e.target.value))}
                    min="0"
                    step="0.1"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right font-medium">
              Total Deal Range
            </Label>
            <div className="col-span-3 flex gap-4">
              <div className="flex-1">
                <Label htmlFor="totalDealMin" className="text-xs text-muted-foreground">
                  Min (Calculated)
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="totalDealMin"
                    type="number"
                    value={totalDealMin}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor="totalDealMax" className="text-xs text-muted-foreground">
                  Max (Calculated)
                </Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="totalDealMax"
                    type="number"
                    value={totalDealMax}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2">
              Notes
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="col-span-3 min-h-[100px]"
              placeholder="Enter notes about the deal terms, requirements, etc."
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="h-4 w-4" />
            Save Deal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}