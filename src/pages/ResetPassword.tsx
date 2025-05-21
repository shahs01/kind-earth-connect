
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
import { ResetPasswordData } from "@/hooks/usePasswordManagement";

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
  const { resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Extract token and email from URL
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailParam = queryParams.get('email');
    const tokenParam = queryParams.get('token');
    
    if (!emailParam || !tokenParam) {
      setIsError(true);
      setErrorMessage("Invalid or missing reset link parameters");
    } else {
      setEmail(emailParam);
      setToken(tokenParam);
    }
  }, [location]);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    if (!email || !token) {
      setIsError(true);
      setErrorMessage("Missing required reset information");
      return;
    }
    
    setIsLoading(true);
    
    try {
      const resetData: ResetPasswordData = {
        email,
        token,
        newPassword: data.password,
      };
      
      await resetPassword(resetData);
      
      setIsSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      let message = "Failed to reset password";
      if (error instanceof Error) {
        message = error.message;
      }
      setIsError(true);
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-12 bg-hero-pattern">
        <div className="container mx-auto px-4">
          <Card className="max-w-md mx-auto shadow-md">
            <CardHeader className="text-center">
              {isSuccess && <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-2" />}
              {isError && <XCircle className="mx-auto h-12 w-12 text-red-500 mb-2" />}
              {!isSuccess && !isError && <ShieldAlert className="mx-auto h-12 w-12 text-thryvance-blue mb-2" />}
              
              <CardTitle className="text-2xl">
                {isSuccess ? "Password Reset Successful" : "Reset Your Password"}
              </CardTitle>
              <CardDescription>
                {isSuccess
                  ? "Your password has been reset successfully"
                  : isError 
                    ? "There was a problem with your reset link"
                    : "Choose a new password for your account"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-4">
                  <p className="text-gray-600 mb-2">
                    Your password has been updated. You will be redirected to the login page in a moment.
                  </p>
                </div>
              ) : isError ? (
                <div className="text-center py-4">
                  <p className="text-red-500 mb-4">{errorMessage}</p>
                  <p className="text-gray-600">
                    Please try requesting a new password reset link.
                  </p>
                </div>
              ) : (
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
                              disabled={isLoading}
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
                              disabled={isLoading}
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
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <Link 
                to={isSuccess ? "/login" : "/forgot-password"} 
                className="text-thryvance-blue hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="h-4 w-4" />
                {isSuccess ? "Go to Login" : "Back to Forgot Password"}
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
