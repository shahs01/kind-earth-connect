export interface User {
  id: string;
  username: string; // Added username field
  name: string;
  email: string;
  avatar: string;
  bio: string;
  location: string;
  createdAt: Date;
  trustScore: number;
  helpOffered: number;
  helpReceived: number;
  verifiedStatus: boolean;
  emailVerified: boolean; // Added email verification status
  loginAttempts: number; // Added for security
  lastLoginAttempt: Date | null; // Added for security
  trustBadges: string[]; // Added for bonus feature
  volunteerHours?: number;
  reviewsGiven?: Review[];
  notificationPreferences?: NotificationPreferences; // Added for notification management
}

export interface NotificationPreferences {
  emailUpdates: boolean;
  messageNotifications: boolean;
  helpRequestAlerts: boolean;
  marketingEmails: boolean;
}

export interface Post {
  id: string;
  title: string;
  description: string;
  type: "offer" | "request";
  category: string;
  location: string;
  userId: string;
  user?: User; // Added user property that references the User who created the post
  createdAt: Date;
  status: "active" | "completed" | "archived" | "deleted" | "pending" | "rejected";
}

// Updated interface for reviews to include toUserId field
export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  toUserId?: string; // Added to identify which user received this review
  rating: number;
  text: string;
  createdAt: Date;
}

export interface RateUserFormData {
  rating: number;
  review: string;
}

// Updated Nonprofit interface with phoneNumber and email properties
export interface Nonprofit {
  id: string;
  name: string;
  logo: string;
  category: string;
  description: string;
  location: string;
  website: string;
  phoneNumber?: string; // Added optional phoneNumber property
  email?: string; // Added optional email property
  verified: boolean;
}

// Added for authentication validation
export interface AuthValidationErrors {
  username?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  location?: string;
  general?: string;
}

// Updated interface for signup data - removed location requirement
export interface SignUpData {
  username: string;
  name: string;
  email: string;
  password: string;
  phone: string;
}

// Added for password reset
export interface PasswordResetData {
  email: string;
  token?: string;
  newPassword?: string;
}
