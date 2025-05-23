
-- This migration consolidates the previous attempts to enable realtime for messages
-- and ensures the configuration is correct

-- First, set the replica identity to full to provide complete row data
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Then, add the messages table to the supabase_realtime publication
-- This enables the realtime functionality for the messages table
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Ensure RLS policies are in place for the messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to view their own messages
CREATE POLICY IF NOT EXISTS "Users can view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Create policy that allows users to insert their own messages
CREATE POLICY IF NOT EXISTS "Users can create their own messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = sender_id);
