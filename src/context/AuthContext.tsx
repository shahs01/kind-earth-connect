import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { User, SignUpData, AuthValidationErrors, PasswordResetData } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { 
  validateSignUpData, 
  isUsernameTaken, 
  isEmailTaken, 
  sendVerificationEmail, 
  hashPassword, 
  comparePassword,
  sendPasswordResetEmail
} from "@/utils/validation";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  emailVerified: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  logout: () => void;
  sendEmailVerification: () => Promise<void>;
  verifyEmail: (token: string) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  resetPassword: (data: PasswordResetData) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  validateField: (field: string, value: string) => Promise<string | null>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Maximum allowed login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 5;
// Lockout time in milliseconds (15 minutes)
const LOCKOUT_TIME = 15 * 60 * 1000;

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [emailVerified, setEmailVerified] = useState<boolean>(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is stored in localStorage on mount
    const checkAuth = () => {
      try {
        const storedUser = localStorage.getItem('user');
        const sessionExpiry = localStorage.getItem('sessionExpiry');
        
        if (storedUser && sessionExpiry) {
          const expiryTime = parseInt(sessionExpiry, 10);
          
          // Check if session has expired
          if (Date.now() > expiryTime) {
            localStorage.removeItem('user');
            localStorage.removeItem('sessionExpiry');
            setUser(null);
            setEmailVerified(false);
          } else {
            const parsedUser = JSON.parse(storedUser);
            
            // Ensure createdAt is a Date object
            if (parsedUser.createdAt) {
              parsedUser.createdAt = new Date(parsedUser.createdAt);
            }
            
            setUser(parsedUser);
            setEmailVerified(parsedUser.emailVerified || false);
          }
        }
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem('user');
        localStorage.removeItem('sessionExpiry');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string, rememberMe = false) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      // Check if the user exists in localStorage
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const foundUser = users.find((u: any) => 
        u.email.toLowerCase() === email.toLowerCase()
      );
      
      if (!foundUser) {
        throw new Error("Invalid email or password");
      }
      
      // Check for account lockout
      if (foundUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lastAttempt = new Date(foundUser.lastLoginAttempt).getTime();
        const currentTime = Date.now();
        
        if (currentTime - lastAttempt < LOCKOUT_TIME) {
          const remainingMinutes = Math.ceil((LOCKOUT_TIME - (currentTime - lastAttempt)) / 60000);
          throw new Error(`Account temporarily locked. Please try again in ${remainingMinutes} minutes.`);
        } else {
          // Reset login attempts if lockout period has passed
          foundUser.loginAttempts = 0;
        }
      }
      
      // Check password
      if (!comparePassword(password, foundUser.password)) {
        // Update login attempts
        foundUser.loginAttempts = (foundUser.loginAttempts || 0) + 1;
        foundUser.lastLoginAttempt = new Date().toISOString();
        
        // Update user in localStorage
        localStorage.setItem('users', JSON.stringify(users.map((u: any) => 
          u.id === foundUser.id ? foundUser : u
        )));
        
        // Check if account should be locked
        if (foundUser.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
          throw new Error("Too many failed login attempts. Account has been temporarily locked for 15 minutes.");
        }
        
        throw new Error("Invalid email or password");
      }
      
      // Check if email is verified
      if (!foundUser.emailVerified) {
        setUser({
          ...foundUser,
          createdAt: new Date(foundUser.createdAt)
        });
        setEmailVerified(false);
        
        toast({
          title: "Email not verified",
          description: "Please verify your email before logging in.",
          variant: "destructive",
        });
        
        navigate('/verify-email');
        return;
      }
      
      // Reset login attempts on successful login
      foundUser.loginAttempts = 0;
      foundUser.lastLoginAttempt = null;
      
      // Update user in localStorage
      localStorage.setItem('users', JSON.stringify(users.map((u: any) => 
        u.id === foundUser.id ? foundUser : u
      )));
      
      // Remove password before storing in state/localStorage
      const { password: _, ...userWithoutPassword } = foundUser;
      
      // Create a user object that matches our User type
      const loggedInUser: User = {
        ...userWithoutPassword,
        trustScore: userWithoutPassword.trustScore || 5.0,
        helpOffered: userWithoutPassword.helpOffered || 0,
        helpReceived: userWithoutPassword.helpReceived || 0,
        volunteerHours: userWithoutPassword.volunteerHours || 0,
        createdAt: new Date(userWithoutPassword.createdAt || new Date()),
        verifiedStatus: userWithoutPassword.verifiedStatus || false,
        emailVerified: userWithoutPassword.emailVerified || false,
        trustBadges: userWithoutPassword.trustBadges || []
      };
      
      setUser(loggedInUser);
      setEmailVerified(loggedInUser.emailVerified);
      
      // Set session expiry based on rememberMe
      const expiryTime = rememberMe 
        ? Date.now() + (30 * 24 * 60 * 60 * 1000) // 30 days
        : Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      localStorage.setItem('user', JSON.stringify(loggedInUser));
      localStorage.setItem('sessionExpiry', expiryTime.toString());
      
      toast({
        title: "Login successful!",
        description: "Welcome back to Thryvance.",
      });
      
      navigate('/profile');
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
      // Validate all fields
      const validationErrors = validateSignUpData({
        ...userData,
        confirmPassword: userData.password // Assuming password is confirmed in the UI
      });
      
      if (Object.keys(validationErrors).length > 0) {
        const firstError = Object.values(validationErrors)[0];
        throw new Error(firstError);
      }
      
      // Check if user already exists
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      if (users.some((u: any) => u.email.toLowerCase() === userData.email.toLowerCase())) {
        throw new Error("User with this email already exists");
      }
      
      if (users.some((u: any) => u.username?.toLowerCase() === userData.username.toLowerCase())) {
        throw new Error("Username is already taken");
      }
      
      // Create new user
      const newUser = {
        id: `user-${Math.random().toString(36).substring(2, 10)}`,
        username: userData.username,
        name: userData.name,
        email: userData.email,
        password: hashPassword(userData.password), // Hash password
        bio: "",
        location: userData.location,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}`,
        createdAt: new Date().toISOString(),
        trustScore: 5.0,
        helpOffered: 0,
        helpReceived: 0,
        volunteerHours: 0,
        verifiedStatus: false,
        emailVerified: false, // Start with unverified email
        loginAttempts: 0,
        lastLoginAttempt: null,
        trustBadges: []
      };
      
      // Save to "database" (localStorage)
      users.push(newUser);
      localStorage.setItem('users', JSON.stringify(users));
      
      // Send verification email
      await sendVerificationEmail(userData.email);
      
      // Create a user object without password for state
      const { password: _, ...userWithoutPassword } = newUser;
      const registeredUser: User = {
        ...userWithoutPassword,
        createdAt: new Date(userWithoutPassword.createdAt)
      };
      
      setUser(registeredUser);
      setEmailVerified(false);
      
      // Initialize empty posts and reviews array in localStorage if they don't exist
      if (!localStorage.getItem('posts')) {
        localStorage.setItem('posts', JSON.stringify([]));
      }
      
      if (!localStorage.getItem('reviews')) {
        localStorage.setItem('reviews', JSON.stringify([]));
      }
      
      toast({
        title: "Account created!",
        description: "Please check your email to verify your account.",
      });
      
      // Redirect to verification page
      navigate('/verify-email');
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

  const sendEmailVerification = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "No user found to send verification email",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await sendVerificationEmail(user.email);
      
      toast({
        title: "Verification email sent",
        description: "Please check your inbox and follow the link to verify your email.",
      });
    } catch (error) {
      toast({
        title: "Failed to send verification email",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const verifyEmail = async (token: string): Promise<boolean> => {
    if (!user) {
      return false;
    }
    
    try {
      // In a real app, this would validate the token against the backend
      const verificationTokensStr = localStorage.getItem('verificationTokens') || '{}';
      const verificationTokens = JSON.parse(verificationTokensStr);
      
      if (verificationTokens[user.email] === token) {
        // Update user in localStorage
        const usersStr = localStorage.getItem('users');
        const users = usersStr ? JSON.parse(usersStr) : [];
        
        const updatedUsers = users.map((u: any) => {
          if (u.id === user.id) {
            return { ...u, emailVerified: true };
          }
          return u;
        });
        
        localStorage.setItem('users', JSON.stringify(updatedUsers));
        
        // Update current user state
        setUser({ ...user, emailVerified: true });
        setEmailVerified(true);
        
        // Remove the used token
        delete verificationTokens[user.email];
        localStorage.setItem('verificationTokens', JSON.stringify(verificationTokens));
        
        toast({
          title: "Email verified!",
          description: "Your email has been successfully verified.",
        });
        
        return true;
      }
      
      toast({
        title: "Invalid verification token",
        description: "The verification link is invalid or has expired.",
        variant: "destructive",
      });
      
      return false;
    } catch (error) {
      toast({
        title: "Verification failed",
        description: "An error occurred during verification.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('sessionExpiry');
    setUser(null);
    setEmailVerified(false);
    
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    
    navigate('/login');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error("No user logged in");
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      // Check username uniqueness if being updated
      if (userData.username && userData.username !== user.username) {
        if (users.some((u: any) => 
          u.id !== user.id && u.username?.toLowerCase() === userData.username?.toLowerCase()
        )) {
          throw new Error("Username is already taken");
        }
      }
      
      // Check email uniqueness if being updated
      if (userData.email && userData.email !== user.email) {
        if (users.some((u: any) => 
          u.id !== user.id && u.email.toLowerCase() === userData.email.toLowerCase()
        )) {
          throw new Error("Email is already in use");
        }
      }
      
      // Handle email verification if email is changed
      let emailVerificationRequired = false;
      if (userData.email && userData.email !== user.email) {
        emailVerificationRequired = true;
        
        // Send verification email to new address
        await sendVerificationEmail(userData.email);
      }
      
      // Update user in localStorage
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          const updatedUser = { ...u, ...userData };
          
          // If email changed, set as unverified
          if (emailVerificationRequired) {
            updatedUser.emailVerified = false;
          }
          
          return updatedUser;
        }
        return u;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Update current user state
      const updatedUser = { ...user, ...userData };
      
      if (emailVerificationRequired) {
        updatedUser.emailVerified = false;
        setEmailVerified(false);
      }
      
      setUser(updatedUser);
      
      // Update stored user
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: "Profile updated",
        description: emailVerificationRequired
          ? "Your profile has been updated. Please verify your new email address."
          : "Your profile has been updated successfully.",
      });
      
      if (emailVerificationRequired) {
        navigate('/verify-email');
      }
    } catch (error) {
      let message = "Failed to update profile";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Update failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!user) {
      throw new Error("No user logged in");
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const currentUser = users.find((u: any) => u.id === user.id);
      
      if (!currentUser) {
        throw new Error("User not found");
      }
      
      // Verify current password
      if (!comparePassword(currentPassword, currentUser.password)) {
        throw new Error("Current password is incorrect");
      }
      
      // Update password
      const updatedUsers = users.map((u: any) => {
        if (u.id === user.id) {
          return { ...u, password: hashPassword(newPassword) };
        }
        return u;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      toast({
        title: "Password changed",
        description: "Your password has been updated successfully.",
      });
    } catch (error) {
      let message = "Failed to change password";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Password change failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const userExists = users.some((u: any) => u.email.toLowerCase() === email.toLowerCase());
      
      if (!userExists) {
        // For security, don't reveal if email exists or not
        toast({
          title: "Password reset email sent",
          description: "If an account with that email exists, you will receive reset instructions.",
        });
        return;
      }
      
      // Send reset email
      await sendPasswordResetEmail(email);
      
      toast({
        title: "Password reset email sent",
        description: "Please check your email for instructions to reset your password.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (data: PasswordResetData) => {
    setIsLoading(true);
    
    try {
      const { email, token, newPassword } = data;
      
      if (!email || !token || !newPassword) {
        throw new Error("Missing required information");
      }
      
      // In a real app, this would validate the token against the backend
      const resetTokensStr = localStorage.getItem('passwordResetTokens') || '{}';
      const resetTokens = JSON.parse(resetTokensStr);
      
      if (resetTokens[email] !== token) {
        throw new Error("Invalid or expired reset token");
      }
      
      // Update user password
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      const updatedUsers = users.map((u: any) => {
        if (u.email.toLowerCase() === email.toLowerCase()) {
          return { ...u, password: hashPassword(newPassword) };
        }
        return u;
      });
      
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Remove the used token
      delete resetTokens[email];
      localStorage.setItem('passwordResetTokens', JSON.stringify(resetTokens));
      
      toast({
        title: "Password reset successful",
        description: "Your password has been updated. You can now log in with your new password.",
      });
      
      navigate('/login');
    } catch (error) {
      let message = "Failed to reset password";
      if (error instanceof Error) {
        message = error.message;
      }
      
      toast({
        title: "Password reset failed",
        description: message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user) {
      throw new Error("No user logged in");
    }
    
    setIsLoading(true);
    
    try {
      // In a real app, this would be an API call
      const usersStr = localStorage.getItem('users');
      const users = usersStr ? JSON.parse(usersStr) : [];
      
      // Remove user
      const updatedUsers = users.filter((u: any) => u.id !== user.id);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      
      // Remove posts
      const postsStr = localStorage.getItem('posts');
      const posts = postsStr ? JSON.parse(postsStr) : [];
      const updatedPosts = posts.filter((p: any) => p.userId !== user.id);
      localStorage.setItem('posts', JSON.stringify(updatedPosts));
      
      // Remove reviews
      const reviewsStr = localStorage.getItem('reviews');
      const reviews = reviewsStr ? JSON.parse(reviewsStr) : [];
      const updatedReviews = reviews.filter((r: any) => r.fromUserId !== user.id && r.toUserId !== user.id);
      localStorage.setItem('reviews', JSON.stringify(updatedReviews));
      
      // Clear session
      localStorage.removeItem('user');
      localStorage.removeItem('sessionExpiry');
      setUser(null);
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted.",
      });
      
      navigate('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = async (field: string, value: string): Promise<string | null> => {
    switch (field) {
      case 'username':
        if (!value) return "Username is required";
        if (!/^[a-zA-Z0-9_-]{3,20}$/.test(value)) {
          return "Username must be 3-20 characters and contain only letters, numbers, dashes (-) and underscores (_)";
        }
        if (isUsernameTaken(value) && (!user || user.username !== value)) {
          return "Username is already taken";
        }
        return null;
        
      case 'email':
        if (!value) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        if (isEmailTaken(value) && (!user || user.email !== value)) {
          return "Email is already in use";
        }
        return null;
        
      case 'password':
        if (!value) return "Password is required";
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/.test(value)) {
          return "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character";
        }
        return null;
        
      default:
        return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        emailVerified,
        login,
        signUp,
        logout,
        sendEmailVerification,
        verifyEmail,
        updateProfile,
        changePassword,
        resetPassword,
        requestPasswordReset,
        deleteAccount,
        validateField,
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
