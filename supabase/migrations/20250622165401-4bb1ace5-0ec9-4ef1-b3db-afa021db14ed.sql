
-- Create storage bucket for about us images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('about-images', 'about-images', true);

-- Create storage policies for about images bucket
CREATE POLICY "Anyone can view about images" ON storage.objects
FOR SELECT USING (bucket_id = 'about-images');

CREATE POLICY "Admins can upload about images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'about-images' AND 
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can update about images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'about-images' AND 
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can delete about images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'about-images' AND 
  public.is_admin(auth.uid())
);

-- Create table to store about images metadata
CREATE TABLE public.about_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT NOT NULL, -- 'our_mission' or 'our_story'
  image_url TEXT NOT NULL,
  alt_text TEXT,
  caption TEXT,
  order_position INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

-- Enable RLS on about_images table
ALTER TABLE public.about_images ENABLE ROW LEVEL SECURITY;

-- Create policies for about_images table
CREATE POLICY "Anyone can view about images" ON public.about_images
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage about images" ON public.about_images
FOR ALL USING (public.is_admin(auth.uid()));

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_about_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_about_images_updated_at
  BEFORE UPDATE ON public.about_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_about_images_updated_at();
