
import React from "react";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import { Settings, Bell, Lock, UserCog, Shield } from "lucide-react";

// Form validation schema
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(300, { message: "Bio cannot exceed 300 characters." }).optional(),
  location: z.string().optional(),
  notifyMessages: z.boolean().default(true),
  notifyHelp: z.boolean().default(true),
  notifyUpdates: z.boolean().default(false),
  profileVisibility: z.boolean().default(true),
  locationVisibility: z.boolean().default(true),
  activityVisibility: z.boolean().default(true),
  twoFactorEnabled: z.boolean().default(false),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface SettingsFormProps {
  user: User;
}

export function SettingsForm({ user }: SettingsFormProps) {
  // Initialize the form with user data
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      bio: user.bio || "",
      location: user.location || "",
      notifyMessages: true,
      notifyHelp: true,
      notifyUpdates: false,
      profileVisibility: true,
      locationVisibility: true,
      activityVisibility: true,
      twoFactorEnabled: false,
    },
  });

  // Handle form submission
  function onSubmit(data: ProfileFormValues) {
    // In a real app, this would update the user's settings in the database
    console.log("Form submitted:", data);
    toast.success("Settings updated successfully");
  }

  // Handle account deletion
  const handleDeleteAccount = () => {
    // In a real app, this would show a confirmation dialog and then delete the user's account
    toast.error("Account deletion is disabled in this demo");
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCog className="h-5 w-5" />
                Profile Settings
              </CardTitle>
              <CardDescription>
                Manage your personal information and how it appears to others.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where you're located to match with local help
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us a little about yourself" 
                        className="resize-none min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum 300 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Preferences
              </CardTitle>
              <CardDescription>
                Control what notifications you receive
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
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
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Privacy Settings
              </CardTitle>
              <CardDescription>
                Control who can see your information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="profileVisibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Profile Visibility</FormLabel>
                      <FormDescription>
                        Make your profile visible to other users
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="locationVisibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Location Visibility</FormLabel>
                      <FormDescription>
                        Show your location on your profile
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="activityVisibility"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Activity Visibility</FormLabel>
                      <FormDescription>
                        Show your recent activity on your profile
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Settings
              </CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Two-Factor Authentication</FormLabel>
                      <FormDescription>
                        Add an extra layer of security to your account
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="rounded-lg border p-4">
                <h3 className="text-base font-medium mb-2">Change Password</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Update your password to keep your account secure
                </p>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline">Change Password</Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Change Password</SheetTitle>
                      <SheetDescription>
                        Enter your current password and a new password below.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label htmlFor="current" className="text-sm font-medium">Current Password</label>
                        <Input id="current" type="password" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="new" className="text-sm font-medium">New Password</label>
                        <Input id="new" type="password" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="confirm" className="text-sm font-medium">Confirm New Password</label>
                        <Input id="confirm" type="password" />
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button onClick={() => toast.success("Password changed successfully")}>
                        Update Password
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="account-deletion">
                  <AccordionTrigger className="text-base text-red-500 font-medium">
                    Delete Account
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="mb-4 text-sm text-gray-500">
                      This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                    </p>
                    <Button 
                      variant="destructive" 
                      onClick={handleDeleteAccount}
                    >
                      Delete Account
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => form.reset()}>
              Cancel
            </Button>
            <Button type="submit" className="bg-thryvance-green hover:bg-thryvance-green-dark">
              Save Changes
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
