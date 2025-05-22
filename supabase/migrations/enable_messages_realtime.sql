
-- This migration enables realtime functionality for the messages table
-- It sets the table's replica identity to FULL so that all column values are available in change events
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add the messages table to the supabase_realtime publication
BEGIN;
  -- Check if the publication exists
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
      CREATE PUBLICATION supabase_realtime;
    END IF;
  END
  $$;

  -- Add the messages table to the publication (if not already added)
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
  END
  $$;
COMMIT;
