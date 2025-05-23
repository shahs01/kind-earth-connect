
import React from "react";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Conversation } from "@/hooks/useMessages";

interface ConversationsListProps {
  conversations: Conversation[];
  selectedUserId?: string;
  onSelectConversation: (userId: string) => void;
}

const ConversationsList = ({ 
  conversations, 
  selectedUserId, 
  onSelectConversation 
}: ConversationsListProps) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a conversation by messaging someone</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {conversations.map((conversation) => (
        <div
          key={conversation.other_user.id}
          onClick={() => onSelectConversation(conversation.other_user.id)}
          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
            selectedUserId === conversation.other_user.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
          }`}
        >
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage 
                src={conversation.other_user.avatar || ''} 
                alt={conversation.other_user.name || 'User'} 
              />
              <AvatarFallback>
                {conversation.other_user.name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {conversation.other_user.name || conversation.other_user.username || 'User'}
                </p>
                {conversation.last_message_at && (
                  <p className="text-xs text-gray-500">
                    {format(new Date(conversation.last_message_at), 'MMM d')}
                  </p>
                )}
              </div>
              
              {conversation.last_message && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {conversation.last_message.content}
                </p>
              )}
              
              {conversation.unread_count > 0 && (
                <div className="mt-1">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {conversation.unread_count} new
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ConversationsList;
