
import { useState, useEffect } from "react";
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  username: z.string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .max(20, { message: "Username cannot exceed 20 characters" })
    .regex(/^[a-zA-Z0-9_-]+$/, { message: "Username can only contain letters, numbers, dashes and underscores" }),
});

type FormData = z.infer<typeof formSchema>;

interface UsernameSelectionFormProps {
  userData: {
    email: string;
    password: string;
    name: string;
    phone: string;
  } | null;
  onComplete: (data: {
    email: string;
    password: string;
    name: string;
    phone: string;
    username: string;
  }) => void;
  isLoading: boolean;
}

const UsernameSelectionForm = ({ userData, onComplete, isLoading }: UsernameSelectionFormProps) => {
  const { toast } = useToast();
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
    mode: "onChange",
  });
  
  const username = form.watch("username");
  
  useEffect(() => {
    if (!username || username.length < 3 || !/^[a-zA-Z0-9_-]+$/.test(username)) {
      setUsernameAvailable(null);
      return;
    }
    
    setUsernameChecking(true);
    
    const timer = setTimeout(async () => {
      try {
        const { data: usernameData, error: usernameError } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username)
          .maybeSingle();
        
        if (usernameError) {
          console.error("Error checking username:", usernameError);
          setUsernameAvailable(false);
        } else {
          setUsernameAvailable(!usernameData);
        }
      } catch (err) {
        console.error("Username check error:", err);
        setUsernameAvailable(false);
      } finally {
        setUsernameChecking(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [username]);
  
  const onSubmit = async (data: FormData) => {
    if (!userData) {
      toast({
        title: "Error",
        description: "Missing user data. Please restart the signup process.",
        variant: "destructive"
      });
      return;
    }
    
    if (!usernameAvailable) {
      toast({
        title: "Username not available",
        description: "Please choose a different username.",
        variant: "destructive"
      });
      return;
    }
    
    onComplete({
      ...userData,
      username: data.username
    });
  };
  
  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="shadow-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Choose your username</CardTitle>
        </CardHeader>
        <CardContent>
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
              
              <Button 
                type="submit" 
                className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
                disabled={isLoading || !usernameAvailable}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Complete Sign Up"
                )}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            This username will be used to identify you on the platform.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UsernameSelectionForm;
