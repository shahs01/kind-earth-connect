import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Github, Mail, Loader2, Check, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { validateUsername, validateEmail, validatePassword } from "@/utils/validation";

// Define form schema with Zod
const formSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, dashes and underscores" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters long" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" })
    .regex(/[^A-Za-z0-9]/, { message: "Password must contain at least one special character" }),
  confirmPassword: z.string().min(1, { message: "Please confirm your password" }),
  location: z.string().min(2, { message: "Location must be at least 2 characters" }),
})
.refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof formSchema>;

const SignUpForm = () => {
  const { signUp, validateField } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  
  // Initialize form
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      location: "",
    },
    mode: "onChange",
  });
  
  // Watch username and email for availability check
  const username = form.watch("username");
  const email = form.watch("email");
  
  // Check username availability with debounce
  useEffect(() => {
    if (!username || username.length < 3 || !validateUsername(username)) {
      setUsernameAvailable(null);
      return;
    }
    
    setUsernameChecking(true);
    const timer = setTimeout(async () => {
      try {
        const error = await validateField("username", username);
        setUsernameAvailable(!error);
      } catch (err) {
        setUsernameAvailable(false);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [username, validateField]);
  
  // Check email availability with debounce
  useEffect(() => {
    if (!email || !validateEmail(email)) {
      setEmailAvailable(null);
      return;
    }
    
    setEmailChecking(true);
    const timer = setTimeout(async () => {
      try {
        const error = await validateField("email", email);
        setEmailAvailable(!error);
      } catch (err) {
        setEmailAvailable(false);
      } finally {
        setEmailChecking(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [email, validateField]);
  
  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    
    try {
      // Create signup data with all required fields
      await signUp({
        email: data.email,
        password: data.password,
        username: data.username,
        name: data.name,
        location: data.location
      });
    } catch (error) {
      // Error is already handled in the auth context
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialSignUp = (provider: string) => {
    setIsLoading(true);
    
    // In a real app, this would redirect to OAuth provider
    toast({
      title: "Social signup not implemented",
      description: `${provider} signup would be implemented in a production app.`,
    });
    
    setIsLoading(false);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Heart className="h-10 w-10 text-thryvance-green" />
          </div>
          <CardTitle className="text-2xl">Create your account</CardTitle>
          <CardDescription>
            Join our community to offer and receive help
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Social Signup Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialSignUp('Google')}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2" aria-hidden="true">
                  <path 
                    d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" 
                    fill="#EA4335" 
                  />
                  <path 
                    d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" 
                    fill="#4285F4" 
                  />
                  <path 
                    d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" 
                    fill="#FBBC05" 
                  />
                  <path 
                    d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.2154 17.135 5.2654 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" 
                    fill="#34A853" 
                  />
                </svg>
                Google
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialSignUp('Facebook')}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-blue-600" aria-hidden="true">
                  <path 
                    d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" 
                    fill="currentColor"
                  />
                </svg>
                Facebook
              </Button>
            </div>
            
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialSignUp('GitHub')}
                disabled={isLoading}
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialSignUp('Twitter')}
                disabled={isLoading}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 mr-2 text-blue-400" aria-hidden="true">
                  <path 
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" 
                    fill="currentColor"
                  />
                </svg>
                Twitter
              </Button>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">Or continue with</span>
              </div>
            </div>
            
            {/* Email Form with React Hook Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            placeholder="Choose a username" 
                            {...field} 
                            disabled={isLoading}
                            className={
                              usernameAvailable === true
                                ? "pr-8 border-green-500 focus-visible:ring-green-500"
                                : usernameAvailable === false
                                ? "pr-8 border-red-500 focus-visible:ring-red-500"
                                : "pr-8"
                            }
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
                        3-20 characters, letters, numbers, dashes (-) and underscores (_) only
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your name" 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            type="email"
                            placeholder="Enter your email" 
                            {...field}
                            disabled={isLoading}
                            className={
                              emailAvailable === true
                                ? "pr-8 border-green-500 focus-visible:ring-green-500"
                                : emailAvailable === false
                                ? "pr-8 border-red-500 focus-visible:ring-red-500"
                                : "pr-8"
                            }
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create a strong password" 
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
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm your password" 
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
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Location</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="City, State" 
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
                  className="w-full bg-thryvance-green hover:bg-thryvance-green-dark flex items-center gap-2"
                  disabled={isLoading || !usernameAvailable || !emailAvailable}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Mail className="h-4 w-4" />
                      Create Account with Email
                    </>
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-thryvance-blue hover:underline font-medium">
              Log In
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SignUpForm;
