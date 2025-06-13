import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Bell, BellOff } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NotificationPreferencesProps {
  demo?: boolean;
}

export default function NotificationPreferences({ demo = false }: NotificationPreferencesProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Initialize state from user preferences or default to true
  const [notifyNewListings, setNotifyNewListings] = useState<boolean>(
    user?.notifyNewListings !== undefined ? user.notifyNewListings : true
  );
  const [notifyMarketUpdates, setNotifyMarketUpdates] = useState<boolean>(
    user?.notifyMarketUpdates !== undefined ? user.notifyMarketUpdates : true
  );
  const [notifyApprovedListings, setNotifyApprovedListings] = useState<boolean>(
    user?.notifyApprovedListings !== undefined ? user.notifyApprovedListings : true
  );

  // Track changes to detect if user has modified preferences
  const hasChanges = (
    notifyNewListings !== user?.notifyNewListings ||
    notifyMarketUpdates !== user?.notifyMarketUpdates ||
    notifyApprovedListings !== user?.notifyApprovedListings
  );
  
  // Mutation to update notification preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (preferences: {
      notifyNewListings?: boolean;
      notifyMarketUpdates?: boolean;
      notifyApprovedListings?: boolean;
    }) => {
      const res = await apiRequest("PUT", "/api/user/notification-preferences", preferences);
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/user"], data);
      toast({
        title: "Preferences Updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle save preferences
  const handleSavePreferences = () => {
    updatePreferencesMutation.mutate({
      notifyNewListings,
      notifyMarketUpdates,
      notifyApprovedListings,
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Manage how you receive notifications about marketplace activity
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-new-listings">New Listings</Label>
              <p className="text-sm text-muted-foreground">
                Receive email notifications when new listings are approved
              </p>
            </div>
            <Switch
              id="notify-new-listings"
              checked={notifyNewListings}
              onCheckedChange={setNotifyNewListings}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-market-updates">Market Updates</Label>
              <p className="text-sm text-muted-foreground">
                Receive weekly digest of marketplace trends and updates
              </p>
            </div>
            <Switch
              id="notify-market-updates"
              checked={notifyMarketUpdates}
              onCheckedChange={setNotifyMarketUpdates}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notify-approved-listings">Your Listings</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications when your listings are approved or receive interest
              </p>
            </div>
            <Switch
              id="notify-approved-listings"
              checked={notifyApprovedListings}
              onCheckedChange={setNotifyApprovedListings}
            />
          </div>
          
          <div className="pt-3 flex justify-between items-center">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              <BellOff className="h-4 w-4" />
              Notifications are sent to {user?.username}
            </p>
            <Button 
              onClick={handleSavePreferences}
              disabled={!hasChanges || updatePreferencesMutation.isPending}
            >
              {updatePreferencesMutation.isPending ? "Saving..." : "Save Preferences"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}