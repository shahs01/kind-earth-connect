
-- Enable row level security for messages table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Enable replica identity full for realtime functionality
ALTER TABLE public.messages REPLICA IDENTITY FULL;

-- Add messages table to the realtime publication
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

  -- Add the messages table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
COMMIT;

-- Create policy to allow users to select their own messages
CREATE POLICY "Users can view their own messages" 
ON public.messages 
FOR SELECT 
USING ((auth.uid() = sender_id) OR (auth.uid() = receiver_id));

-- Create policy to allow users to insert messages
CREATE POLICY "Users can send messages" 
ON public.messages 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

-- Create policy to allow users to update their own messages
CREATE POLICY "Users can update their own messages" 
ON public.messages 
FOR UPDATE 
USING (auth.uid() = sender_id);
