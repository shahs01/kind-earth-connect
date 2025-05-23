
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { User } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  sender?: User;
  receiver?: User;
}

export interface Conversation {
  userId: string;
  user: User;
  lastMessage?: Message;
  unreadCount: number;
}

export function useMessagingSystem() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const channelRef = useRef<RealtimeChannel | null>(null);
  const { toast } = useToast();

  // Get current user on mount
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
        setConnectionStatus('disconnected');
        return;
      }
      
      if (data?.user) {
        setCurrentUserId(data.user.id);
        setConnectionStatus('connected');
      } else {
        setConnectionStatus('disconnected');
      }
    };

    fetchUser();
  }, []);

  // Set up realtime subscription for new messages
  useEffect(() => {
    if (!currentUserId) return;
    
    const setupRealtimeSubscription = () => {
      // Clean up previous subscription if it exists
      if (channelRef.current) {
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      }
      
      console.log("Setting up realtime subscription for messages");
      
      const channel = supabase.channel('public:messages')
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${currentUserId}`
        }, (payload) => {
          console.log("Received new message:", payload);
          handleNewMessage(payload.new as unknown as Message);
        })
        .subscribe((status) => {
          console.log("Realtime subscription status:", status);
          if (status === 'SUBSCRIBED') {
            setConnectionStatus('connected');
          } else if (status === 'CHANNEL_ERROR') {
            setConnectionStatus('disconnected');
            toast({
              title: "Connection Error",
              description: "Failed to connect to real-time updates",
              variant: "destructive"
            });
          }
        });
      
      channelRef.current = channel;
    };

    setupRealtimeSubscription();
    
    return () => {
      if (channelRef.current) {
        console.log("Cleaning up realtime subscription");
        channelRef.current.unsubscribe();
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [currentUserId, toast]);

  // Handle new message received via realtime
  const handleNewMessage = useCallback(async (newMessage: Message) => {
    console.log("Handling new message:", newMessage);
    
    // Fetch sender profile if needed
    if (!newMessage.sender && newMessage.sender_id) {
      try {
        const { data: senderData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', newMessage.sender_id)
          .single();
          
        if (senderData) {
          newMessage.sender = {
            id: senderData.id,
            name: senderData.name || '',
            username: senderData.username || '',
            email: senderData.email || '',
            avatar: senderData.avatar || '',
            bio: senderData.bio || '',
            location: senderData.location || '',
            trustScore: senderData.trust_score || 0,
            helpOffered: senderData.help_offered || 0,
            helpReceived: senderData.help_received || 0,
            volunteerHours: senderData.volunteer_hours || 0,
            createdAt: new Date(senderData.created_at || Date.now()),
            verifiedStatus: senderData.verified_status || false,
            emailVerified: true,
            trustBadges: senderData.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          };
        }
      } catch (error) {
        console.error("Error fetching message sender:", error);
      }
    }
    
    // Add to messages if this is for active conversation
    if (activeConversation === newMessage.sender_id) {
      setMessages(prevMessages => {
        // Avoid duplicates
        if (prevMessages.some(msg => msg.id === newMessage.id)) {
          return prevMessages;
        }
        return [...prevMessages, newMessage].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
      
      // Mark as read if this is the active conversation
      markMessageAsRead(newMessage.id);
    }
    
    // Update conversations list with new message
    updateConversationWithMessage(newMessage);
    
    // Show toast notification for new message if not in active conversation
    if (activeConversation !== newMessage.sender_id) {
      const senderName = newMessage.sender?.name || 'Someone';
      toast({
        title: `New message from ${senderName}`,
        description: newMessage.content.length > 50 
          ? `${newMessage.content.substring(0, 50)}...` 
          : newMessage.content
      });
    }
  }, [activeConversation, toast]);

  // Update the conversations list when a new message arrives
  const updateConversationWithMessage = useCallback((message: Message) => {
    setConversations(prevConversations => {
      // Find if conversation exists
      const otherUserId = message.sender_id === currentUserId 
        ? message.receiver_id 
        : message.sender_id;
      
      const existingIndex = prevConversations.findIndex(c => c.userId === otherUserId);
      
      if (existingIndex >= 0) {
        // Update existing conversation
        const updatedConversations = [...prevConversations];
        updatedConversations[existingIndex] = {
          ...updatedConversations[existingIndex],
          lastMessage: message,
          unreadCount: activeConversation === otherUserId 
            ? 0 
            : updatedConversations[existingIndex].unreadCount + (message.sender_id !== currentUserId ? 1 : 0)
        };
        
        // Sort by most recent message
        return updatedConversations.sort((a, b) => {
          const aTime = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
          const bTime = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
          return bTime - aTime;
        });
      } else if (message.sender_id !== currentUserId) {
        // Create new conversation if we have user info
        if (message.sender) {
          const newConversation: Conversation = {
            userId: message.sender_id,
            user: message.sender,
            lastMessage: message,
            unreadCount: 1
          };
          return [newConversation, ...prevConversations];
        } else {
          // We need to fetch the other user's profile
          fetchUserProfile(otherUserId).then(user => {
            if (user) {
              setConversations(curr => [
                {
                  userId: otherUserId,
                  user,
                  lastMessage: message,
                  unreadCount: activeConversation === otherUserId ? 0 : 1
                },
                ...curr.filter(c => c.userId !== otherUserId)
              ]);
            }
          });
        }
      }
      
      return prevConversations;
    });
  }, [activeConversation, currentUserId]);

  // Fetch all conversations
  const fetchConversations = useCallback(async () => {
    if (!currentUserId) return;
    
    setIsLoadingConversations(true);
    setError(null);
    
    try {
      console.log("Fetching conversations");
      
      // Get all messages for this user
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });
        
      if (messagesError) {
        throw messagesError;
      }
      
      console.log(`Fetched ${messagesData?.length || 0} messages`);
      
      if (!messagesData || messagesData.length === 0) {
        setConversations([]);
        setIsLoadingConversations(false);
        return;
      }
      
      // Group messages by conversation (other user)
      const conversationMap = new Map<string, {
        lastMessage: Message;
        unreadCount: number;
      }>();
      
      messagesData.forEach(message => {
        const otherUserId = message.sender_id === currentUserId 
          ? message.receiver_id 
          : message.sender_id;
          
        const existing = conversationMap.get(otherUserId);
        
        if (!existing || new Date(message.created_at) > new Date(existing.lastMessage.created_at)) {
          conversationMap.set(otherUserId, {
            lastMessage: message as Message,
            unreadCount: existing ? existing.unreadCount : 0
          });
        }
        
        // Count unread messages where user is receiver
        if (message.receiver_id === currentUserId && !message.read) {
          const current = conversationMap.get(otherUserId);
          if (current) {
            current.unreadCount += 1;
          }
        }
      });
      
      // Fetch user profiles for all conversation partners
      const userIds = Array.from(conversationMap.keys());
      
      if (userIds.length === 0) {
        setConversations([]);
        setIsLoadingConversations(false);
        return;
      }
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        // Continue without complete profiles
      }
      
      // Create conversation objects
      const conversationsData: Conversation[] = [];
      
      for (const [userId, data] of conversationMap.entries()) {
        const profile = (profilesData || []).find(p => p.id === userId);
        
        if (profile) {
          const user: User = {
            id: profile.id,
            name: profile.name || '',
            username: profile.username || '',
            email: profile.email || '',
            avatar: profile.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || '')}`,
            bio: profile.bio || '',
            location: profile.location || '',
            trustScore: profile.trust_score || 0,
            helpOffered: profile.help_offered || 0,
            helpReceived: profile.help_received || 0,
            volunteerHours: profile.volunteer_hours || 0,
            createdAt: new Date(profile.created_at || Date.now()),
            verifiedStatus: profile.verified_status || false,
            emailVerified: true,
            trustBadges: profile.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          };
          
          conversationsData.push({
            userId,
            user,
            lastMessage: data.lastMessage,
            unreadCount: data.unreadCount
          });
        } else {
          console.warn(`No profile found for user ${userId}`);
        }
      }
      
      // Sort by most recent message
      conversationsData.sort((a, b) => {
        const aTime = a.lastMessage?.created_at ? new Date(a.lastMessage.created_at).getTime() : 0;
        const bTime = b.lastMessage?.created_at ? new Date(b.lastMessage.created_at).getTime() : 0;
        return bTime - aTime;
      });
      
      console.log(`Created ${conversationsData.length} conversations`);
      setConversations(conversationsData);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setError("Failed to load conversations");
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setIsLoadingConversations(false);
    }
  }, [currentUserId, toast]);

  // Fetch user profile
  const fetchUserProfile = useCallback(async (userId: string): Promise<User | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        return {
          id: data.id,
          name: data.name || '',
          username: data.username || '',
          email: data.email || '',
          avatar: data.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.name || '')}`,
          bio: data.bio || '',
          location: data.location || '',
          trustScore: data.trust_score || 0,
          helpOffered: data.help_offered || 0,
          helpReceived: data.help_received || 0,
          volunteerHours: data.volunteer_hours || 0,
          createdAt: new Date(data.created_at || Date.now()),
          verifiedStatus: data.verified_status || false,
          emailVerified: true,
          trustBadges: data.trust_badges || [],
          loginAttempts: 0,
          lastLoginAttempt: null
        };
      }
    } catch (error) {
      console.error(`Error fetching profile for ${userId}:`, error);
    }
    
    return null;
  }, []);

  // Set active conversation and load its messages
  const openConversation = useCallback(async (userId: string) => {
    console.log(`Opening conversation with user ${userId}`);
    setActiveConversation(userId);
    setIsLoadingMessages(true);
    setMessages([]);
    
    try {
      // Fetch messages between current user and selected user
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),` +
          `and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`
        )
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      
      console.log(`Fetched ${data?.length || 0} messages for conversation`);
      
      // Fetch profiles for messages if needed
      const messagesWithProfiles = await addProfilesToMessages(data as Message[]);
      setMessages(messagesWithProfiles);
      
      // Mark unread messages as read
      const unreadMessages = data?.filter(msg => 
        msg.receiver_id === currentUserId && !msg.read
      ) || [];
      
      if (unreadMessages.length > 0) {
        console.log(`Marking ${unreadMessages.length} messages as read`);
        await markMessagesAsRead(unreadMessages.map(msg => msg.id));
        
        // Update conversations unread count
        setConversations(prevConversations => 
          prevConversations.map(conv => 
            conv.userId === userId 
              ? { ...conv, unreadCount: 0 } 
              : conv
          )
        );
      }
    } catch (error) {
      console.error("Error fetching conversation messages:", error);
      setError("Failed to load messages");
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoadingMessages(false);
    }
  }, [currentUserId, toast]);

  // Add profile data to messages
  const addProfilesToMessages = useCallback(async (messages: Message[]): Promise<Message[]> => {
    if (!messages || messages.length === 0) return [];
    
    try {
      // Get unique user IDs from messages
      const userIds = Array.from(new Set([
        ...messages.map(msg => msg.sender_id),
        ...messages.map(msg => msg.receiver_id)
      ]));
      
      // Fetch profiles for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds);
        
      const profileMap = new Map();
      (profiles || []).forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      
      // Attach profiles to messages
      return messages.map(message => {
        const senderProfile = profileMap.get(message.sender_id);
        const receiverProfile = profileMap.get(message.receiver_id);
        
        const messageCopy = { ...message };
        
        if (senderProfile) {
          messageCopy.sender = {
            id: senderProfile.id,
            name: senderProfile.name || '',
            username: senderProfile.username || '',
            email: senderProfile.email || '',
            avatar: senderProfile.avatar || '',
            bio: senderProfile.bio || '',
            location: senderProfile.location || '',
            trustScore: senderProfile.trust_score || 0,
            helpOffered: senderProfile.help_offered || 0,
            helpReceived: senderProfile.help_received || 0,
            volunteerHours: senderProfile.volunteer_hours || 0,
            createdAt: new Date(senderProfile.created_at || Date.now()),
            verifiedStatus: senderProfile.verified_status || false,
            emailVerified: true,
            trustBadges: senderProfile.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          };
        }
        
        if (receiverProfile) {
          messageCopy.receiver = {
            id: receiverProfile.id,
            name: receiverProfile.name || '',
            username: receiverProfile.username || '',
            email: receiverProfile.email || '',
            avatar: receiverProfile.avatar || '',
            bio: receiverProfile.bio || '',
            location: receiverProfile.location || '',
            trustScore: receiverProfile.trust_score || 0,
            helpOffered: receiverProfile.help_offered || 0,
            helpReceived: receiverProfile.help_received || 0,
            volunteerHours: receiverProfile.volunteer_hours || 0,
            createdAt: new Date(receiverProfile.created_at || Date.now()),
            verifiedStatus: receiverProfile.verified_status || false,
            emailVerified: true,
            trustBadges: receiverProfile.trust_badges || [],
            loginAttempts: 0,
            lastLoginAttempt: null
          };
        }
        
        return messageCopy;
      });
    } catch (error) {
      console.error("Error adding profiles to messages:", error);
      return messages;
    }
  }, []);

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!messageIds || messageIds.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .in('id', messageIds);
        
      if (error) {
        console.error("Error marking messages as read:", error);
      }
    } catch (error) {
      console.error("Failed to mark messages as read:", error);
    }
  }, []);

  // Mark a single message as read
  const markMessageAsRead = useCallback(async (messageId: string) => {
    markMessagesAsRead([messageId]);
  }, [markMessagesAsRead]);

  // Send a new message
  const sendMessage = useCallback(async (receiverId: string, content: string) => {
    if (!currentUserId || !content.trim()) {
      toast({
        title: "Cannot send message",
        description: "Please enter a message",
        variant: "destructive"
      });
      return null;
    }
    
    setIsSending(true);
    console.log(`Sending message to ${receiverId}: ${content.substring(0, 20)}${content.length > 20 ? '...' : ''}`);
    
    try {
      // Create new message
      const newMessage = {
        sender_id: currentUserId,
        receiver_id: receiverId,
        content: content.trim(),
        read: false
      };
      
      const { data, error } = await supabase
        .from('messages')
        .insert(newMessage)
        .select('*, sender:profiles!sender_id(*)')
        .single();
        
      if (error) throw error;
      
      console.log("Message sent successfully:", data.id);
      
      // Add message to local state to appear immediately
      const messageWithProfile = data as unknown as Message;
      
      setMessages(prevMessages => {
        // Avoid duplicates
        if (prevMessages.some(msg => msg.id === messageWithProfile.id)) {
          return prevMessages;
        }
        
        return [...prevMessages, messageWithProfile].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      });
      
      // Update conversations list with new message
      updateConversationWithMessage(messageWithProfile);
      
      return messageWithProfile;
    } catch (error) {
      console.error("Failed to send message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsSending(false);
    }
  }, [currentUserId, toast, updateConversationWithMessage]);

  // Initial data fetch
  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
    }
  }, [currentUserId, fetchConversations]);

  return {
    currentUserId,
    conversations,
    messages,
    activeConversation,
    isLoadingConversations,
    isLoadingMessages,
    isSending,
    error,
    connectionStatus,
    fetchConversations,
    openConversation,
    sendMessage
  };
}
