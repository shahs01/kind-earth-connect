


export interface User {
  id: string;
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
  status: "active" | "completed" | "archived" | "deleted";
}

// New interfaces for reviews
export interface Review {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
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

