
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  content: string;
  related_id: string | null;
  read: boolean;
  created_at: string;
}

export function useNotifications() {
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();
  
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setNotifications(data || []);
      
      // Count unread notifications
      const unread = data?.filter(n => !n.read).length || 0;
      setUnreadCount(unread);
      
      return data;
    } catch (error: any) {
      toast({
        title: "Error fetching notifications",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };
  
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update the notification in state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating notification",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };
  
  const markAllAsRead = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('read', false);
      
      if (error) throw error;
      
      // Update all notifications in state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // Reset unread count
      setUnreadCount(0);
      
      toast({
        title: "All notifications marked as read",
      });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error updating notifications",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Remove the notification from state
      const deleted = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Update unread count if needed
      if (deleted && !deleted.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting notification",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }
  };
  
  const handleNotificationAction = async (notification: Notification) => {
    // Mark as read
    await markAsRead(notification.id);
    
    // Navigate based on notification type
    if (notification.type === 'message' && notification.related_id) {
      // For message notifications, the related_id is the message ID
      // We need to get the sender ID to navigate to the conversation
      try {
        const { data, error } = await supabase
          .from('messages')
          .select('sender_id')
          .eq('id', notification.related_id)
          .single();
        
        if (error) throw error;
        
        if (data) {
          return {
            type: 'message',
            userId: data.sender_id
          };
        }
      } catch (error) {
        console.error("Error handling notification action:", error);
      }
    }
    
    return {
      type: notification.type,
      id: notification.related_id
    };
  };
  
  return {
    loading,
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    handleNotificationAction
  };
}
