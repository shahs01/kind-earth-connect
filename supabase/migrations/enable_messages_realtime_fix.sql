
-- Enable realtime for messages table
ALTER TABLE IF EXISTS public.messages REPLICA IDENTITY FULL;

-- Create or update publication for realtime
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    -- Publication exists, add table if not already added
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
  ELSE
    -- Publication doesn't exist, create it
    CREATE PUBLICATION supabase_realtime FOR TABLE public.messages;
  END IF;
END;
$$;
