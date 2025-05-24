import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import AvatarUpload from "@/components/AvatarUpload";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, MapPin, Shield, Lock, AlertCircle, Loader2, Check, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthProfile } from "@/hooks/useAuthProfile";

// Form validation schema for profile
const profileFormSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, dashes and underscores" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(300, { message: "Bio cannot exceed 300 characters." }).optional(),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
  notifyMessages: z.boolean().default(true),
  notifyHelp: z.boolean().default(true),
  notifyUpdates: z.boolean().default(false),
  profileVisibility: z.boolean().default(true),
});

// Form validation schema for password change
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Current password is required" }),
  newPassword: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your new password" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const AccountSettings = () => {
  const { user, updateProfile, changePassword, deleteAccount, validateField } = useAuth();
  const { updateProfile: updateAuthProfile } = useAuthProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const { toast } = useToast();
  
  // Initialize the profile form with user data
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: user?.username || "",
      name: user?.name || "",
      email: user?.email || "",
      bio: user?.bio || "",
      location: user?.location || "",
      notifyMessages: user?.notificationPreferences?.messageNotifications ?? true,
      notifyHelp: user?.notificationPreferences?.helpRequestAlerts ?? true,
      notifyUpdates: user?.notificationPreferences?.marketingEmails ?? false,
      profileVisibility: true,
    },
    mode: "onChange",
  });
  
  // Initialize password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Watch username and email fields
  const username = profileForm.watch("username");
  const email = profileForm.watch("email");
  
  // Check username availability with debounce
  const checkUsernameAvailability = async (value: string) => {
    if (!value || value === user?.username) {
      setUsernameAvailable(null);
      return;
    }
    
    setUsernameChecking(true);
    try {
      const error = await validateField("username", value);
      setUsernameAvailable(!error);
    } catch (err) {
      setUsernameAvailable(false);
    } finally {
      setUsernameChecking(false);
    }
  };
  
  // Check email availability with debounce
  const checkEmailAvailability = async (value: string) => {
    if (!value || value === user?.email) {
      setEmailAvailable(null);
      return;
    }
    
    setEmailChecking(true);
    try {
      const error = await validateField("email", value);
      setEmailAvailable(!error);
    } catch (err) {
      setEmailAvailable(false);
    } finally {
      setEmailChecking(false);
    }
  };
  
  // Handle profile form submission
  const onProfileSubmit = async (data: ProfileFormValues) => {
    setIsLoading(true);
    
    try {
      const updatedUserData = {
        username: data.username,
        name: data.name,
        email: data.email,
        bio: data.bio || "",
        location: data.location,
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
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      // Error is handled in auth profile hook
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle password change form submission
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    
    try {
      await changePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error) {
      // Error is handled in auth context
    } finally {
      setIsLoading(false);
    }
  };
  
  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'delete my account') {
      toast({
        title: "Account deletion failed",
        description: "Please type 'delete my account' to confirm.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      await deleteAccount();
    } catch (error) {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };
  
  // Function to handle avatar updates
  const handleAvatarUpdate = (avatarUrl: string) => {
    if (user) {
      // Update local user state with new avatar URL
      updateProfile({
        ...user,
        avatar: avatarUrl
      });
    }
  };
  
  if (!user) return null;
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your personal information and how it appears to others.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add the new AvatarUpload component */}
          <AvatarUpload
            currentAvatar={user.avatar}
            userId={user.id}
            onAvatarUpdate={handleAvatarUpdate}
          />
          
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isLoading}
                          className={
                            usernameAvailable === true
                              ? "pr-8 border-green-500 focus-visible:ring-green-500"
                              : usernameAvailable === false
                              ? "pr-8 border-red-500 focus-visible:ring-red-500"
                              : "pr-8"
                          }
                          onBlur={(e) => {
                            field.onBlur();
                            checkUsernameAvailability(e.target.value);
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            setUsernameAvailable(null);
                          }}
                        />
                      </FormControl>
                      
                      {/* Username availability indicator */}
                      {usernameChecking && (
                        <div className="absolute right-3 top-2.5">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                      {!usernameChecking && usernameAvailable === true && (
                        <div className="absolute right-3 top-2.5">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {!usernameChecking && usernameAvailable === false && (
                        <div className="absolute right-3 top-2.5">
                          <X className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    <FormDescription className="text-xs">
                      This is your unique username on the platform
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Your full name displayed on your profile
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <div className="relative">
                      <FormControl>
                        <Input 
                          type="email" 
                          placeholder="Your email" 
                          {...field} 
                          disabled={isLoading}
                          className={
                            emailAvailable === true
                              ? "pr-8 border-green-500 focus-visible:ring-green-500"
                              : emailAvailable === false
                              ? "pr-8 border-red-500 focus-visible:ring-red-500"
                              : "pr-8"
                          }
                          onBlur={(e) => {
                            field.onBlur();
                            checkEmailAvailability(e.target.value);
                          }}
                          onChange={(e) => {
                            field.onChange(e);
                            setEmailAvailable(null);
                          }}
                        />
                      </FormControl>
                      
                      {/* Email availability indicator */}
                      {emailChecking && (
                        <div className="absolute right-3 top-2.5">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                        </div>
                      )}
                      {!emailChecking && emailAvailable === true && (
                        <div className="absolute right-3 top-2.5">
                          <Check className="h-4 w-4 text-green-500" />
                        </div>
                      )}
                      {!emailChecking && emailAvailable === false && (
                        <div className="absolute right-3 top-2.5">
                          <X className="h-4 w-4 text-red-500" />
                        </div>
                      )}
                    </div>
                    <FormDescription>
                      Changing your email will require re-verification
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, State" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormDescription>
                      Where you're located to match with local help
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={profileForm.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell us a little about yourself" 
                        className="resize-none min-h-[100px]"
                        {...field} 
                        disabled={isLoading}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>
                      Maximum 300 characters
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button 
                  type="submit" 
                  disabled={isLoading || usernameAvailable === false || emailAvailable === false}
                  className="bg-thryvance-green hover:bg-thryvance-green-dark"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      
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
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
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
                control={profileForm.control}
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
                control={profileForm.control}
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
        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4">
            <h3 className="text-base font-medium mb-2 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Password
            </h3>
            <p className="text-sm text-gray-500 mb-3">
              Change your password to keep your account secure
            </p>
            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">Change Password</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Update your password to keep your account secure.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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
                              disabled={isLoading}
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
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormDescription className="text-xs space-y-1">
                            <p>Password must include:</p>
                            <ul className="list-disc list-inside pl-2 text-xs space-y-0.5">
                              <li className={field.value.length >= 8 ? "text-green-600" : ""}>
                                At least 8 characters
                              </li>
                              <li className={/[A-Z]/.test(field.value) ? "text-green-600" : ""}>
                                One uppercase letter
                              </li>
                              <li className={/[a-z]/.test(field.value) ? "text-green-600" : ""}>
                                One lowercase letter
                              </li>
                              <li className={/[0-9]/.test(field.value) ? "text-green-600" : ""}>
                                One number
                              </li>
                              <li className={/[^A-Za-z0-9]/.test(field.value) ? "text-green-600" : ""}>
                                One special character
                              </li>
                            </ul>
                          </FormDescription>
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
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsPasswordDialogOpen(false)}
                        disabled={isLoading}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        className="bg-thryvance-green hover:bg-thryvance-green-dark"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Updating...
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Account Deletion */}
          <div className="rounded-lg border border-red-200 p-4 bg-red-50">
            <h3 className="text-base font-medium mb-2 flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              Delete Account
            </h3>
            <p className="text-sm text-red-600 mb-3">
              Permanently delete your account and all associated data.
            </p>
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account and remove your
                    data from our servers. All your posts, reviews, and profile information will be lost.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="py-4">
                  <p className="text-sm font-medium mb-2">Type "delete my account" to confirm:</p>
                  <Input 
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="border-red-300 focus-visible:ring-red-500"
                    placeholder="delete my account"
                  />
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteAccount();
                    }}
                    className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
                    disabled={isLoading || deleteConfirmText !== 'delete my account'}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccountSettings;
