
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Nonprofit {
  id: string;
  name: string;
  description: string;
  category: string;
  location: string;
  website?: string;
  phone_number?: string;
  email?: string;
  logo?: string;
  verified: boolean;
  status: 'active' | 'archived' | 'draft';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export function useNonprofits() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchNonprofits = async (includeAll = false): Promise<Nonprofit[]> => {
    try {
      setLoading(true);
      let query = supabase
        .from('nonprofits')
        .select('*')
        .order('created_at', { ascending: false });

      if (!includeAll) {
        query = query.eq('status', 'active');
      }

      const { data, error } = await query;

      if (error) throw error;

      return data as Nonprofit[];
    } catch (error: any) {
      toast({
        title: "Error fetching nonprofits",
        description: error.message,
        variant: "destructive",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createNonprofit = async (nonprofit: Omit<Nonprofit, 'id' | 'created_at' | 'updated_at' | 'created_by'>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('nonprofits')
        .insert({
          ...nonprofit,
          created_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: "Nonprofit created",
        description: "The nonprofit has been successfully created.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error creating nonprofit",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateNonprofit = async (id: string, updates: Partial<Nonprofit>): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('nonprofits')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Nonprofit updated",
        description: "The nonprofit has been successfully updated.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error updating nonprofit",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteNonprofit = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from('nonprofits')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Nonprofit deleted",
        description: "The nonprofit has been successfully deleted.",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Error deleting nonprofit",
        description: error.message,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    fetchNonprofits,
    createNonprofit,
    updateNonprofit,
    deleteNonprofit
  };
}
