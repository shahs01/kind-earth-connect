
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle, ShieldAlert, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const formSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof formSchema>;

const ResetPassword = () => {
  const { resetPassword, user, isLoading: authIsLoading } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!user) {
      toast({
        title: "Session Expired",
        description: "Your password reset session has expired. Please request a new link.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await resetPassword({
        email: user.email,
        token: "", // Not used by function, but required by type
        newPassword: data.password,
      });
      
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      let message = "Failed to reset password. Please try again.";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
          title: "Password reset failed",
          description: message,
          variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (authIsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow flex items-center justify-center bg-hero-pattern">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
            <span className="mt-2 text-gray-600">Verifying reset link...</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isSuccess) {
      return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow py-12 bg-hero-pattern">
                <div className="container mx-auto px-4">
                    <Card className="max-w-md mx-auto shadow-md">
                        <CardHeader className="text-center">
                            <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />
                            <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
                            <CardDescription>Your password has been reset successfully</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="text-center py-4">
                                <p className="text-gray-600 mb-2">
                                    Your password has been updated. You will be redirected to the login page in a moment.
                                </p>
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-center">
                            <Link
                                to="/login"
                                className="text-thryvance-blue hover:underline flex items-center gap-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Go to Login
                            </Link>
                        </CardFooter>
                    </Card>
                </div>
            </main>
            <Footer />
        </div>
    );
  }

  if (!user) {
       return (
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-grow py-12 bg-hero-pattern">
            <div className="container mx-auto px-4">
              <Card className="max-w-md mx-auto shadow-md">
                <CardHeader className="text-center">
                  <XCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />
                  <CardTitle className="text-2xl">Problem with Reset Link</CardTitle>
                  <CardDescription>This password reset link is invalid or has expired.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-gray-600">
                      Please request a new password reset link from the "Forgot Password" page.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <Link 
                    to="/forgot-password" 
                    className="text-thryvance-blue hover:underline flex items-center gap-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Forgot Password
                  </Link>
                </CardFooter>
              </Card>
            </div>
          </main>
          <Footer />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-hero-pattern">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
              <ShieldAlert className="mx-auto h-12 w-12 text-thryvance-blue mb-2" />
              <CardTitle className="text-2xl">Reset Your Password</CardTitle>
              <CardDescription>Choose a new password for your account</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Enter your new password"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm New Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Confirm your new password"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-800 mt-4">
                      <p className="font-medium mb-1">Password requirements:</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>At least 8 characters</li>
                        <li>At least one uppercase letter (A-Z)</li>
                        <li>At least one lowercase letter (a-z)</li>
                        <li>At least one number (0-9)</li>
                        <li>At least one special character (!@#$%^&*)</li>
                      </ul>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-thryvance-green hover:bg-thryvance-green-dark mt-4"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </form>
                </Form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Link
                to="/forgot-password"
                className="text-thryvance-blue hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Forgot Password
              </Link>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
