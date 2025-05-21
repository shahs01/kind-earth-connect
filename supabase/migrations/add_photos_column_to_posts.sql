
-- Add a column to store photo URLs in the posts table
ALTER TABLE public.posts
ADD COLUMN photos TEXT[] DEFAULT '{}'::TEXT[];
