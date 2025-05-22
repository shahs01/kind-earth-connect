
import React from "react";
import { User } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader2, Flag, User as UserIcon } from "lucide-react";

interface ConversationHeaderProps {
  otherUser: User | null;
  loading: boolean;
  onViewProfile: () => void;
  onReportUser: () => void;
}

const ConversationHeader = ({ 
  otherUser, 
  loading, 
  onViewProfile, 
  onReportUser 
}: ConversationHeaderProps) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <div 
        className="flex items-center cursor-pointer hover:bg-gray-50 rounded-md p-2" 
        onClick={onViewProfile}
      >
        {otherUser ? (
          <>
            <Avatar className="h-10 w-10 mr-3">
              <AvatarImage src={otherUser.avatar} alt={otherUser.name} />
              <AvatarFallback>{otherUser.name?.charAt(0) || '?'}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-medium">{otherUser.name || otherUser.username}</h3>
              {otherUser.location && (
                <p className="text-xs text-gray-500">{otherUser.location}</p>
              )}
            </div>
          </>
        ) : loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
        ) : (
          <span>Unknown user</span>
        )}
      </div>
      
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="ml-2"
          onClick={onViewProfile}
        >
          View Profile
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="text-red-600 border-red-200 hover:bg-red-50"
          onClick={onReportUser}
        >
          <Flag className="h-4 w-4 mr-1" />
          Report
        </Button>
      </div>
    </div>
  );
};

export default ConversationHeader;
