import { useRef, useState, memo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MapPin, Building2, Users, TrendingUp, DollarSign, Calendar, Mail, Phone, FileText, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Honeypot } from "@/components/ui/honeypot";

// Practice and advisor types for proper typing
export interface Practice {
  id: number | string;  // Allow both number and string IDs for compatibility
  title: string;
  location: string;
  aum: string;
  revenue: string;
  clients: number | string;  // Allow both number and string clients count for compatibility
  type: string;
  status: string;
  description: string;
  tags: string[];
  highlighted?: boolean;
  // Additional details for the detailed view
  established?: string;
  clientAvgAge?: string;
  investmentStyle?: string;
  feeStructure?: string;
  transitionPeriod?: string;
  askingPrice?: string;
  sellerMotivation?: string;
  growthRate?: string;
  clientRetentionRate?: string;
}

export interface Advisor {
  id: number;
  title: string;
  location: string;
  aum: string;
  targetAum: string;
  experience: string;
  type: string;
  status: string;
  description: string;
  tags: string[];
  highlighted?: boolean;
  // Additional details for the detailed view
  preferredTimeframe?: string;
  fundingAvailable?: string;
  investmentApproach?: string;
  preferredClientType?: string;
  successorExperience?: string;
}

interface PracticeDetailDialogProps {
  practice?: Practice | null;
  advisor?: Advisor | null;
  isOpen: boolean;
  onClose: () => void;
}

