
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { User, Loader2, Check, X } from "lucide-react";
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
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const ProfileInformationCard = () => {
  const { user, updateProfile, validateField } = useAuth();
  const { updateProfile: updateAuthProfile } = useAuthProfile();
  const [isLoading, setIsLoading] = useState(false);
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
    },
    mode: "onChange",
  });
  
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
  );
};

export default ProfileInformationCard;
