
export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read?: boolean;
  sender?: {
    id: string;
    username?: string;
    email?: string;
    name?: string;
    avatar?: string;
    bio?: string;
    location?: string;
    trustScore?: number;
    helpOffered?: number;
    helpReceived?: number;
    volunteerHours?: number;
    createdAt: Date;
    verifiedStatus: boolean;
    emailVerified: boolean;
    trustBadges: string[];
    loginAttempts: number;
    lastLoginAttempt: Date | null;
  };
}

export interface Conversation {
  user: {
    id: string;
    username?: string;
    name?: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    created_at: string;
  };
  unreadCount?: number;
}
