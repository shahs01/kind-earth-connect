
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  logout: () => void;
}

// Update interface to make all fields required
interface SignUpData {
  name: string;
  email: string;
  password: string;
  location: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage on mount
    const checkAuth = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (error) {
          console.error("Failed to parse stored user:", error);
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate authentication
      
      // Check if the user exists in localStorage (from signup)
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Create a user object that matches our User type
      const loggedInUser: User = {
        ...userWithoutPassword,
        trustScore: userWithoutPassword.trustScore || 5.0,
        helpOffered: userWithoutPassword.helpOffered || 0,
        helpReceived: userWithoutPassword.helpReceived || 0,
        createdAt: new Date(userWithoutPassword.createdAt || new Date()),
        verifiedStatus: userWithoutPassword.verifiedStatus || false
      };
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      toast({
        title: "Login successful!",
        description: "Welcome back to Thryvance.",
      });
      
      navigate('/');
    } catch (error) {
      let message = "Failed to log in";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Login failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData: SignUpData) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // For now, we'll simulate user creation
      
      // Check if user already exists
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      if (users.some((u: any) => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error("User with this email already exists");
      }
      
      // Create new user
      const newUser = {
        id: `user-${Math.random().toString(36).substring(2, 10)}`,
        name: userData.name,
        email: userData.email,
        password: userData.password, // In a real app, this would be hashed
        bio: "",
        location: userData.location,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`,
        createdAt: new Date().toISOString(),
        trustScore: 5.0,
        helpOffered: 0,
        helpReceived: 0,
        verifiedStatus: false
      };
      
      // Save to "database" (localStorage)
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Remove password before storing in state/localStorage for session
      const { password: _, ...userWithoutPassword } = newUser;
      
      // Create a user object that matches our User type
      const loggedInUser: User = {
        ...userWithoutPassword,
        createdAt: new Date(userWithoutPassword.createdAt)
      };
      
      setUser(loggedInUser);
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      
      toast({
        title: "Account created!",
        description: "Welcome to Thryvance. Your account has been successfully created.",
      });
      
      navigate('/');
    } catch (error) {
      let message = "Failed to create account";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Signup failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    navigate('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signUp,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
