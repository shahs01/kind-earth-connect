-- Phase 1: Critical RLS Policy Fixes

-- 1. Enhance user_roles table security
DROP POLICY IF EXISTS "Users can view relevant roles" ON public.user_roles;

-- Only admins can manage user roles
CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL USING (is_admin(auth.uid()));

-- Users can only view their own role
CREATE POLICY "Users can view own role" ON public.user_roles  
FOR SELECT USING (auth.uid() = user_id);

-- 2. Add audit logging for role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_admin_action(
      'Added role: ' || NEW.role::text, 
      'user_role', 
      NEW.user_id::text,
      jsonb_build_object('role', NEW.role, 'user_id', NEW.user_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.log_admin_action(
      'Changed role from ' || OLD.role::text || ' to ' || NEW.role::text,
      'user_role',
      NEW.user_id::text, 
      jsonb_build_object('old_role', OLD.role, 'new_role', NEW.role, 'user_id', NEW.user_id)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.log_admin_action(
      'Removed role: ' || OLD.role::text,
      'user_role',
      OLD.user_id::text,
      jsonb_build_object('role', OLD.role, 'user_id', OLD.user_id)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for role change logging
DROP TRIGGER IF EXISTS log_user_role_changes ON public.user_roles;
CREATE TRIGGER log_user_role_changes
  AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.log_role_change();

-- 3. Enhance messages table security
DROP POLICY IF EXISTS "Users can manage their own messages" ON public.messages;

-- Users can only read messages they're part of
CREATE POLICY "Users can read own messages" ON public.messages
FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Users can only send messages as themselves
CREATE POLICY "Users can send messages" ON public.messages  
FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Users can only update their own sent messages (mark as read, etc)
CREATE POLICY "Users can update own sent messages" ON public.messages
FOR UPDATE USING (auth.uid() = sender_id);

-- Admins can manage all messages
CREATE POLICY "Admins can manage all messages" ON public.messages
FOR ALL USING (is_admin(auth.uid()));

-- 4. Enhanced audit logging function with user validation
CREATE OR REPLACE FUNCTION public.log_admin_action_secure(
  action_text text, 
  target_type_param text, 
  target_id_param text DEFAULT NULL::text, 
  details_param jsonb DEFAULT NULL::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Verify the user is actually an admin
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: Admin role required for audit logging';
  END IF;
  
  INSERT INTO public.audit_logs (admin_user_id, action, target_type, target_id, details)
  VALUES (auth.uid(), action_text, target_type_param, target_id_param, details_param);
END;
$$;

-- 5. Create session management table for enhanced security
CREATE TABLE IF NOT EXISTS public.admin_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  session_token text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  expires_at timestamp with time zone NOT NULL,
  is_active boolean DEFAULT true,
  ip_address inet,
  user_agent text
);

-- Enable RLS on admin sessions
ALTER TABLE public.admin_sessions ENABLE ROW LEVEL SECURITY;

-- Only admins can manage admin sessions  
CREATE POLICY "Admins can manage admin sessions" ON public.admin_sessions
FOR ALL USING (is_admin(auth.uid()));

-- 6. Add rate limiting table
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier text NOT NULL, -- IP address or user ID
  action text NOT NULL, -- action being rate limited
  attempts integer DEFAULT 1,
  window_start timestamp with time zone DEFAULT now(),
  blocked_until timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create unique index for rate limiting lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_rate_limits_identifier_action 
ON public.rate_limits(identifier, action);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits (no user access)
CREATE POLICY "System only rate limits" ON public.rate_limits
FOR ALL USING (false);