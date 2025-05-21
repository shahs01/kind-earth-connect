
import { useState } from "react";
import { Link } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Mail, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

type FormValues = z.infer<typeof formSchema>;

const ForgotPassword = () => {
  const { requestPasswordReset } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    try {
      await requestPasswordReset(data.email);
      setIsSubmitted(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send password reset email. Please try again.",
        variant: "destructive",
      });
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
            <CardHeader>
              <CardTitle className="text-2xl text-center">Reset Password</CardTitle>
              <CardDescription className="text-center">
                {isSubmitted
                  ? "Check your email for a reset link"
                  : "Enter your email address and we'll send you a link to reset your password"}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isSubmitted ? (
                <div className="text-center py-6">
                  <Mail className="mx-auto h-12 w-12 text-thryvance-blue mb-4" />
                  <p className="text-gray-600 mb-4">
                    If an account exists for the email you entered, we've sent a password reset link.
                    Please check your inbox and follow the instructions.
                  </p>
                  <p className="text-gray-500 text-sm">
                    Don't see the email? Check your spam folder or request another link.
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Enter your email address"
                              {...field}
                              disabled={isLoading}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button
                      type="submit"
                      className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Sending...
                        </>
                      ) : (
                        "Send Reset Link"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-center">
              <div className="text-center">
                {isSubmitted ? (
                  <div className="space-y-2">
                    <Button
                      variant="ghost"
                      className="text-thryvance-blue hover:text-thryvance-blue-dark"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Try a different email
                    </Button>
                  </div>
                ) : (
                  <Link to="/login" className="text-thryvance-blue hover:underline flex items-center gap-1">
                    <ArrowLeft className="h-4 w-4" />
                    Back to login
                  </Link>
                )}
              </div>
            </CardFooter>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ForgotPassword;
