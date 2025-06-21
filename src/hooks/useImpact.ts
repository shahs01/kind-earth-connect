
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ImpactMetric {
  id: string;
  metric_key: string;
  metric_value: number;
  display_name: string;
  description: string | null;
  updated_at: string;
}

export interface ImpactPhoto {
  id: string;
  title: string;
  description: string | null;
  photo_url: string;
  alt_text: string | null;
  order_position: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export interface CoveredLocation {
  id: string;
  city_name: string;
  region: string;
  is_active: boolean;
  user_count: number;
  post_count: number;
  coordinates: any;
  created_at: string;
  updated_at: string;
}

const useImpactMetrics = () => {
  return useQuery({
    queryKey: ['impact-metrics'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_metrics')
        .select('*')
        .order('metric_key');
      
      if (error) throw error;
      return data as ImpactMetric[];
    },
  });
};

const useImpactPhotos = () => {
  return useQuery({
    queryKey: ['impact-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('impact_photos')
        .select('*')
        .eq('is_active', true)
        .order('order_position');
      
      if (error) throw error;
      return data as ImpactPhoto[];
    },
  });
};

const useCoveredLocations = () => {
  return useQuery({
    queryKey: ['covered-locations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('covered_locations')
        .select('*')
        .eq('is_active', true)
        .order('city_name');
      
      if (error) throw error;
      return data as CoveredLocation[];
    },
  });
};

export { useImpactMetrics, useImpactPhotos, useCoveredLocations };
