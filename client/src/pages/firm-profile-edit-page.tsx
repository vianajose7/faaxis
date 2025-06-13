import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { FirmProfile } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { SimpleNavbar } from "@/components/layout/navbar";
import { PageHeader } from "@/components/layout/page-header";
import { Head } from "@/components/layout/head";

// Define validation schema
const formSchema = z.object({
  firm: z.string().min(1, "Firm name is required"),
  ceo: z.string().optional(),
  bio: z.string().optional(),
  logoUrl: z.string().optional(),
  founded: z.string().optional(),
  headquarters: z.string().optional(),
  category: z.string().optional(),
  slug: z.string().optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function FirmProfileEditPage() {
  const [match, params] = useRoute("/admin/firm-profiles/edit/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<FirmProfile | null>(null);
  
  const id = params?.id || "";
  
  // Configure form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firm: "",
      ceo: "",
      bio: "",
      logoUrl: "",
      founded: "",
      headquarters: "",
      category: "",
      slug: ""
    }
  });
  
  // Fetch firm profile data
  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      
      try {
        const response = await fetch(`/api/admin/firm-profiles/id/${id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch firm profile");
        }
        
        const data = await response.json();
        setProfile(data);
        
        // Set form values
        form.reset({
          firm: data.firm || "",
          ceo: data.ceo || "",
          bio: data.bio || "",
          logoUrl: data.logoUrl || "",
          founded: data.founded || "",
          headquarters: data.headquarters || "",
          category: data.category || "",
          slug: data.slug || ""
        });
      } catch (error) {
        console.error("Error fetching firm profile:", error);
        toast({
          title: "Error",
          description: "Failed to load firm profile data",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    }
    
    if (id) {
      fetchProfile();
    }
  }, [id, form, toast]);
  
  // Generate a slug from the firm name
  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]+/g, '')
      .replace(/-+/g, '')
      .trim();
  };
  
  // Auto-update slug when firm name changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'firm') {
        const firmName = value.firm as string || '';
        form.setValue('slug', generateSlug(firmName));
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Save profile data
  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    
    try {
      const response = await fetch(`/api/admin/firm-profiles/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error("Failed to save firm profile");
      }
      
      toast({
        title: "Success",
        description: "Firm profile updated successfully",
        variant: "success"
      });
      
      // Navigate back to admin page
      setLocation("/admin/landing-pages");
    } catch (error) {
      console.error("Error saving firm profile:", error);
      toast({
        title: "Error",
        description: "Failed to save firm profile data",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (adminCheckLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAdmin) {
    setLocation("/login");
    return null;
  }
  
  return (
    <>
      <Head title="Edit Firm Profile" />
      <SimpleNavbar />
      <div className="container max-w-5xl py-4 space-y-6">
        <PageHeader 
          title="Edit Firm Profile" 
          description="Update details about this wealth management firm"
          action={
            <Button variant="outline" onClick={() => setLocation("/admin/landing-pages")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Button>
          }
        />
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Card className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firm">Firm Name</Label>
                    <Input
                      id="firm"
                      {...form.register("firm")}
                      placeholder="e.g. Morgan Stanley"
                    />
                    {form.formState.errors.firm && (
                      <p className="text-sm text-red-500">{form.formState.errors.firm.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="slug">URL Slug</Label>
                    <Input
                      id="slug"
                      {...form.register("slug")}
                      placeholder="e.g. morganstanley"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      This will be used in the URL: /{form.watch("slug")}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ceo">CEO / Chairman</Label>
                    <Input
                      id="ceo"
                      {...form.register("ceo")}
                      placeholder="e.g. James Gorman"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="founded">Founded</Label>
                    <Input
                      id="founded"
                      {...form.register("founded")}
                      placeholder="e.g. 1935"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="headquarters">Headquarters</Label>
                    <Input
                      id="headquarters"
                      {...form.register("headquarters")}
                      placeholder="e.g. New York, NY"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      {...form.register("category")}
                      placeholder="e.g. Wirehouse, Independent, RIA"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      {...form.register("logoUrl")}
                      placeholder="https://example.com/logo.png"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="bio">Firm Description</Label>
                    <Textarea
                      id="bio"
                      {...form.register("bio")}
                      rows={6}
                      placeholder="Enter details about the firm..."
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  disabled={saving || loading}
                  className="min-w-[120px]"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </>
  );
}