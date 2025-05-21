
-- Function to delete a user and their related data
CREATE OR REPLACE FUNCTION public.delete_user()
RETURNS void AS $$
DECLARE
  user_id UUID;
BEGIN
  -- Get the current user's ID
  user_id := auth.uid();
  
  -- Delete the user's reviews
  DELETE FROM public.reviews WHERE from_user_id = user_id OR to_user_id = user_id;
  
  -- Delete the user's posts
  DELETE FROM public.posts WHERE user_id = user_id;
  
  -- Delete the user's profile
  DELETE FROM public.profiles WHERE id = user_id;
  
  -- Finally delete the user from auth.users
  -- This is handled by the cascade delete from the profiles table
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
