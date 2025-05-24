
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mail, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthProfile } from "@/hooks/useAuthProfile";

// Form validation schema for notifications
const notificationFormSchema = z.object({
  notifyMessages: z.boolean().default(true),
  notifyHelp: z.boolean().default(true),
  notifyUpdates: z.boolean().default(false),
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

const NotificationPreferencesCard = () => {
  const { user } = useAuth();
  const { updateProfile: updateAuthProfile } = useAuthProfile();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  // Initialize the notification form with user data
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      notifyMessages: user?.notificationPreferences?.messageNotifications ?? true,
      notifyHelp: user?.notificationPreferences?.helpRequestAlerts ?? true,
      notifyUpdates: user?.notificationPreferences?.marketingEmails ?? false,
    },
    mode: "onChange",
  });
  
  // Handle notification form submission
  const onNotificationSubmit = async (data: NotificationFormValues) => {
    setIsLoading(true);
    
    try {
      const updatedUserData = {
        notificationPreferences: {
          emailUpdates: true,
          messageNotifications: data.notifyMessages,
          helpRequestAlerts: data.notifyHelp,
          marketingEmails: data.notifyUpdates,
        },
      };
      
      // Use the auth profile hook to update the profile
      await updateAuthProfile(user, updatedUserData);
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated successfully.",
      });
    } catch (error) {
      // Error is handled in auth profile hook
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!user) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Notification Preferences
        </CardTitle>
        <CardDescription>
          Control what notifications you receive
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Form {...notificationForm}>
          <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
            <FormField
              control={notificationForm.control}
              name="notifyMessages"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Messages</FormLabel>
                    <FormDescription>
                      Receive notifications when someone sends you a message
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={notificationForm.control}
              name="notifyHelp"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Help Requests & Offers</FormLabel>
                    <FormDescription>
                      Receive notifications about help requests/offers matching your interests
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={notificationForm.control}
              name="notifyUpdates"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Platform Updates</FormLabel>
                    <FormDescription>
                      Receive notifications about new features and community updates
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-thryvance-green hover:bg-thryvance-green-dark"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  "Save Preferences"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default NotificationPreferencesCard;
