import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Bill = Database['public']['Tables']['bills']['Row'];
type BillInsert = Database['public']['Tables']['bills']['Insert'];
type BillUpdate = Database['public']['Tables']['bills']['Update'];

export const useBills = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBills = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('bills')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      setBills(data || []);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBill = async (billData: Omit<BillInsert, 'user_id'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('bills')
        .insert({ ...billData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setBills(prev => [...prev, data]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding bill:', error);
      return { data: null, error };
    }
  };

  const updateBill = async (id: string, updates: BillUpdate) => {
    try {
      const { data, error } = await supabase
        .from('bills')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setBills(prev => prev.map(bill => bill.id === id ? data : bill));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating bill:', error);
      return { data: null, error };
    }
  };

  const deleteBill = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bills')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setBills(prev => prev.filter(bill => bill.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting bill:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchBills();
  }, [user]);

  return {
    bills,
    loading,
    addBill,
    updateBill,
    deleteBill,
    refreshBills: fetchBills,
  };
};