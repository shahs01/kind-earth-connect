
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const NotificationIndicator = () => {
  const { unreadCount, fetchNotifications } = useNotifications();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchNotifications();
      
      // Subscribe to new notifications
      const channel = supabase
        .channel('notification-changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          },
          () => {
            fetchNotifications();
          }
        )
        .subscribe();
      
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user?.id]);
  
  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate('/notifications')}
        aria-label="Notifications"
      >
        <Bell />
        {unreadCount > 0 && (
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
            variant="destructive"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default NotificationIndicator;
