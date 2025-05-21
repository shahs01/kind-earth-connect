
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Github, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";

const LoginForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    const newErrors: Record<string, string> = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password) newErrors.password = "Password is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    
    // Simulate login
    setTimeout(() => {
      console.log("Login submitted:", formData);
      // Store user info in localStorage (this would be replaced with real auth)
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Demo User',
        email: formData.email,
        avatar: 'https://ui-avatars.com/api/?name=Demo+User',
        bio: 'This is a demo user account',
        location: 'New York, USA',
        trustScore: 4.5,
        helpOffered: 12,
        helpReceived: 5,
        verifiedStatus: true
      }));
      
      toast({
        title: "Login successful!",
        description: "Welcome back to Thryvance.",
      });
      
      // Redirect to home
      navigate('/');
      setIsLoading(false);
    }, 1500);
  };
  
  const handleSocialLogin = (provider: string) => {
    setIsLoading(true);
    
    // Simulate social login
    setTimeout(() => {
      console.log(`Login with ${provider}`);
      // Store user info in localStorage (this would be replaced with real auth)
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: `${provider} User`,
        email: `demo@${provider.toLowerCase()}.com`,
        avatar: 'https://ui-avatars.com/api/?name=' + provider + '+User',
        bio: `This is a demo user account using ${provider}`,
        location: 'New York, USA',
        trustScore: 4.5,
        helpOffered: 12,
        helpReceived: 5,
        verifiedStatus: true
      }));
      
      toast({
        title: "Login successful!",
        description: `Welcome back! You're signed in with ${provider}.`,
      });
      
      // Redirect to home
      navigate('/');
      setIsLoading(false);
    }, 1500);
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2">
            <Heart className="h-10 w-10 text-thryvance-green" />
          </div>
          <CardTitle className="text-2xl">Welcome back</CardTitle>
          <CardDescription>
            Log in to your Thryvance account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialLogin('Google')}
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
                onClick={() => handleSocialLogin('Facebook')}
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
                onClick={() => handleSocialLogin('GitHub')}
                disabled={isLoading}
              >
                <Github className="h-5 w-5 mr-2" />
                GitHub
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => handleSocialLogin('Twitter')}
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
            
            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-thryvance-blue hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                  disabled={isLoading}
                />
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded text-thryvance-green focus:ring-thryvance-green"
                  disabled={isLoading}
                />
                <Label htmlFor="rememberMe" className="text-sm">Remember me</Label>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-thryvance-green hover:bg-thryvance-green-dark flex items-center gap-2"
                disabled={isLoading}
              >
                <Mail className="h-4 w-4" />
                {isLoading ? 'Logging In...' : 'Log In with Email'}
              </Button>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{" "}
            <Link to="/signup" className="text-thryvance-blue hover:underline font-medium">
              Sign Up
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default LoginForm;
