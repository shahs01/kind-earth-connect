
import { useState } from "react";
import { User } from "@/types";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User as UserIcon, MapPin, Calendar, Star, Check, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import EditProfileDialog from "@/components/EditProfileDialog";
import { format } from "date-fns";

interface ProfileCardProps {
  user: User;
  isOwnProfile?: boolean;
  compact?: boolean;
  onConnectClick?: () => void;
  onAvatarClick?: () => void;
  onViewFullProfile?: () => void;
}

const ProfileCard = ({ 
  user, 
  isOwnProfile = false, 
  compact = false, 
  onConnectClick,
  onAvatarClick,
  onViewFullProfile
}: ProfileCardProps) => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
  // Only display trust score if it's not the default (5.0)
  const showTrustScore = user.trustScore !== 5.0;
  
  // Only show help metrics if the user has actual activity
  const showHelpMetrics = user.helpOffered > 0 || user.helpReceived > 0;
  
  // Helper function to safely format the date
  const formatMemberSince = (createdAt: any) => {
    try {
      if (!createdAt) return 'Unknown';
      
      let date;
      
      // Handle the complex nested object structure from console logs
      if (createdAt.value?.iso) {
        date = new Date(createdAt.value.iso);
      } else if (createdAt.iso) {
        date = new Date(createdAt.iso);
      } else if (typeof createdAt === 'string') {
        date = new Date(createdAt);
      } else if (createdAt instanceof Date) {
        date = createdAt;
      } else if (createdAt._type === 'Date' && createdAt.value?.iso) {
        date = new Date(createdAt.value.iso);
      } else {
        console.log('Unhandled date format:', createdAt);
        return 'Unknown';
      }
      
      if (isNaN(date.getTime())) {
        console.log('Invalid date created from:', createdAt);
        return 'Unknown';
      }
      
      return format(date, 'MMM yyyy');
    } catch (error) {
      console.error('Error formatting date:', error, createdAt);
      return 'Unknown';
    }
  };
  
  return (
    <Card className={`overflow-hidden shadow-md ${compact ? 'max-w-md mx-auto' : ''}`}>
      <CardHeader className={`bg-gradient-to-r from-thryvance-green-light to-thryvance-blue-light ${compact ? 'pb-12' : 'pb-16'} relative`}>
        {isOwnProfile && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700"
            onClick={() => setIsEditDialogOpen(true)}
          >
            Edit Profile
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex flex-col items-center -mt-12">
          <div 
            className={`${compact ? 'h-20 w-20' : 'h-24 w-24'} rounded-full bg-thryvance-neutral flex items-center justify-center border-4 border-white shadow-md ${isOwnProfile ? 'cursor-pointer hover:opacity-90' : ''}`}
            onClick={isOwnProfile ? onAvatarClick : undefined}
          >
            {user.avatar ? (
              <Avatar className="h-full w-full">
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                <AvatarFallback>
                  <UserIcon className="h-10 w-10 text-thryvance-neutral-dark" />
                </AvatarFallback>
              </Avatar>
            ) : (
              <UserIcon className={`${compact ? 'h-10 w-10' : 'h-12 w-12'} text-thryvance-neutral-dark`} />
            )}
          </div>
          
          <div className="text-center mt-3">
            <h2 className="text-xl font-bold">{user.name}</h2>
            
            {user.location && (
              <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-600">
                <MapPin className="h-4 w-4" />
                <span>{user.location}</span>
              </div>
            )}
            
            <div className="flex items-center justify-center gap-1 mt-1 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>Member since {formatMemberSince(user.createdAt)}</span>
            </div>
            
            <div className="flex items-center justify-center gap-2 mt-3">
              {user.verifiedStatus && (
                <Badge variant="outline" className="flex items-center gap-1 bg-thryvance-green/10 text-thryvance-green-dark border-thryvance-green/20">
                  <Check className="h-3 w-3" />
                  Verified
                </Badge>
              )}
              
              {showTrustScore && (
                <Badge variant="outline" className="flex items-center gap-1 bg-thryvance-blue/10 text-thryvance-blue-dark border-thryvance-blue/20">
                  <Star className="h-3 w-3" />
                  {user.trustScore} Trust Score
                </Badge>
              )}
            </div>
            
            {user.bio && !compact && (
              <p className="text-gray-600 mt-4 text-sm">{user.bio}</p>
            )}
          </div>
          
          {!compact && showHelpMetrics && (
            <>
              <div className="w-full grid grid-cols-2 gap-4 mt-6">
                <div className="bg-thryvance-green-light/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-thryvance-green-dark">{user.helpOffered}</p>
                  <p className="text-sm text-gray-600">Help Offered</p>
                </div>
                
                <div className="bg-thryvance-blue-light/50 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-thryvance-blue-dark">{user.helpReceived}</p>
                  <p className="text-sm text-gray-600">Help Received</p>
                </div>
              </div>
            </>
          )}
          
          {compact && showHelpMetrics && (
            <div className="w-full mt-4 grid grid-cols-2 gap-3">
              <div className="bg-thryvance-green-light/50 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-thryvance-green-dark">{user.helpOffered}</p>
                <p className="text-xs text-gray-600">Help Offered</p>
              </div>
              
              <div className="bg-thryvance-blue-light/50 p-3 rounded-lg text-center">
                <p className="text-lg font-bold text-thryvance-blue-dark">{user.helpReceived}</p>
                <p className="text-xs text-gray-600">Help Received</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
      
      {!isOwnProfile && (
        <CardFooter className="flex justify-between border-t pt-4 flex-wrap gap-2">
          <Button 
            className="bg-thryvance-green hover:bg-thryvance-green-dark"
            onClick={onConnectClick}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message {user.name.split(" ")[0]}
          </Button>
          
          {onViewFullProfile && (
            <Button 
              variant="outline" 
              onClick={onViewFullProfile}
            >
              View Full Profile
            </Button>
          )}
        </CardFooter>
      )}
      
      {isOwnProfile && (
        <EditProfileDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen} 
        />
      )}
    </Card>
  );
};

export default ProfileCard;
