
-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Admin full access" ON public.posts;
DROP POLICY IF EXISTS "Authenticated users can view posts" ON public.posts;
DROP POLICY IF EXISTS "Users can create their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON public.posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON public.posts;

-- Enable RLS on the posts table if not already enabled
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Allow admin users to perform any action on posts
CREATE POLICY "Admin full access" ON public.posts
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Allow authenticated users to view all posts
CREATE POLICY "Authenticated users can view posts" ON public.posts
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Allow users to insert their own posts
CREATE POLICY "Users can create their own posts" ON public.posts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own posts
CREATE POLICY "Users can update their own posts" ON public.posts
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own posts
CREATE POLICY "Users can delete their own posts" ON public.posts
  FOR DELETE
  USING (auth.uid() = user_id);
