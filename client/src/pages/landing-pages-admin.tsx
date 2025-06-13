import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// Helper function to create slug from firm name
const createSlug = (name: string) => {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .replace(/-+/g, '')
    .trim();
};

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowUpRight,
  Loader2,
  PlusCircle,
  RefreshCw,
  Globe,
  FileText,
  Edit,
  Trash2,
  Image,
  ExternalLink,
} from "lucide-react";

// Landing page schema
const landingPageSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required"),
  targetFirm: z.string().min(1, "Target firm is required"),
  description: z.string().min(1, "Description is required"),
  logoUrl: z.string().url("Logo URL must be a valid URL").optional(),
  heroColor: z.string().min(1, "Hero color is required"),
  isActive: z.boolean().default(true),
});

type LandingPage = z.infer<typeof landingPageSchema>;

// Firm Profiles Landing Page Table component
function FirmProfilesTableComponent() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [firmProfiles, setFirmProfiles] = useState<any[]>([]);

  useEffect(() => {
    const fetchFirmProfiles = async () => {
      setIsLoading(true);
      try {
        const res = await apiRequest("GET", "/api/firm-profiles");
        if (!res.ok) {
          throw new Error("Failed to fetch firm profiles");
        }
        const data = await res.json();
        setFirmProfiles(data);
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFirmProfiles();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (firmProfiles.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/30 rounded-lg border border-dashed">
        <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No firm profiles found</h3>
        <p className="mt-1 text-muted-foreground max-w-md mx-auto">
          Firm profiles can be created and managed in the Firm Profiles Admin section.
        </p>
        <Button 
          variant="outline" 
          className="mt-4"
          asChild
        >
          <Link href="/firm-profiles-admin">Go to Firm Profiles Admin</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Firm Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>View</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {firmProfiles.map((profile) => (
            <TableRow key={profile.id}>
              <TableCell className="font-medium">{profile.firm}</TableCell>
              <TableCell>{profile.category || "N/A"}</TableCell>
              <TableCell>
                <div className="flex items-center">
                  <code className="text-xs bg-muted p-1 rounded">/{profile.slug || createSlug(profile.firm)}</code>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/${profile.slug || createSlug(profile.firm)}`} target="_blank">
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                  >
                    <Link href={`/firm-profiles/edit/${profile.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function LandingPagesAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [selectedLandingPage, setSelectedLandingPage] = useState<LandingPage | null>(null);

  // Form setup
  const form = useForm<LandingPage>({
    resolver: zodResolver(landingPageSchema),
    defaultValues: {
      title: "",
      slug: "",
      targetFirm: "",
      description: "",
      logoUrl: "",
      heroColor: "#1d4ed8", // Default blue color
      isActive: true,
    },
  });

  // Fetch landing pages
  const { data: landingPages, isLoading } = useQuery<LandingPage[]>({
    queryKey: ["/api/admin/landing-pages"],
    queryFn: async () => {
      const res = await apiRequest("GET", "/api/admin/landing-pages");
      if (!res.ok) {
        throw new Error("Failed to fetch landing pages");
      }
      return res.json();
    },
  });

  // Create landing page mutation
  const createLandingPageMutation = useMutation({
    mutationFn: async (data: LandingPage) => {
      const res = await apiRequest("POST", "/api/admin/landing-pages", data);
      if (!res.ok) {
        throw new Error("Failed to create landing page");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-pages"] });
      setIsDialogOpen(false);
      form.reset();
      toast({
        title: "Landing page created",
        description: "The landing page has been created successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update landing page mutation
  const updateLandingPageMutation = useMutation({
    mutationFn: async (data: LandingPage) => {
      const res = await apiRequest("PUT", `/api/admin/landing-pages/${data.id}`, data);
      if (!res.ok) {
        throw new Error("Failed to update landing page");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-pages"] });
      setIsDialogOpen(false);
      form.reset();
      setSelectedLandingPage(null);
      toast({
        title: "Landing page updated",
        description: "The landing page has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete landing page mutation
  const deleteLandingPageMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("DELETE", `/api/admin/landing-pages/${id}`);
      if (!res.ok) {
        throw new Error("Failed to delete landing page");
      }
      return res.status === 204 ? {} : res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/landing-pages"] });
      toast({
        title: "Landing page deleted",
        description: "The landing page has been deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Open dialog for editing
  const handleEditLandingPage = (landingPage: LandingPage) => {
    setSelectedLandingPage(landingPage);
    form.reset(landingPage);
    setIsDialogOpen(true);
  };

  // Open dialog for creating
  const handleAddNewLandingPage = () => {
    setSelectedLandingPage(null);
    form.reset({
      title: "",
      slug: "",
      targetFirm: "",
      description: "",
      logoUrl: "",
      heroColor: "#1d4ed8",
      isActive: true,
    });
    setIsDialogOpen(true);
  };

  // Handle form submission
  const onSubmit = (data: LandingPage) => {
    if (selectedLandingPage) {
      updateLandingPageMutation.mutate({ ...data, id: selectedLandingPage.id });
    } else {
      createLandingPageMutation.mutate(data);
    }
  };

  // Handle landing page deletion
  const handleDeleteLandingPage = (id: string) => {
    if (confirm("Are you sure you want to delete this landing page?")) {
      deleteLandingPageMutation.mutate(id);
    }
  };

  // Access control check
  if (!user || !user.isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="bg-destructive/10 p-6 rounded-lg border border-destructive">
          <h1 className="text-xl font-bold text-destructive">Access Denied</h1>
          <p className="mt-2">You do not have permission to access this page.</p>
          <Link href="/admin-login">
            <Button className="mt-4">Go to Login</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Landing Pages Management</h1>
          <p className="text-muted-foreground">Create and manage specialized landing pages for different advisor firms.</p>
        </div>
        <Button onClick={handleAddNewLandingPage} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Create New Landing Page
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="all" onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Pages</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="firm-profiles">Firm Profiles</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <LandingPageTable
              landingPages={landingPages || []}
              onEdit={handleEditLandingPage}
              onDelete={handleDeleteLandingPage}
            />
          </TabsContent>

          <TabsContent value="active">
            <LandingPageTable
              landingPages={(landingPages || []).filter(page => page.isActive)}
              onEdit={handleEditLandingPage}
              onDelete={handleDeleteLandingPage}
            />
          </TabsContent>

          <TabsContent value="inactive">
            <LandingPageTable
              landingPages={(landingPages || []).filter(page => !page.isActive)}
              onEdit={handleEditLandingPage}
              onDelete={handleDeleteLandingPage}
            />
          </TabsContent>

          <TabsContent value="firm-profiles">
            <FirmProfilesTableComponent />
          </TabsContent>
        </Tabs>
      )}

      {/* Landing Page Edit/Create Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedLandingPage ? "Edit Landing Page" : "Create New Landing Page"}
            </DialogTitle>
            <DialogDescription>
              {selectedLandingPage
                ? "Update the details of this landing page"
                : "Create a new targeted landing page for advisors"}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Commonwealth Advisors Landing Page" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL Slug</FormLabel>
                      <FormControl>
                        <Input placeholder="commonwealth-lpl" {...field} />
                      </FormControl>
                      <FormDescription>
                        Will be accessible at /landing/[slug]
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="targetFirm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Firm</FormLabel>
                      <FormControl>
                        <Input placeholder="Commonwealth Financial" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="heroColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hero Section Color</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input type="color" {...field} />
                        </FormControl>
                        <Input
                          placeholder="#1d4ed8"
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Landing page for Commonwealth Advisors considering their options following the LPL acquisition"
                        {...field}
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/logo.svg"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to the firm's logo image (SVG format preferred)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <label htmlFor="isActive" className="text-sm font-medium leading-none cursor-pointer">
                          Active
                        </label>
                      </div>
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormDescription>
                        When active, this landing page will be publicly accessible
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="submit"
                  disabled={
                    createLandingPageMutation.isPending ||
                    updateLandingPageMutation.isPending
                  }
                >
                  {(createLandingPageMutation.isPending ||
                    updateLandingPageMutation.isPending) && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  {selectedLandingPage ? "Update Landing Page" : "Create Landing Page"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface LandingPageTableProps {
  landingPages: LandingPage[];
  onEdit: (landingPage: LandingPage) => void;
  onDelete: (id: string) => void;
}

// Landing Page Table component
function LandingPageTable({ landingPages, onEdit, onDelete }: LandingPageTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Target Firm</TableHead>
            <TableHead>URL</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {landingPages.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                No landing pages found. Create your first landing page.
              </TableCell>
            </TableRow>
          ) : (
            landingPages.map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell>{page.targetFirm}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <code className="text-xs bg-muted p-1 rounded">/landing/{page.slug}</code>
                    <a
                      href={`/landing/${page.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary ml-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      page.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {page.isActive ? "Active" : "Inactive"}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(page)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(page.id as string)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}