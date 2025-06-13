import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Form schema for practice listing submission
const listingFormSchema = z.object({
  title: z.string().min(5, {
    message: "Title must be at least 5 characters.",
  }),
  location: z.string().min(2, {
    message: "Please enter a valid location.",
  }),
  aum: z.string().min(1, {
    message: "Please enter AUM value.",
  }),
  revenue: z.string().min(1, {
    message: "Please enter revenue value.",
  }),
  clients: z.string().min(1, {
    message: "Please enter number of clients.",
  }),
  type: z.string({
    required_error: "Please select a listing type.",
  }),
  description: z.string().min(20, {
    message: "Description must be at least 20 characters.",
  }),
  contactName: z.string().min(2, {
    message: "Please enter your name.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().min(10, {
    message: "Please enter a valid phone number.",
  }),
});

type ListingFormValues = z.infer<typeof listingFormSchema>;

// Default values for the form
const defaultValues: Partial<ListingFormValues> = {
  title: "",
  location: "",
  aum: "",
  revenue: "",
  clients: "",
  type: "",
  description: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

interface ListPracticeDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ListPracticeDialog({ isOpen, onClose }: ListPracticeDialogProps) {
  const { toast } = useToast();
  
  // Form definition
  const form = useForm<ListingFormValues>({
    resolver: zodResolver(listingFormSchema),
    defaultValues,
  });
  
  // Submit handler
  function onSubmit(data: ListingFormValues) {
    // In a real application, this would send the data to your backend
    console.log("Form submitted:", data);
    
    // Show success message
    toast({
      title: "Practice Listing Submitted",
      description: "Thank you for your submission. Our team will review your listing and contact you shortly.",
    });
    
    // Reset form and close dialog
    form.reset();
    onClose();
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">List Your Practice</DialogTitle>
          <DialogDescription>
            Complete the form below to list your practice on our marketplace. Our team will review your submission and contact you within 1-2 business days.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Practice Information</h3>
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Practice Title*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Established Wealth Management Practice" {...field} />
                    </FormControl>
                    <FormDescription>
                      A descriptive title for your practice listing
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location*</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Atlanta, GA" {...field} />
                    </FormControl>
                    <FormDescription>
                      City and state of your practice
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="aum"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AUM*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $120M" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="revenue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Annual Revenue*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., $1.2M" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clients"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Number of Clients*</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 120" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Type*</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select listing type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Full Practice Sale">Full Practice Sale</SelectItem>
                        <SelectItem value="Partial Book Sale">Partial Book Sale</SelectItem>
                        <SelectItem value="Succession Planning">Succession Planning</SelectItem>
                        <SelectItem value="Merger">Merger</SelectItem>
                        <SelectItem value="Partial Acquisition">Partial Acquisition</SelectItem>
                        <SelectItem value="Equity Sale">Equity Sale</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Type of transaction you're seeking
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Practice Description*</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Provide a detailed description of your practice including client demographics, service model, growth trajectory, and reason for selling." 
                        className="min-h-[120px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Detailed description to attract potential buyers (minimum 20 characters)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <h3 className="text-lg font-medium pt-4">Contact Information</h3>
              
              <FormField
                control={form.control}
                name="contactName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Name*</FormLabel>
                    <FormControl>
                      <Input placeholder="Full Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address*</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@yourpractice.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number*</FormLabel>
                      <FormControl>
                        <Input placeholder="(555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Submit Listing</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}