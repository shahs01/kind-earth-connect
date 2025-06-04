
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar, MapPin, MessageSquare, Heart, User } from "lucide-react";
import { User as UserType } from "@/types";
import ProfileDialog from "@/components/ProfileDialog";

interface ResultCardProps {
  post: {
    id: string;
    type: "offer" | "request";
    title: string;
    description: string;
    location: string;
    category: string;
    createdAt: string;
    photos?: string[];
    user: {
      id: string;
      name: string;
      avatar: string;
    };
    likes: number;
    comments: number;
  };
  onConnect?: (userId: string) => void;
}

const ResultCard = ({ post, onConnect }: ResultCardProps) => {
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  
  // Create a User object for the ProfileDialog
  const userForDialog: UserType = {
    id: post.user.id,
    name: post.user.name,
    username: post.user.name.toLowerCase().replace(/\s+/g, ''),
    email: '', // We don't have this in the post data
    avatar: post.user.avatar,
    bio: '',
    location: post.location, // Use post location as user location
    trustScore: 5.0, // Default trust score
    helpOffered: 0, // We don't have this data here
    helpReceived: 0, // We don't have this data here
    verifiedStatus: false,
    emailVerified: false,
    loginAttempts: 0,
    lastLoginAttempt: null,
    volunteerHours: 0,
    trustBadges: [],
    createdAt: new Date(), // We don't have the actual creation date
    reviewsGiven: [],
    notificationPreferences: {
      emailUpdates: true,
      messageNotifications: true,
      helpRequestAlerts: true,
      marketingEmails: false
    }
  };

  const handleUserClick = () => {
    setShowProfileDialog(true);
  };

  const handleConnect = () => {
    if (onConnect) {
      onConnect(post.user.id);
    }
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Avatar 
                className="h-10 w-10 cursor-pointer hover:opacity-80" 
                onClick={handleUserClick}
              >
                <AvatarImage src={post.user.avatar} alt={post.user.name} />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 
                  className="font-semibold cursor-pointer hover:text-thryvance-green"
                  onClick={handleUserClick}
                >
                  {post.user.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 space-x-4">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {post.createdAt}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {post.location}
                  </div>
                </div>
              </div>
            </div>
            <Badge 
              variant="secondary" 
              className={post.type === 'offer' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}
            >
              {post.type === 'offer' ? 'Offering Help' : 'Requesting Help'}
            </Badge>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">{post.title}</h2>
            <p className="text-gray-600 text-sm mb-2">{post.description}</p>
            <Badge variant="outline" className="text-xs">
              {post.category}
            </Badge>
          </div>

          {post.photos && post.photos.length > 0 && (
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-2">
                {post.photos.slice(0, 3).map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`Post image ${index + 1}`}
                    className="w-full h-20 object-cover rounded"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Heart className="h-4 w-4 mr-1" />
                {post.likes}
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-1" />
                {post.comments}
              </div>
            </div>
            <Button 
              onClick={handleConnect}
              className="bg-thryvance-green hover:bg-thryvance-green-dark"
              size="sm"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Connect
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProfileDialog
        user={userForDialog}
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onViewFullProfile={() => setShowProfileDialog(false)}
      />
    </>
  );
};

export default ResultCard;
