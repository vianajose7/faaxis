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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Check, 
  DollarSign, 
  MapPin, 
  Tag, 
  Building, 
  BarChart, 
  Users, 
  Calendar, 
  MessageCircle, 
  CheckCircle2,
  XCircle,
  User
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Define interfaces for practice listings
interface InterestSubmission {
  id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  contacted: boolean;
}

interface PracticeListing {
  id: string;
  title: string;
  location: string;
  aum: string;
  revenue: string;
  status: 'Active' | 'Pending' | 'Sold';
  price: string;
  description: string;
  highlighted: boolean;
  date: string;
  dealLength?: string;
  interestSubmissions?: InterestSubmission[];
}

interface PracticeListingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listing: PracticeListing | null;
  onSave: (listing: PracticeListing) => void;
}

export function PracticeListingDialog({ 
  open, 
  onOpenChange, 
  listing, 
  onSave 
}: PracticeListingDialogProps) {
  // Form state
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [aum, setAum] = useState('');
  const [revenue, setRevenue] = useState('');
  const [status, setStatus] = useState<'Active' | 'Pending' | 'Sold'>('Active');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [highlighted, setHighlighted] = useState(false);
  const [date, setDate] = useState('');
  const [dealLength, setDealLength] = useState('');
  const [interestSubmissions, setInterestSubmissions] = useState<InterestSubmission[]>([]);
  
  // Reset form when listing changes
  useEffect(() => {
    if (listing) {
      setTitle(listing.title);
      setLocation(listing.location);
      setAum(listing.aum);
      setRevenue(listing.revenue);
      setStatus(listing.status);
      setPrice(listing.price);
      setDescription(listing.description);
      setHighlighted(listing.highlighted);
      setDate(listing.date);
      setDealLength(listing.dealLength || '');
      setInterestSubmissions(listing.interestSubmissions || []);
    } else {
      // Reset form for new listing
      setTitle('');
      setLocation('');
      setAum('');
      setRevenue('');
      setStatus('Active');
      setPrice('');
      setDescription('');
      setHighlighted(false);
      setDate(new Date().toISOString().split('T')[0]);
      setDealLength('');
      setInterestSubmissions([]);
    }
  }, [listing]);

  // Handle form submission
  const handleSave = () => {
    if (!title) {
      toast({
        title: "Title is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!location) {
      toast({
        title: "Location is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!aum) {
      toast({
        title: "AUM is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!revenue) {
      toast({
        title: "Revenue is required",
        variant: "destructive"
      });
      return;
    }
    
    if (!price) {
      toast({
        title: "Price is required",
        variant: "destructive"
      });
      return;
    }
    
    const formattedDate = date || new Date().toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    
    onSave({
      id: listing?.id || `listing_${Date.now()}`,
      title,
      location,
      aum,
      revenue,
      status,
      price,
      description,
      highlighted,
      date: formattedDate,
      dealLength,
      interestSubmissions
    });
    
    onOpenChange(false);
  };
  
  // Toggle interest submission contacted status
  const toggleContactedStatus = (submissionId: string) => {
    const updatedSubmissions = interestSubmissions.map(submission => {
      if (submission.id === submissionId) {
        return { ...submission, contacted: !submission.contacted };
      }
      return submission;
    });
    
    setInterestSubmissions(updatedSubmissions);
    
    toast({
      title: "Status updated",
      description: "Interest submission status has been updated",
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {listing ? `Edit Practice Listing: ${listing.title}` : 'Create New Practice Listing'}
          </DialogTitle>
          <DialogDescription>
            {listing 
              ? "Update practice details, pricing, and status information." 
              : "Create a new practice listing with detailed information."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              required
              placeholder="E.g., Florida Wealth Management Practice"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="location" className="text-right">
              Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="col-span-3"
              required
              placeholder="E.g., Miami, FL"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="aum" className="text-right">
              AUM
            </Label>
            <Input
              id="aum"
              value={aum}
              onChange={(e) => setAum(e.target.value)}
              className="col-span-3"
              required
              placeholder="E.g., $150M"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="revenue" className="text-right">
              Revenue
            </Label>
            <Input
              id="revenue"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              className="col-span-3"
              required
              placeholder="E.g., $1.2M"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dealLength" className="text-right">
              Deal Length
            </Label>
            <Input
              id="dealLength"
              value={dealLength}
              onChange={(e) => setDealLength(e.target.value)}
              className="col-span-3"
              placeholder="E.g., 3 years"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Asking Price
            </Label>
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="col-span-3"
              required
              placeholder="E.g., $3.6M"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right">
              Status
            </Label>
            <Select
              value={status}
              onValueChange={(value) => setStatus(value as 'Active' | 'Pending' | 'Sold')}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Sold">Sold</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3 min-h-[120px]"
              placeholder="Detailed description of the practice"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="highlighted" className="text-right">
              Highlight Listing
            </Label>
            <div className="flex items-center space-x-2">
              <Switch
                id="highlighted"
                checked={highlighted}
                onCheckedChange={setHighlighted}
              />
              <span className="text-sm text-muted-foreground">
                {highlighted ? 'Featured in highlighted sections' : 'Standard listing display'}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Listing Date
            </Label>
            <div className="col-span-3 flex gap-2 items-center">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-[200px]"
              />
            </div>
          </div>
          
          {/* Interest Submissions Section */}
          {listing && interestSubmissions && interestSubmissions.length > 0 && (
            <div className="grid grid-cols-4 items-start gap-4 mt-6">
              <div className="text-right pt-2">
                <Label className="font-medium">Interest Submissions</Label>
                <p className="text-xs text-muted-foreground mt-1">
                  {interestSubmissions.length} interested parties
                </p>
              </div>
              <div className="col-span-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Buyer Interest ({interestSubmissions.length})
                    </CardTitle>
                    <CardDescription>
                      People who have expressed interest in this practice
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                      {interestSubmissions.map((submission, index) => (
                        <AccordionItem 
                          key={submission.id} 
                          value={submission.id}
                          className={submission.contacted ? "bg-green-50/50 dark:bg-green-950/20" : ""}
                        >
                          <AccordionTrigger className="px-4 py-2 hover:bg-muted/50">
                            <div className="flex items-center justify-between w-full pr-4">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span>{submission.name}</span>
                                {submission.contacted && (
                                  <Badge variant="outline" className="ml-2 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                    Contacted
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                {submission.date}
                              </span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="px-4 pb-3 pt-1">
                            <div className="space-y-3">
                              <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-sm font-medium">Email:</span>
                                <span className="text-sm">{submission.email}</span>
                              </div>
                              <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-sm font-medium">Phone:</span>
                                <span className="text-sm">{submission.phone}</span>
                              </div>
                              <div className="grid grid-cols-[100px_1fr] gap-2">
                                <span className="text-sm font-medium">Message:</span>
                                <span className="text-sm">{submission.message}</span>
                              </div>
                              <div className="pt-2 flex justify-end">
                                <Button 
                                  variant={submission.contacted ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => toggleContactedStatus(submission.id)}
                                  className="gap-2"
                                >
                                  {submission.contacted ? (
                                    <>
                                      <XCircle className="h-4 w-4" />
                                      Mark as Not Contacted
                                    </>
                                  ) : (
                                    <>
                                      <CheckCircle2 className="h-4 w-4" />
                                      Mark as Contacted
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex items-center justify-between">
          <div>
            {status === 'Sold' && (
              <Badge variant="default" className="bg-green-600">
                This practice has been sold
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="h-4 w-4" />
              Save Listing
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}