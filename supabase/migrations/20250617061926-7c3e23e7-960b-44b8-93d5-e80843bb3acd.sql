
-- Create a table to track user conversation states
CREATE TABLE public.user_conversation_states (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  other_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  last_message_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, other_user_id)
);

-- Enable RLS
ALTER TABLE public.user_conversation_states ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own conversation states" 
  ON public.user_conversation_states 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversation states" 
  ON public.user_conversation_states 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversation states" 
  ON public.user_conversation_states 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversation states" 
  ON public.user_conversation_states 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION public.update_conversation_state_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create trigger
CREATE TRIGGER update_conversation_state_updated_at
  BEFORE UPDATE ON public.user_conversation_states
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_state_updated_at();