function PracticeDetailDialog({ 
  practice, 
  advisor, 
  isOpen, 
  onClose 
}: PracticeDetailDialogProps) {
  // Form rendering timestamp for spam prevention
  const formRenderTimeRef = useRef(Date.now());
  
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();

  const item = practice || advisor;
  
  if (!item) return null;
  
  const isPractice = !!practice;

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check for bot submission
    const timePassed = Date.now() - formRenderTimeRef.current;
    const form = e.currentTarget;
    const honeypotValue = (form.elements.namedItem('honeypot') as HTMLInputElement)?.value;
    
    // If the honeypot field is filled or the form was submitted too quickly, 
    // treat it as a bot submission
    if (honeypotValue || timePassed < 1000) {
      console.log('Bot submission detected and blocked');
      // Still show success message to avoid alerting bots
      toast({
        title: "Message sent",
        description: `Your inquiry has been sent to the ${isPractice ? "seller" : "buyer"}.`,
      });
      return;
    }
    
    setIsSending(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSending(false);
      toast({
        title: "Message sent",
        description: `Your inquiry has been sent to the ${isPractice ? "seller" : "buyer"}.`,
      });
      
      // Reset form
      setContactName("");
      setContactEmail("");
      setContactPhone("");
      setContactMessage("");
    }, 1000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto mx-auto p-6 sm:w-[80%] md:w-[65%]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{item.title}</DialogTitle>
          <div className="flex items-center mt-1">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="text-muted-foreground">{item.location}</span>
            {item.status && (
              <Badge className="ml-2" variant="outline">
                {item.status}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-8 text-base">
          {/* Metrics Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-muted/20 p-4 rounded-lg">
            {isPractice ? (
              // Practice metrics
              <>
                <div>
                  <div className="text-sm text-muted-foreground">AUM</div>
                  <div className="font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                    {practice.aum}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Revenue</div>
                  <div className="font-medium flex items-center">
                    <DollarSign className="h-4 w-4 mr-1 text-primary" />
                    {practice.revenue}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Clients</div>
                  <div className="font-medium flex items-center">
                    <Users className="h-4 w-4 mr-1 text-primary" />
                    {practice.clients}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium flex items-center">
                    <Building2 className="h-4 w-4 mr-1 text-primary" />
                    {practice.type}
                  </div>
                </div>
              </>
            ) : (
              // Advisor metrics
              <>
                <div>
                  <div className="text-sm text-muted-foreground">Current AUM</div>
                  <div className="font-medium flex items-center">
                    <TrendingUp className="h-4 w-4 mr-1 text-primary" />
                    {advisor?.aum}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Target AUM</div>
                  <div className="font-medium flex items-center">
                    <FileText className="h-4 w-4 mr-1 text-primary" />
                    {advisor?.targetAum}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Experience</div>
                  <div className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-primary" />
                    {advisor?.experience}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Type</div>
                  <div className="font-medium flex items-center">
                    <Building2 className="h-4 w-4 mr-1 text-primary" />
                    {advisor?.type}
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Description Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-base leading-relaxed">{item.description}</p>
          </div>
          
          {/* Key Features Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Key Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {item.tags.map((tag, index) => (
                <div key={index} className="flex items-start">
                  <div className="mr-2 mt-0.5 bg-primary/10 rounded-full p-1">
                    <Check className="h-3 w-3 text-primary" />
                  </div>
                  <div className="text-sm font-medium">{tag}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Details Section */}
          <div>
            {isPractice ? (
              // Practice details
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Practice Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Established</div>
                      <div className="text-base">{practice.established || "2005"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Client Average Age</div>
                      <div className="text-base">{practice.clientAvgAge || "63 years"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Investment Style</div>
                      <div className="text-base">{practice.investmentStyle || "Balanced growth with income focus"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Fee Structure</div>
                      <div className="text-base">{practice.feeStructure || "Fee-based (95%), commission (5%)"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Growth Rate</div>
                      <div className="text-base">{practice.growthRate || "6.5% annually (3-year average)"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Client Retention Rate</div>
                      <div className="text-base">{practice.clientRetentionRate || "97% annually"}</div>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Sale Terms</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Asking Price</div>
                      <div className="text-base">{practice.askingPrice || "2.4x revenue"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Transition Period</div>
                      <div className="text-base">{practice.transitionPeriod || "6-12 months"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Seller Motivation</div>
                      <div className="text-base">{practice.sellerMotivation || "Retirement planning"}</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Advisor details
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Buyer Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Preferred Timeframe</div>
                      <div className="text-base">{advisor?.preferredTimeframe || "3-6 months"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Funding Available</div>
                      <div className="text-base">{advisor?.fundingAvailable || "Financing in place"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Investment Approach</div>
                      <div className="text-base">{advisor?.investmentApproach || "Passive core with active satellite"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Preferred Client Type</div>
                      <div className="text-base">{advisor?.preferredClientType || "Pre-retirees and business owners"}</div>
                    </div>
                    <div className="p-2 bg-background border border-border/20 rounded-md">
                      <div className="text-sm font-semibold">Successor Experience</div>
                      <div className="text-base">{advisor?.successorExperience || "15+ years in wealth management"}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Contact Form Section */}
          <div id="contact-form-section" className="bg-muted/20 p-6 rounded-lg mt-6">
            <h3 className="text-lg font-medium mb-2">Contact {isPractice ? "Seller" : "Buyer"}</h3>
            <p className="text-muted-foreground mb-4">
              Complete the form below to express your interest in this {isPractice ? "practice" : "buying opportunity"}.
              Your information will be sent securely to the {isPractice ? "seller" : "buyer"}.
            </p>
            
            <form onSubmit={handleContactSubmit} className="space-y-4">
              {/* Honeypot field for spam protection */}
              <Honeypot />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">
                    Your Name <span className="text-destructive">*</span>
                  </label>
                  <Input 
                    id="name"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email">
                    Email Address <span className="text-destructive">*</span>
                  </label>
                  <Input 
                    id="email"
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="interested@myadvisory.com"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="phone">
                  Phone Number <span className="text-destructive">*</span>
                </label>
                <Input 
                  id="phone"
                  type="tel"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  placeholder="Your phone number"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="message">
                  Message <span className="text-destructive">*</span>
                </label>
                <Textarea 
                  id="message"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={`Tell the ${isPractice ? "seller" : "buyer"} about your interest and any questions you have...`}
                  rows={4}
                  required
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSending}>
                {isSending ? "Sending..." : `Send Message to ${isPractice ? "Seller" : "Buyer"}`}
              </Button>
            </form>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Optimized with memo to prevent unnecessary rerenders
const MemoizedPracticeDetailDialog = memo(PracticeDetailDialog);
export default MemoizedPracticeDetailDialog;