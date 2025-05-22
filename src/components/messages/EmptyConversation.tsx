
import { MessageSquare } from "lucide-react";

const EmptyConversation = () => {
  return (
    <div className="h-96 flex flex-col items-center justify-center text-center p-6">
      <MessageSquare className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-xl font-medium mb-2">Select a conversation</h3>
      <p className="text-gray-500">
        Choose a conversation from the list or start a new one
      </p>
    </div>
  );
};

export default EmptyConversation;
