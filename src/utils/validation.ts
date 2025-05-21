
import { AuthValidationErrors } from "@/types";

/**
 * Validates username format
 * @param username - Username to validate
 * @returns True if valid, false otherwise
 */
export const validateUsername = (username: string): boolean => {
  // 3-20 characters, only letters, numbers, dashes and underscores
  const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
  return usernameRegex.test(username);
};

/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns True if valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  // Minimum 8 chars, at least one uppercase, one lowercase, one number and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validates signup form data
 * @param data - Form data
 * @returns Object with validation errors
 */
export const validateSignUpData = (data: any): AuthValidationErrors => {
  const errors: AuthValidationErrors = {};
  
  if (!data.username) {
    errors.username = "Username is required";
  } else if (!validateUsername(data.username)) {
    errors.username = "Username must be 3-20 characters and contain only letters, numbers, dashes (-) and underscores (_)";
  }
  
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!validateEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }
  
  if (!data.password) {
    errors.password = "Password is required";
  } else if (!validatePassword(data.password)) {
    errors.password = "Password must be at least 8 characters with at least one uppercase letter, one lowercase letter, one number, and one special character";
  }
  
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords do not match";
  }
  
  if (!data.name) {
    errors.name = "Full name is required";
  }
  
  if (!data.location) {
    errors.location = "Location is required";
  }
  
  return errors;
};

/**
 * Check if username is already taken
 * @param username - Username to check
 * @returns True if taken, false otherwise
 */
export const isUsernameTaken = (username: string): boolean => {
  try {
    const usersStr = localStorage.getItem('users');
    const users = usersStr ? JSON.parse(usersStr) : [];
    return users.some((u: any) => u.username?.toLowerCase() === username.toLowerCase());
  } catch (error) {
    console.error("Error checking username:", error);
    return false;
  }
};

/**
 * Check if email is already taken
 * @param email - Email to check
 * @returns True if taken, false otherwise
 */
export const isEmailTaken = (email: string): boolean => {
  try {
    const usersStr = localStorage.getItem('users');
    const users = usersStr ? JSON.parse(usersStr) : [];
    return users.some((u: any) => u.email?.toLowerCase() === email.toLowerCase());
  } catch (error) {
    console.error("Error checking email:", error);
    return false;
  }
};

/**
 * Simulates sending a verification email
 * @param email - Email to send verification to
 * @returns Promise that resolves with a token
 */
export const sendVerificationEmail = async (email: string): Promise<string> => {
  // In a real app, this would send an actual email with a link
  // Here we just generate a token that we'll store in localStorage
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  try {
    const verificationTokensStr = localStorage.getItem('verificationTokens') || '{}';
    const verificationTokens = JSON.parse(verificationTokensStr);
    verificationTokens[email] = token;
    localStorage.setItem('verificationTokens', JSON.stringify(verificationTokens));
    
    // For demo purposes, log the token
    console.log(`Verification token for ${email}: ${token}`);
    
    return token;
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

/**
 * Simulates sending a password reset email
 * @param email - Email to send reset to
 * @returns Promise that resolves with a token
 */
export const sendPasswordResetEmail = async (email: string): Promise<string> => {
  // Similar to verification email, but for password reset
  const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  try {
    const resetTokensStr = localStorage.getItem('passwordResetTokens') || '{}';
    const resetTokens = JSON.parse(resetTokensStr);
    resetTokens[email] = token;
    localStorage.setItem('passwordResetTokens', JSON.stringify(resetTokens));
    
    // For demo purposes, log the token
    console.log(`Password reset token for ${email}: ${token}`);
    
    return token;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw new Error("Failed to send password reset email");
  }
};

/**
 * Hash password (mock implementation since we can't do real hashing in browser)
 * @param password - Password to hash
 * @returns Hashed password (simulated)
 */
export const hashPassword = (password: string): string => {
  // In a real app, you'd use bcrypt or similar
  // This is just a simple mock for demo purposes
  return btoa(password) + "_hashed";
};

/**
 * Compare password with hash (mock implementation)
 * @param password - Plain text password
 * @param hash - Hashed password
 * @returns True if match, false otherwise
 */
export const comparePassword = (password: string, hash: string): boolean => {
  // In a real app, you'd use bcrypt.compare or similar
  return hash === hashPassword(password);
};
