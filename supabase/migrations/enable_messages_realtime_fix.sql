
-- Fix replica identity setting for messages table
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Make sure the messages table is in the realtime publication
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
