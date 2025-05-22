import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, X, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { useAuth } from "@/context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ResultCardProps {
  item: {
    id: string;
    title: string;
    category: string;
    location: string;
    description: string;
    postedBy: string;
    postedDate: string;
    userId?: string; // Add userId for messaging
  };
}

const ResultCard = ({ item }: ResultCardProps) => {
  const isOffer = item.id.startsWith('o');
  const { isAuthenticated, user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [messageContent, setMessageContent] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const handleContact = () => {
    if (!isAuthenticated) return;
    
    // If we have the user's ID, open the message dialog
    if (item.userId) {
      setMessageDialogOpen(true);
    } else {
      // Navigate to messages page as fallback
      navigate('/messages');
    }
  };
  
  const sendMessage = async () => {
    if (!item.userId || !messageContent.trim()) return;
    
    try {
      setSendingMessage(true);
      
      if (!user) {
        throw new Error("You must be logged in to send messages");
      }
      
      // Add post title to the message
      const messageWithContext = `Regarding: "${item.title}"\n\n${messageContent}`;
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: item.userId,
          content: messageWithContext
        })
        .select();
      
      if (error) throw error;
      
      toast({
        title: "Message sent",
        description: "Your message has been sent successfully!",
      });
      
      // Close dialog and reset
      setMessageDialogOpen(false);
      setMessageContent("");
      
      // Navigate to messages
      navigate('/messages');
    } catch (err: any) {
      console.error("Error sending message:", err);
      toast({
        title: "Error sending message",
        description: err.message || "Could not send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };
  
  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader>
          <div className="flex justify-between items-start">
            <Badge className={`${isOffer ? 'bg-thryvance-blue-light text-thryvance-blue' : 'bg-thryvance-green-light text-thryvance-green'}`}>
              {isOffer ? 'Offering' : 'Request'}
            </Badge>
            <Badge variant="outline">{item.category}</Badge>
          </div>
          <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
          <CardDescription className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3" /> {item.location}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-gray-700">{item.description}</p>
        </CardContent>
        <CardFooter className="flex flex-col items-start border-t pt-4">
          <div className="flex justify-between w-full text-sm text-gray-500">
            <span>Posted by: {item.postedBy}</span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(item.postedDate).toLocaleDateString()}
            </span>
          </div>
          <Button 
            className="mt-3 w-full bg-thryvance-green hover:bg-thryvance-green-dark"
            onClick={() => setIsDialogOpen(true)}
          >
            View Details
          </Button>
        </CardFooter>
      </Card>

      {/* Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl flex justify-between items-start">
              <span>{item.title}</span>
              <Badge className={`${isOffer ? 'bg-thryvance-blue-light text-thryvance-blue' : 'bg-thryvance-green-light text-thryvance-green'}`}>
                {isOffer ? 'Offering' : 'Request'}
              </Badge>
            </DialogTitle>
            <DialogDescription className="flex items-center gap-1 text-sm">
              <MapPin className="h-3 w-3" /> {item.location}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Badge variant="outline">{item.category}</Badge>
            
            <div>
              <h4 className="text-sm font-semibold mb-1">Description</h4>
              <p className="text-gray-700">{item.description}</p>
            </div>
            
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>Posted by: {item.postedBy}</span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(item.postedDate).toLocaleDateString()}
              </span>
            </div>
            
            <div className="border-t pt-4 mt-4">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-700">
                    You need to log in to message this person or respond to this post.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button asChild className="w-full sm:w-auto">
                      <Link to="/signup">Sign up</Link>
                    </Button>
                    <Button variant="outline" asChild className="w-full sm:w-auto">
                      <Link to="/login">Log in</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <Button 
                  className="w-full bg-thryvance-green hover:bg-thryvance-green-dark"
                  onClick={handleContact}
                >
                  Message {item.postedBy}
                </Button>
              )}
            </div>
          </div>
          
          <DialogClose className="absolute top-4 right-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogContent>
      </Dialog>
      
      {/* Message Dialog */}
      {item.userId && (
        <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Message to {item.postedBy}</DialogTitle>
              <DialogDescription>
                Regarding: {item.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <Textarea
                placeholder="Write your message here..."
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="min-h-[120px]"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setMessageDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={sendMessage}
                disabled={!messageContent.trim() || sendingMessage}
                className="bg-thryvance-green hover:bg-thryvance-green-dark"
              >
                {sendingMessage ? (
                  <>Sending...</>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ResultCard;
