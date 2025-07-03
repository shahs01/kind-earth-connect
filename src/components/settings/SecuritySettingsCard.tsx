
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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
import { Shield, Lock, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useAuthProfile } from "@/hooks/useAuthProfile";
import { supabase } from "@/integrations/supabase/client";

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

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

const SecuritySettingsCard = () => {
  const { changePassword } = useAuth();
  const { deleteAccount } = useAuthProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const { toast } = useToast();
  
  // Initialize password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });
  
  // Handle password change form submission
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    setIsLoading(true);
    
    try {
      // Enhanced security: verify current password first
      const { data: user } = await supabase.auth.getUser();
      if (!user.user?.email) {
        throw new Error("User email not found");
      }

      // Attempt to sign in with current password to verify it
      const { error: verifyError } = await supabase.auth.signInWithPassword({
        email: user.user.email,
        password: data.currentPassword
      });

      if (verifyError) {
        toast({
          title: "Password verification failed",
          description: "Current password is incorrect.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      await changePassword(data.currentPassword, data.newPassword);
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
      
      setIsPasswordDialogOpen(false);
      passwordForm.reset();
    } catch (error: any) {
      toast({
        title: "Password change failed",
        description: error.message || "An error occurred while changing your password.",
        variant: "destructive",
      });
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
  
  return (
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
  );
};

export default SecuritySettingsCard;
