
-- Enable realtime for messages table
ALTER TABLE IF EXISTS public.messages REPLICA IDENTITY FULL;

-- Create or update publication for realtime
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR TABLE public.messages;
  ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
    ) THEN
      ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
    END IF;
  END IF;
END;
$$;

-- Update RLS policies for messages table
DROP POLICY IF EXISTS "Users can view their messages" ON public.messages;
CREATE POLICY "Users can view their messages" 
ON public.messages 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can send messages" ON public.messages;
CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "Users can update their sent messages" ON public.messages;
CREATE POLICY "Users can update their sent messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);
