
export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  createdAt: Date;
  trustScore: number;
  helpOffered: number;
  helpReceived: number;
  verifiedStatus: boolean;
};

export type PostType = 'offer' | 'request';

export type Post = {
  id: string;
  title: string;
  description: string;
  type: PostType;
  category: string;
  location: string;
  userId: string;
  user?: User;
  createdAt: Date;
  status: 'active' | 'completed' | 'cancelled';
};

export type Nonprofit = {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  website?: string;
  phoneNumber?: string;
  email?: string;
  logo?: string;
};
