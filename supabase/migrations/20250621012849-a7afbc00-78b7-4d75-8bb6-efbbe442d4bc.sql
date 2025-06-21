
-- Fix the search_path security warnings for database functions
-- Add SET search_path TO 'public' to all functions that are missing it

CREATE OR REPLACE FUNCTION public.update_impact_metrics()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Update total posts created (never decreases)
  UPDATE public.impact_metrics 
  SET 
    metric_value = (SELECT COUNT(*) FROM public.posts),
    updated_at = now()
  WHERE metric_key = 'total_posts_created';
  
  -- Update NGOs listed
  UPDATE public.impact_metrics 
  SET 
    metric_value = (SELECT COUNT(*) FROM public.nonprofits WHERE status = 'active'),
    updated_at = now()
  WHERE metric_key = 'ngos_listed';
  
  -- Update active cities (cities with at least one user or post)
  UPDATE public.covered_locations 
  SET 
    user_count = (SELECT COUNT(*) FROM public.profiles WHERE location ILIKE city_name || '%'),
    post_count = (SELECT COUNT(*) FROM public.posts WHERE location ILIKE city_name || '%'),
    updated_at = now();
    
  UPDATE public.impact_metrics 
  SET 
    metric_value = (SELECT COUNT(*) FROM public.covered_locations WHERE user_count > 0 OR post_count > 0),
    updated_at = now()
  WHERE metric_key = 'active_cities';
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_update_post_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only update on INSERT (so total never decreases)
  IF TG_OP = 'INSERT' THEN
    UPDATE public.impact_metrics 
    SET 
      metric_value = metric_value + 1,
      updated_at = now()
    WHERE metric_key = 'total_posts_created';
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.trigger_update_nonprofit_metrics()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.impact_metrics 
  SET 
    metric_value = (SELECT COUNT(*) FROM public.nonprofits WHERE status = 'active'),
    updated_at = now()
  WHERE metric_key = 'ngos_listed';
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_impact_photos_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
