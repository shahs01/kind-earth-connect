
import { useEffect, useState, useRef } from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";
import { RealtimeChannel } from "@supabase/supabase-js";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import MessagesLayout from "@/components/messages/MessagesLayout";

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  console.log("Messages component rendering with route:", location.pathname);
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow py-8 bg-gray-50">
        <MessagesLayout />
      </main>
      <Footer />
    </div>
  );
};

export default Messages;
