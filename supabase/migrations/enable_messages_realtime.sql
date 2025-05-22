
-- This migration enables realtime functionality for the messages table
-- It sets the table's replica identity to FULL so that all column values are available in change events
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the supabase_realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
