-- Create table for job opportunities
CREATE TABLE public.job_opportunities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  location TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  requirements TEXT,
  benefits TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- Enable RLS
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active job opportunities" 
ON public.job_opportunities 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage job opportunities" 
ON public.job_opportunities 
FOR ALL 
USING (is_admin(auth.uid()));

-- Create trigger for automatic timestamp updates
CREATE OR REPLACE FUNCTION public.update_job_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.updated_by = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_job_opportunities_updated_at
BEFORE UPDATE ON public.job_opportunities
FOR EACH ROW
EXECUTE FUNCTION public.update_job_opportunities_updated_at();