
import { supabase } from "@/integrations/supabase/client";
import { PaymentRecord } from "./types";

export const createPaymentRecord = async (userId: string, planId: string, planName: string, amount: string) => {
  const { data, error } = await supabase
    .from('payment_history')
    .insert([{
      user_id: userId,
      plan_id: planId,
      plan_name: planName,
      amount
    }])
    .select();

  if (error) throw error;
  return data[0] as PaymentRecord;
};

export const getPaymentHistory = async (userId: string) => {
  const { data, error } = await supabase
    .from('payment_history')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as PaymentRecord[];
};
