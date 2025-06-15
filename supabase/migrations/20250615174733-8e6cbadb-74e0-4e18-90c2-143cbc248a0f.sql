
-- Drop the existing foreign key constraint if it exists
ALTER TABLE public.posts
DROP CONSTRAINT IF EXISTS posts_user_id_fkey;

-- Re-create the foreign key constraint
ALTER TABLE public.posts
ADD CONSTRAINT posts_user_id_fkey
FOREIGN KEY (user_id) REFERENCES public.profiles(id)
ON DELETE CASCADE;
