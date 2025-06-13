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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FirmProfile } from "@/lib/airtable-service";
import { 
  UploadIcon, 
  ImageIcon, 
  AlertCircleIcon, 
  Sparkles, 
  RefreshCw, 
  Check, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Globe,
  BarChart4,
  Building2,
  Calendar,
  Users,
  DollarSign
} from "lucide-react";

// Define interface for AI-generated data
interface AIGeneratedData {
  stockPrice?: string;
  lastClosePrice?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    facebook?: string;
    website?: string;
  };
  headcount?: number;
  totalAUM?: string;
  creditRating?: string;
}

// Define props for the component
interface FirmProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: FirmProfile | null;
  onSave: (profile: FirmProfile) => void;
}

export function FirmProfileDialog({ 
  open, 
  onOpenChange, 
  profile, 
  onSave 
}: FirmProfileDialogProps) {
  // Form state
  const [firm, setFirm] = useState('');
  const [ceo, setCeo] = useState('');
  const [bio, setBio] = useState('');
  const [founded, setFounded] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  
  // AI enhancement state
  const [isGeneratingProfile, setIsGeneratingProfile] = useState(false);
  const [aiData, setAiData] = useState<AIGeneratedData | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  
  // Reset form when profile changes
  useEffect(() => {
    if (profile) {
      setFirm(profile.firm);
      setCeo(profile.ceo);
      
      // Handle bio which might be a string or an object with a value property
      if (typeof profile.bio === 'string') {
        setBio(profile.bio);
      } else if (profile.bio && typeof profile.bio === 'object') {
        setBio(profile.bio.value || '');
      } else {
        setBio('');
      }
      
      setFounded(profile.founded);
      setHeadquarters(profile.headquarters);
      setLogoUrl(profile.logoUrl);
      
      // Reset AI data
      setAiData(null);
      setAiError(null);
    } else {
      // Reset form for new profile
      setFirm('');
      setCeo('');
      setBio('');
      setFounded('');
      setHeadquarters('');
      setLogoUrl('');
      setAiData(null);
      setAiError(null);
    }
  }, [profile]);
  
  // Function to generate AI profile data
  const generateAIProfileData = async () => {
    if (!firm) {
      toast({
        title: "Firm name required",
        description: "Please enter a firm name first before generating AI content",
        variant: "destructive"
      });
      return;
    }
    
    setIsGeneratingProfile(true);
    setAiError(null);
    
    try {
      const response = await fetch(`/api/firm-profiles/${encodeURIComponent(firm)}/enhanced`);
      const data = await response.json();
      
      console.log("AI profile generation response:", data);
      
      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.message || "Failed to generate profile data");
      }
      
      // If success is explicitly false
      if (data.success === false) {
        setAiError(data.ai_error || data.message || "AI enhancement failed");
        toast({
          title: "AI Enhancement Limited",
          description: data.ai_error || data.message || "Unable to generate enhanced profile data",
          variant: "destructive"
        });
        return;
      }
      
      // If AI data is included in the response
      if (data.ai_generated) {
        setAiData(data.ai_generated);
        
        // Update form fields if they're empty and data is available
        if (!ceo && data.ceo) setCeo(data.ceo);
        if (!bio && data.bio) {
          // Handle bio which might be a string or an object with a value property
          if (typeof data.bio === 'string') {
            setBio(data.bio);
          } else if (data.bio && typeof data.bio === 'object' && data.bio.value) {
            setBio(data.bio.value);
          }
        }
        if (!founded && data.founded) setFounded(data.founded);
        if (!headquarters && data.headquarters) setHeadquarters(data.headquarters);
        
        toast({
          title: "AI Profile Generated",
          description: "Company profile has been enhanced with AI-generated data.",
        });
      } else if (data.ai_error) {
        setAiError(data.ai_error);
        toast({
          title: "AI Enhancement Limited",
          description: data.ai_error,
          variant: "destructive"
        });
      }
    } catch (error: any) {
      console.error("Error generating profile:", error);
      setAiError(error.message || "Failed to generate profile data");
      toast({
        title: "AI Generation Failed",
        description: error.message || "Unable to generate AI profile data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGeneratingProfile(false);
    }
  };
  
  // Handle form submission
  const handleSave = () => {
    if (!firm) {
      toast({
        title: "Firm name is required",
        variant: "destructive"
      });
      return;
    }
    
    // Create basic profile data
    const profileData: FirmProfile & { aiData?: string } = {
      id: profile?.id || `new_profile_${Date.now()}`,
      firm,
      ceo,
      bio,
      founded,
      headquarters,
      logoUrl
    };
    
    // Add AI data if available
    if (aiData) {
      // Store AI data as a JSON string in the aiData field
      profileData.aiData = JSON.stringify(aiData);
      
      toast({
        title: "Profile saved with AI data",
        description: "The profile includes AI-generated business intelligence data."
      });
    }
    
    // Pass to parent component
    onSave(profileData);
    onOpenChange(false);
  };
  
  // Add a state for handling loading status
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Handle image URL input with validation
  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setLogoUrl(url);
    
    // Basic validation feedback
    if (url && url.length > 0) {
      // Check if URL is in correct format
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        toast({
          title: "Invalid URL format",
          description: "URLs must start with http:// or https://",
          variant: "destructive"
        });
      } else if (!url.match(/\.(jpeg|jpg|gif|png|svg|webp)$/i) && !url.includes('?') && !url.includes('=')) {
        // Simple check for image file extensions, but allow URLs with query parameters
        toast({
          title: "URL may not be an image",
          description: "The URL doesn't end with a common image extension. You can still try it, but it may not work.",
          variant: "destructive"
        });
      }
    }
  };
  
  // Handle image URL validation
  const validateImageUrl = async () => {
    if (!logoUrl) return;
    
    // Set loading state
    setIsUploadingImage(true);
    
    // Check if URL is valid
    if (!logoUrl.startsWith('http://') && !logoUrl.startsWith('https://')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid URL starting with http:// or https://",
        variant: "destructive"
      });
      setIsUploadingImage(false);
      return;
    }
    
    // Show validating toast
    toast({
      title: "Validating image URL...",
      description: "Checking if the image URL is accessible",
    });
    
    try {
      // Create a new image to test if the URL is valid with a timeout
      const imageLoadPromise = new Promise<boolean>((resolve, reject) => {
        const img = new Image();
        
        // Set a timeout of 10 seconds
        const timeout = setTimeout(() => {
          reject(new Error("Image validation timed out"));
        }, 10000);
        
        img.onload = () => {
          clearTimeout(timeout);
          resolve(true);
        };
        
        img.onerror = () => {
          clearTimeout(timeout);
          reject(new Error("Could not load image from URL"));
        };
        
        img.src = logoUrl;
      });
      
      await imageLoadPromise;
      
      // If we get here, the image loaded successfully
      toast({
        title: "Image URL verified",
        description: "The image URL is valid and will be used for the firm logo",
      });
      
      // Additional metadata check for image size and dimensions
      try {
        const response = await fetch(logoUrl, { method: 'HEAD' });
        const contentType = response.headers.get('content-type');
        const contentLength = response.headers.get('content-length');
        
        if (contentType && !contentType.startsWith('image/')) {
          toast({
            title: "Warning: Content may not be an image",
            description: `Content type: ${contentType}`,
            variant: "destructive"
          });
        }
        
        if (contentLength) {
          const sizeInMB = parseInt(contentLength, 10) / (1024 * 1024);
          if (sizeInMB > 5) {
            toast({
              title: "Warning: Large image",
              description: `Image size is ${sizeInMB.toFixed(2)}MB. Consider using a smaller image for better performance.`,
              variant: "destructive"
            });
          }
        }
      } catch (metadataError) {
        // If we can't get metadata, it's not critical
        console.warn("Could not fetch image metadata:", metadataError);
      }
      
    } catch (error) {
      console.error("Image validation error:", error);
      toast({
        title: "Invalid image URL",
        description: "Could not load image from the provided URL. Please check and try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploadingImage(false);
    }
  };
  
  // Handle file upload for logo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image file (JPEG, PNG, GIF, SVG)",
        variant: "destructive"
      });
      return;
    }
    
    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive"
      });
      return;
    }
    
    setIsUploadingImage(true);
    
    // Show loading toast
    toast({
      title: "Uploading logo...",
      description: `Uploading ${file.name}`,
    });
    
    // Simulate upload delay
    setTimeout(() => {
      // In a real implementation, this would upload to a storage service
      // and return the actual URL to the uploaded file
      
      // For demo purposes, create a data URL from the file
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setLogoUrl(dataUrl);
        
        toast({
          title: "Logo uploaded successfully",
          description: `${file.name} has been uploaded and will be used for ${firm}`,
        });
        setIsUploadingImage(false);
      };
      
      reader.onerror = () => {
        toast({
          title: "Upload failed",
          description: "There was an error processing your file. Please try again.",
          variant: "destructive"
        });
        setIsUploadingImage(false);
      };
      
      reader.readAsDataURL(file);
    }, 1000);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {profile ? (
              <div className="flex items-center gap-2">
                <span>Edit {profile.firm} Profile</span>
                {profile.logoUrl && (
                  <img 
                    src={profile.logoUrl} 
                    alt={`${profile.firm} logo`}
                    className="h-6 w-auto"
                  />
                )}
              </div>
            ) : 'Add New Firm Profile'}
          </DialogTitle>
          <DialogDescription>
            {profile 
              ? `Customize the company details, CEO information, and logo for ${profile.firm}.` 
              : 'Create a new firm profile with company details and branding information.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* AI Profile Generation Button */}
          <div className="border rounded-lg p-4 bg-blue-50 dark:bg-blue-950">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h3 className="font-semibold text-blue-800 dark:text-blue-300">AI-Powered Profile Generation</h3>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateAIProfileData} 
                disabled={isGeneratingProfile || !firm}
                className="gap-2"
              >
                {isGeneratingProfile ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span>Generate Profile</span>
                  </>
                )}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mb-2">
              Let AI help you generate comprehensive company information including stock data, 
              social links, headcount, AUM, and more.
            </p>
            {aiError && (
              <Alert variant="destructive" className="mt-2">
                <AlertCircleIcon className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{aiError}</AlertDescription>
              </Alert>
            )}
          </div>
          
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
            <Label htmlFor="ceo" className="text-right">
              CEO Name
            </Label>
            <Input
              id="ceo"
              value={ceo}
              onChange={(e) => setCeo(e.target.value)}
              className="col-span-3"
            />
          </div>
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="bio" className="text-right pt-2">
              Company Bio
            </Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="col-span-3 min-h-[120px]"
              placeholder="Enter a description of the firm..."
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="founded" className="text-right">
              Founded Year
            </Label>
            <Input
              id="founded"
              value={founded}
              onChange={(e) => setFounded(e.target.value)}
              className="col-span-3"
              placeholder="e.g., 1985"
            />
          </div>
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="headquarters" className="text-right">
              Headquarters
            </Label>
            <Input
              id="headquarters"
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              className="col-span-3"
              placeholder="e.g., New York, NY"
            />
          </div>
          
          {/* AI-Generated Data Display */}
          {aiData && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                AI-Generated<br />Company Data
              </Label>
              <div className="col-span-3">
                <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/50">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-blue-600" />
                      Enhanced Profile Data
                    </CardTitle>
                    <CardDescription>
                      AI-generated company information for {firm}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Stock Price</p>
                          <Badge variant="outline" className="bg-white dark:bg-gray-900">
                            {aiData.stockPrice || "N/A"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart4 className="h-4 w-4 text-blue-600" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Last Close Price</p>
                          <Badge variant="outline" className="bg-white dark:bg-gray-900">
                            {aiData.lastClosePrice || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Social Links</h4>
                      <div className="flex flex-wrap gap-2">
                        {aiData.socialLinks?.twitter && (
                          <a 
                            href={aiData.socialLinks.twitter} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs py-1 px-2 rounded bg-white dark:bg-gray-900 border"
                          >
                            <Twitter className="h-3.5 w-3.5 text-sky-500" />
                            Twitter
                          </a>
                        )}
                        {aiData.socialLinks?.linkedin && (
                          <a 
                            href={aiData.socialLinks.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs py-1 px-2 rounded bg-white dark:bg-gray-900 border"
                          >
                            <Linkedin className="h-3.5 w-3.5 text-blue-600" />
                            LinkedIn
                          </a>
                        )}
                        {aiData.socialLinks?.facebook && (
                          <a 
                            href={aiData.socialLinks.facebook} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs py-1 px-2 rounded bg-white dark:bg-gray-900 border"
                          >
                            <Facebook className="h-3.5 w-3.5 text-blue-700" />
                            Facebook
                          </a>
                        )}
                        {aiData.socialLinks?.website && (
                          <a 
                            href={aiData.socialLinks.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs py-1 px-2 rounded bg-white dark:bg-gray-900 border"
                          >
                            <Globe className="h-3.5 w-3.5 text-gray-600" />
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-600" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Headcount</p>
                          <Badge variant="outline" className="bg-white dark:bg-gray-900">
                            {aiData.headcount?.toLocaleString() || "N/A"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Total AUM</p>
                          <Badge variant="outline" className="bg-white dark:bg-gray-900">
                            {aiData.totalAUM || "N/A"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-amber-600" />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">Credit Rating</p>
                          <Badge variant="outline" className="bg-white dark:bg-gray-900">
                            {aiData.creditRating || "N/A"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="logo" className="text-right pt-2">
              Company Logo
            </Label>
            <div className="col-span-3">
              <div className="flex flex-col gap-4">
                {logoUrl && (
                  <div className="border rounded p-3 flex flex-col items-center max-w-sm">
                    <img 
                      src={logoUrl} 
                      alt={`${firm} logo`} 
                      className="max-w-full max-h-[150px] object-contain mb-2"
                    />
                    <div className="text-xs text-muted-foreground text-center">
                      Current logo for {firm}
                    </div>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Option 1: Upload a new logo</Label>
                  <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-3 bg-muted/30">
                    <Input
                      id="logo"
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="col-span-3 max-w-[300px]"
                    />
                    <p className="text-xs text-muted-foreground text-center">
                      Upload a company logo (JPG, PNG, or SVG format).<br/>
                      Recommended size: 400×200 pixels.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Option 2: Use an image URL</Label>
                  <div className="flex gap-2">
                    <Input
                      id="logoUrl"
                      value={logoUrl}
                      onChange={handleImageUrlChange}
                      className="flex-1"
                      placeholder="https://example.com/logo.png"
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={validateImageUrl}
                      disabled={!logoUrl || isUploadingImage}
                      className="whitespace-nowrap"
                    >
                      Verify URL
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter a publicly accessible URL to an image (must start with http:// or https://)
                  </p>
                  {logoUrl && logoUrl.startsWith('http') && (
                    <div className="flex items-center text-xs text-muted-foreground">
                      <span className="text-green-500 mr-1">✓</span> URL format is valid. Click "Verify URL" to check if the image is accessible.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Check className="h-4 w-4" />
            Save Profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}