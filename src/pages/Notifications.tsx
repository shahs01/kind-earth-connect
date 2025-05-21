
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useNotifications, Notification } from "@/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Bell, Trash2, Check } from "lucide-react";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";

const Notifications = () => {
  const { 
    loading, 
    notifications, 
    fetchNotifications, 
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    handleNotificationAction
  } = useNotifications();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  useEffect(() => {
    fetchNotifications();
  }, []);
  
  const handleNotificationClick = async (notification: Notification) => {
    const result = await handleNotificationAction(notification);
    
    if (result.type === 'message') {
      navigate(`/messages/${result.userId}`);
    }
    // Add more notification type handlers here
  };
  
  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    setDeletingId(notificationId);
    await deleteNotification(notificationId);
    setDeletingId(null);
  };
  
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <Bell className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Notifications</h1>
              <Button 
                variant="outline" 
                onClick={markAllAsRead}
                disabled={loading || notifications.every(n => n.read)}
              >
                <Check className="mr-2 h-4 w-4" />
                Mark all as read
              </Button>
            </div>
            
            <Card className="shadow-sm bg-white">
              <CardContent className="p-0">
                {loading && notifications.length === 0 ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-thryvance-green" />
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-16">
                    <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <h3 className="text-xl font-medium mb-2">No notifications</h3>
                    <p className="text-gray-500">
                      You don't have any notifications at the moment
                    </p>
                  </div>
                ) : (
                  <div>
                    {notifications.map((notification, index) => (
                      <div key={notification.id}>
                        <div 
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                            !notification.read ? 'bg-blue-50' : ''
                          }`}
                        >
                          <div className="flex items-start">
                            <div className={`mr-4 p-2 rounded-full ${
                              !notification.read ? 'bg-thryvance-blue/10 text-thryvance-blue' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h4 className={`font-medium ${
                                  !notification.read ? 'text-thryvance-blue' : ''
                                }`}>
                                  {notification.content}
                                </h4>
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs text-gray-500">
                                    {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                                  </span>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={(e) => handleDelete(e, notification.id)}
                                    disabled={deletingId === notification.id}
                                  >
                                    {deletingId === notification.id ? (
                                      <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                      <Trash2 className="h-4 w-4" />
                                    )}
                                  </Button>
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="mt-1">
                                  <span className="inline-block bg-thryvance-blue/10 text-thryvance-blue text-xs px-2 py-0.5 rounded-full">
                                    New
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        {index < notifications.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Notifications;
