-- Fix function search path security warnings

-- Update log_role_change function to have secure search_path
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Update update_job_opportunities_updated_at function to have secure search_path
CREATE OR REPLACE FUNCTION public.update_job_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO '';