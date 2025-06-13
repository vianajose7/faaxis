import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Trash, Mail, CheckCircle2, User, UserCog, Lock, UserX, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { apiRequest } from '@/lib/queryClient';
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserInfo {
  id: number;
  username: string;
  fullName: string | null;
  isAdmin: boolean;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  lastLogin: string | null;
  notificationPreferences: {
    marketplaceUpdates: boolean;
    practiceListingAlerts: boolean;
    newsletterSubscription: boolean;
  };
}

export default function UserManagementAdmin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdmins, setShowAdmins] = useState(true);
  const [showVerified, setShowVerified] = useState(true);
  const [showUnverified, setShowUnverified] = useState(true);
  const [activeTab, setActiveTab] = useState("users");

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users', {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      return response.json();
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('DELETE', `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User deleted",
        description: "The user has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete user",
        description: error.message || "An error occurred while deleting the user.",
        variant: "destructive",
      });
    },
  });

  // Toggle admin status mutation
  const toggleAdminStatusMutation = useMutation({
    mutationFn: async ({ userId, isAdmin }: { userId: number, isAdmin: boolean }) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}/admin-status`, { isAdmin });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Admin status updated",
        description: "The user's admin status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update admin status",
        description: error.message || "An error occurred while updating the admin status.",
        variant: "destructive",
      });
    },
  });

  // Toggle email verification status mutation
  const toggleEmailVerificationMutation = useMutation({
    mutationFn: async ({ userId, emailVerified }: { userId: number, emailVerified: boolean }) => {
      return apiRequest('PATCH', `/api/admin/users/${userId}/email-verification`, { emailVerified });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Email verification updated",
        description: "The user's email verification status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update email verification",
        description: error.message || "An error occurred while updating the email verification status.",
        variant: "destructive",
      });
    },
  });

  // Send verification email mutation
  const sendVerificationEmailMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('POST', `/api/admin/users/${userId}/send-verification-email`);
    },
    onSuccess: () => {
      toast({
        title: "Verification email sent",
        description: "A verification email has been sent to the user.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send verification email",
        description: error.message || "An error occurred while sending the verification email.",
        variant: "destructive",
      });
    },
  });

  // Reset user password mutation
  const resetUserPasswordMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest('POST', `/api/admin/users/${userId}/reset-password`);
    },
    onSuccess: () => {
      toast({
        title: "Password reset email sent",
        description: "A password reset email has been sent to the user.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send password reset email",
        description: error.message || "An error occurred while sending the password reset email.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteUser = (userId: number) => {
    deleteUserMutation.mutate(userId);
  };

  const handleToggleAdminStatus = (userId: number, currentStatus: boolean) => {
    toggleAdminStatusMutation.mutate({ userId, isAdmin: !currentStatus });
  };

  const handleToggleEmailVerification = (userId: number, currentStatus: boolean) => {
    toggleEmailVerificationMutation.mutate({ userId, emailVerified: !currentStatus });
  };

  const handleSendVerificationEmail = (userId: number) => {
    sendVerificationEmailMutation.mutate(userId);
  };

  const handleResetUserPassword = (userId: number) => {
    resetUserPasswordMutation.mutate(userId);
  };

  // Filter users based on search term and status filters
  const filteredUsers = users ? users.filter((userInfo: UserInfo) => {
    const matchesSearch = 
      userInfo.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (userInfo.fullName && userInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const statusMatch = 
      (showAdmins && userInfo.isAdmin) || 
      (showVerified && userInfo.emailVerified && !userInfo.isAdmin) ||
      (showUnverified && !userInfo.emailVerified && !userInfo.isAdmin);
    
    return matchesSearch && statusMatch;
  }) : [];

  // Calculate stats
  const totalUsers = users ? users.length : 0;
  const adminUsers = users ? users.filter((u: UserInfo) => u.isAdmin).length : 0;
  const verifiedUsers = users ? users.filter((u: UserInfo) => u.emailVerified).length : 0;
  const unverifiedUsers = users ? users.filter((u: UserInfo) => !u.emailVerified).length : 0;
  const twoFactorUsers = users ? users.filter((u: UserInfo) => u.twoFactorEnabled).length : 0;

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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users, permissions, and account settings.</p>
        </div>
      </div>

      <Tabs defaultValue="users" onValueChange={setActiveTab} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Users
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <UserCog className="h-4 w-4" /> Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{totalUsers}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-blue-600">Admins</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{adminUsers}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-green-600">Verified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{verifiedUsers}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-600">Unverified</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-amber-600">{unverifiedUsers}</p>
              </CardContent>
            </Card>
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-purple-600">2FA Enabled</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">{twoFactorUsers}</p>
              </CardContent>
            </Card>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="w-full sm:w-auto relative">
              <Input
                placeholder="Search users by email or name..."
                className="min-w-[300px]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admins"
                  checked={showAdmins}
                  onCheckedChange={() => setShowAdmins(!showAdmins)}
                />
                <label
                  htmlFor="admins"
                  className="text-sm font-medium text-blue-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Admins
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="verified"
                  checked={showVerified}
                  onCheckedChange={() => setShowVerified(!showVerified)}
                />
                <label
                  htmlFor="verified"
                  className="text-sm font-medium text-green-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Verified
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unverified"
                  checked={showUnverified}
                  onCheckedChange={() => setShowUnverified(!showUnverified)}
                />
                <label
                  htmlFor="unverified"
                  className="text-sm font-medium text-amber-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Unverified
                </label>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableCaption>Manage users and permissions</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((userInfo: UserInfo) => (
                    <TableRow key={userInfo.id}>
                      <TableCell className="font-medium">{userInfo.username}</TableCell>
                      <TableCell>{userInfo.fullName || "—"}</TableCell>
                      <TableCell>
                        {userInfo.isAdmin && (
                          <Badge className="bg-blue-100 text-blue-800 mr-1">Admin</Badge>
                        )}
                        {userInfo.emailVerified ? (
                          <Badge className="bg-green-100 text-green-800">Verified</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-100 text-amber-800">Unverified</Badge>
                        )}
                        {userInfo.twoFactorEnabled && (
                          <Badge className="bg-purple-100 text-purple-800 ml-1">2FA</Badge>
                        )}
                      </TableCell>
                      <TableCell>{format(new Date(userInfo.createdAt), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {userInfo.lastLogin 
                          ? format(new Date(userInfo.lastLogin), 'MMM d, yyyy') 
                          : "Never"
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Actions
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>User Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            
                            <DropdownMenuItem 
                              onClick={() => handleToggleAdminStatus(userInfo.id, userInfo.isAdmin)}
                              className="flex items-center gap-2"
                            >
                              {userInfo.isAdmin ? (
                                <>
                                  <UserX className="h-4 w-4" />
                                  <span>Remove Admin</span>
                                </>
                              ) : (
                                <>
                                  <UserCheck className="h-4 w-4" />
                                  <span>Make Admin</span>
                                </>
                              )}
                            </DropdownMenuItem>
                            
                            {!userInfo.emailVerified && (
                              <DropdownMenuItem 
                                onClick={() => handleSendVerificationEmail(userInfo.id)}
                                className="flex items-center gap-2"
                              >
                                <Mail className="h-4 w-4" />
                                <span>Send Verification Email</span>
                              </DropdownMenuItem>
                            )}
                            
                            <DropdownMenuItem 
                              onClick={() => handleToggleEmailVerification(userInfo.id, userInfo.emailVerified)}
                              className="flex items-center gap-2"
                            >
                              <CheckCircle2 className="h-4 w-4" />
                              <span>
                                {userInfo.emailVerified 
                                  ? "Mark as Unverified" 
                                  : "Mark as Verified"
                                }
                              </span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                              onClick={() => handleResetUserPassword(userInfo.id)}
                              className="flex items-center gap-2"
                            >
                              <Lock className="h-4 w-4" />
                              <span>Reset Password</span>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator />
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem 
                                  onSelect={(e) => e.preventDefault()}
                                  className="text-destructive flex items-center gap-2"
                                >
                                  <Trash className="h-4 w-4" />
                                  <span>Delete User</span>
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete User</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this user? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteUser(userInfo.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No users found. {searchTerm && "Try a different search term."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Email Verification Settings</CardTitle>
                <CardDescription>
                  Configure email verification requirements for new and existing users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-verification">Require Email Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Users must verify their email address before they can access certain features
                    </p>
                  </div>
                  <Switch id="require-verification" checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="verification-expiry">Verification Link Expiry</Label>
                    <p className="text-sm text-muted-foreground">
                      Time until verification links expire
                    </p>
                  </div>
                  <select
                    id="verification-expiry"
                    className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    defaultValue="24"
                  >
                    <option value="1">1 hour</option>
                    <option value="12">12 hours</option>
                    <option value="24">24 hours</option>
                    <option value="48">48 hours</option>
                    <option value="72">72 hours</option>
                  </select>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="admin-verification">Require Admin Verification</Label>
                    <p className="text-sm text-muted-foreground">
                      Admin accounts require additional email verification
                    </p>
                  </div>
                  <Switch id="admin-verification" checked={true} />
                </div>
                
                <Button className="w-full">Save Email Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>
                  Configure security options for user accounts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="allow-2fa">Allow Two-Factor Authentication</Label>
                    <p className="text-sm text-muted-foreground">
                      Users can enable 2FA for their accounts
                    </p>
                  </div>
                  <Switch id="allow-2fa" checked={true} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="require-admin-2fa">Require 2FA for Admins</Label>
                    <p className="text-sm text-muted-foreground">
                      All admin accounts must use two-factor authentication
                    </p>
                  </div>
                  <Switch id="require-admin-2fa" checked={false} />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="password-expiry">Password Expiry</Label>
                    <p className="text-sm text-muted-foreground">
                      Require users to change passwords periodically
                    </p>
                  </div>
                  <select
                    id="password-expiry"
                    className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    defaultValue="never"
                  >
                    <option value="never">Never</option>
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                    <option value="180">180 days</option>
                  </select>
                </div>
                
                <Button className="w-full">Save Security Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {activeTab === "users" && (
        <div className="mt-8 rounded-md border border-blue-200 bg-blue-50 p-4">
          <h3 className="text-blue-800 font-medium mb-2">
            <UserCog className="h-4 w-4 inline-block mr-1" /> About User Management
          </h3>
          <p className="text-blue-700 text-sm">
            This page allows you to manage all user accounts. You can change admin permissions, verify email addresses,
            reset passwords, or delete accounts. Use the filters to show specific types of users.
          </p>
        </div>
      )}
    </div>
  );
}