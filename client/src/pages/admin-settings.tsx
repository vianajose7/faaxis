import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Save, Key, Database, CheckCircle2, Mail, Shield, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Label } from "@/components/ui/label";
import { apiRequest } from '@/lib/queryClient';
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// API key schema
const apiKeySchema = z.object({
  openaiKey: z.string().optional(),
  stripeSecretKey: z.string().optional(),
  stripePublishableKey: z.string().optional(),
  mailersendKey: z.string().optional(),
  airtableApiKey: z.string().optional(),
});

// Email settings schema
const emailSettingsSchema = z.object({
  fromEmail: z.string().email("Please enter a valid email"),
  replyToEmail: z.string().email("Please enter a valid email"),
  adminEmail: z.string().email("Please enter a valid email"),
  emailTemplateId: z.string().optional(),
  resetPasswordTemplateId: z.string().optional(),
  verificationTemplateId: z.string().optional(),
});

export default function AdminSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("account");

  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // API keys form
  const apiKeysForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      openaiKey: "",
      stripeSecretKey: "",
      stripePublishableKey: "",
      mailersendKey: "",
      airtableApiKey: "",
    },
  });

  // Email settings form
  const emailSettingsForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: {
      fromEmail: "noreply@faaxis.com",
      replyToEmail: "support@faaxis.com",
      adminEmail: "admin@faaxis.com",
      emailTemplateId: "",
      resetPasswordTemplateId: "",
      verificationTemplateId: "",
    },
  });

  // Fetch API keys
  const { data: apiKeys, isLoading: isLoadingKeys } = useQuery({
    queryKey: ['/api/admin/api-keys'],
    queryFn: async () => {
      const response = await fetch('/api/admin/api-keys', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch API keys');
      }
      
      return response.json();
    },
  });
  
  // Set form values when API keys data is loaded
  useEffect(() => {
    if (apiKeys) {
      apiKeysForm.reset({
        openaiKey: apiKeys.openaiKey || "",
        stripeSecretKey: apiKeys.stripeSecretKey || "",
        stripePublishableKey: apiKeys.stripePublishableKey || "",
        mailersendKey: apiKeys.mailersendKey || "",
        airtableApiKey: apiKeys.airtableApiKey || "",
      });
    }
  }, [apiKeys, apiKeysForm]);

  // Fetch email settings
  const { data: emailSettings, isLoading: isLoadingEmail } = useQuery({
    queryKey: ['/api/admin/email-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/email-settings', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch email settings');
      }
      
      return response.json();
    },
  });
  
  // Set form values when email settings data is loaded
  useEffect(() => {
    if (emailSettings) {
      emailSettingsForm.reset({
        fromEmail: emailSettings.fromEmail || "noreply@faaxis.com",
        replyToEmail: emailSettings.replyToEmail || "support@faaxis.com",
        adminEmail: emailSettings.adminEmail || "admin@faaxis.com",
        emailTemplateId: emailSettings.emailTemplateId || "",
        resetPasswordTemplateId: emailSettings.resetPasswordTemplateId || "",
        verificationTemplateId: emailSettings.verificationTemplateId || "",
      });
    }
  }, [emailSettings, emailSettingsForm]);

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof passwordSchema>) => {
      return apiRequest('POST', '/api/admin/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      });
      passwordForm.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update password",
        description: error.message || "An error occurred while updating your password.",
        variant: "destructive",
      });
    },
  });

  // Update API keys mutation
  const updateApiKeysMutation = useMutation({
    mutationFn: async (data: z.infer<typeof apiKeySchema>) => {
      return apiRequest('POST', '/api/admin/api-keys', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-keys'] });
      toast({
        title: "API keys updated",
        description: "Your API keys have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update API keys",
        description: error.message || "An error occurred while updating API keys.",
        variant: "destructive",
      });
    },
  });

  // Update email settings mutation
  const updateEmailSettingsMutation = useMutation({
    mutationFn: async (data: z.infer<typeof emailSettingsSchema>) => {
      return apiRequest('POST', '/api/admin/email-settings', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/email-settings'] });
      toast({
        title: "Email settings updated",
        description: "Your email settings have been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update email settings",
        description: error.message || "An error occurred while updating email settings.",
        variant: "destructive",
      });
    },
  });

  // Test email mutation
  const testEmailMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('POST', '/api/admin/test-email', { email });
    },
    onSuccess: () => {
      toast({
        title: "Test email sent",
        description: "A test email has been sent to your email address.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send test email",
        description: error.message || "An error occurred while sending the test email.",
        variant: "destructive",
      });
    },
  });

  const onPasswordSubmit = (data: z.infer<typeof passwordSchema>) => {
    changePasswordMutation.mutate(data);
  };

  const onApiKeysSubmit = (data: z.infer<typeof apiKeySchema>) => {
    updateApiKeysMutation.mutate(data);
  };

  const onEmailSettingsSubmit = (data: z.infer<typeof emailSettingsSchema>) => {
    updateEmailSettingsMutation.mutate(data);
  };

  const handleTestEmail = () => {
    const email = user?.username;
    if (email) {
      testEmailMutation.mutate(email);
    } else {
      toast({
        title: "Email not found",
        description: "Your user account doesn't have an email address.",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading user information...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Settings</h1>
          <p className="text-muted-foreground">Manage your account, API keys, and platform settings.</p>
        </div>
      </div>

      <Tabs defaultValue="account" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Account
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex items-center gap-2">
            <Key className="h-4 w-4" /> API Keys
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="h-4 w-4" /> Performance
          </TabsTrigger>
        </TabsList>

        {/* Account Settings */}
        <TabsContent value="account">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
                <CardDescription>
                  View and update your account information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Email:</Label>
                    <span className="col-span-3">{user.username}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Full Name:</Label>
                    <span className="col-span-3">{user.fullName || "—"}</span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Admin Status:</Label>
                    <span className="col-span-3">
                      {user.isAdmin ? (
                        <Badge className="bg-blue-500">Administrator</Badge>
                      ) : (
                        "Regular User"
                      )}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Email Verification:</Label>
                    <span className="col-span-3">
                      {user.emailVerified ? (
                        <span className="text-green-600 flex items-center">
                          <CheckCircle2 className="h-4 w-4 mr-1" /> Verified
                        </span>
                      ) : (
                        <span className="text-amber-600">Not verified</span>
                      )}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Update your administrator password
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...passwordForm}>
                  <form 
                    onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} 
                    className="space-y-4"
                  >
                    <FormField
                      control={passwordForm.control}
                      name="currentPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Current Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your current password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your new password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={passwordForm.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Confirm your new password" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={changePasswordMutation.isPending} 
                      className="w-full"
                    >
                      {changePasswordMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Update Password
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* API Keys Settings */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Keys Configuration</CardTitle>
              <CardDescription>
                Configure API keys for external services integration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingKeys ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading API keys...</span>
                </div>
              ) : (
                <Form {...apiKeysForm}>
                  <form 
                    onSubmit={apiKeysForm.handleSubmit(onApiKeysSubmit)} 
                    className="space-y-6"
                  >
                    <div>
                      <h3 className="text-lg font-medium">OpenAI</h3>
                      <Separator className="my-2" />
                      <FormField
                        control={apiKeysForm.control}
                        name="openaiKey"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel>OpenAI API Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="sk-..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Used for blog generation and AI-enhanced profiles
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Stripe</h3>
                      <Separator className="my-2" />
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                        <FormField
                          control={apiKeysForm.control}
                          name="stripeSecretKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stripe Secret Key</FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder="sk_..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={apiKeysForm.control}
                          name="stripePublishableKey"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Stripe Publishable Key</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="pk_..." 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormDescription className="mt-2">
                        Used for payment processing and subscriptions
                      </FormDescription>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Email Service</h3>
                      <Separator className="my-2" />
                      <FormField
                        control={apiKeysForm.control}
                        name="mailersendKey"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel>MailerSend API Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="mlsn_..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Used for sending transactional emails
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium">Airtable</h3>
                      <Separator className="my-2" />
                      <FormField
                        control={apiKeysForm.control}
                        name="airtableApiKey"
                        render={({ field }) => (
                          <FormItem className="mt-2">
                            <FormLabel>Airtable API Key</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="key..." 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Used for firm data integration
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <Button 
                      type="submit" 
                      disabled={updateApiKeysMutation.isPending}
                    >
                      {updateApiKeysMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save API Keys
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>
                Configure email settings for the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingEmail ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Loading email settings...</span>
                </div>
              ) : (
                <Form {...emailSettingsForm}>
                  <form 
                    onSubmit={emailSettingsForm.handleSubmit(onEmailSettingsSubmit)} 
                    className="space-y-6"
                  >
                    <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                      <FormField
                        control={emailSettingsForm.control}
                        name="fromEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>From Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="noreply@yourdomain.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Email address to send emails from
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={emailSettingsForm.control}
                        name="replyToEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reply-To Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="support@yourdomain.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Reply-to address for sent emails
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={emailSettingsForm.control}
                      name="adminEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="admin@yourdomain.com" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription>
                            Email to receive admin notifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-medium">Email Templates</h3>
                      
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3 mt-4">
                        <FormField
                          control={emailSettingsForm.control}
                          name="verificationTemplateId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Verification Template ID</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="Template ID" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailSettingsForm.control}
                          name="resetPasswordTemplateId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password Reset Template ID</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="Template ID" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={emailSettingsForm.control}
                          name="emailTemplateId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notification Template ID</FormLabel>
                              <FormControl>
                                <Input 
                                  type="text" 
                                  placeholder="Template ID" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={handleTestEmail}
                        disabled={testEmailMutation.isPending}
                      >
                        {testEmailMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send Test Email
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={updateEmailSettingsMutation.isPending}
                      >
                        {updateEmailSettingsMutation.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Email Settings
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Settings */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Settings</CardTitle>
              <CardDescription>
                Configure platform performance and caching settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable Database Query Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache frequent database queries to improve performance
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Enable API Response Caching</Label>
                    <p className="text-sm text-muted-foreground">
                      Cache API responses for faster page loads
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Content Delivery Network (CDN)</Label>
                    <p className="text-sm text-muted-foreground">
                      Use CDN for static assets and files
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Cache Management</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cache TTL (seconds)</Label>
                    <Input type="number" defaultValue="3600" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Time-to-live for cached items
                    </p>
                  </div>
                  
                  <div>
                    <Label>Maximum Cache Size (MB)</Label>
                    <Input type="number" defaultValue="100" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Maximum memory allocated for caching
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between mt-4">
                  <Button variant="outline" className="w-full mr-2">
                    Clear Cache
                  </Button>
                  <Button className="w-full ml-2">
                    <Save className="mr-2 h-4 w-4" />
                    Save Performance Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}