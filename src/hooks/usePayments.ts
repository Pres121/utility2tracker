import { useState, useEffect } from 'react';
import { supabase, Database } from '../lib/supabase';
import { useAuth } from './useAuth';

type Payment = Database['public']['Tables']['payments']['Row'];
type PaymentInsert = Database['public']['Tables']['payments']['Insert'];
type PaymentUpdate = Database['public']['Tables']['payments']['Update'];

export const usePayments = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPayments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', user.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setPayments(data || []);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPayment = async (paymentData: Omit<PaymentInsert, 'user_id'>) => {
    if (!user) return { data: null, error: { message: 'User not authenticated' } };

    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({ ...paymentData, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setPayments(prev => [data, ...prev]);
      return { data, error: null };
    } catch (error) {
      console.error('Error adding payment:', error);
      return { data: null, error };
    }
  };

  const updatePayment = async (id: string, updates: PaymentUpdate) => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setPayments(prev => prev.map(payment => payment.id === id ? data : payment));
      return { data, error: null };
    } catch (error) {
      console.error('Error updating payment:', error);
      return { data: null, error };
    }
  };

  const deletePayment = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPayments(prev => prev.filter(payment => payment.id !== id));
      return { error: null };
    } catch (error) {
      console.error('Error deleting payment:', error);
      return { error };
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [user]);

  return {
    payments,
    loading,
    addPayment,
    updatePayment,
    deletePayment,
    refreshPayments: fetchPayments,
  };
};