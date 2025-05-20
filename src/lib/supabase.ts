
import { supabase } from "@/integrations/supabase/client";

// Types for our Supabase tables
export type Profile = {
  id: string;
  username: string;
  credits_total: number;
  credits_used: number;
  plan: 'free' | 'pro' | 'enterprise';
  created_at: string;
  updated_at: string;
};

export type Humanization = {
  id: string;
  user_id: string;
  original_text: string;
  humanized_text: string;
  created_at: string;
};

export type ContactMessage = {
  id: string;
  user_id: string | null;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export type PaymentRecord = {
  id: string;
  user_id: string;
  plan_id: string;
  plan_name: string;
  amount: string;
  created_at: string;
};

// Helper functions to interact with Supabase
export const getProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data[0] as Profile;
};

export const createHumanization = async (userId: string, originalText: string, humanizedText: string) => {
  const { data, error } = await supabase
    .from('humanizations')
    .insert([
      { user_id: userId, original_text: originalText, humanized_text: humanizedText }
    ])
    .select();

  if (error) throw error;
  return data[0] as Humanization;
};

export const getHumanizations = async (userId: string) => {
  const { data, error } = await supabase
    .from('humanizations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Humanization[];
};

export const uploadDocument = async (userId: string, file: File) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error: storageError } = await supabase.storage
    .from('documents')
    .upload(fileName, file);
  
  if (storageError) throw storageError;
  
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};

// Updated function for contact messages to fix permission issues
export const createContactMessage = async (name: string, email: string, message: string, userId?: string) => {
  // Create the contact message without referencing auth.users
  const { data, error } = await supabase
    .from('contact_messages')
    .insert([
      { 
        name,
        email,
        message,
        user_id: userId || null 
      }
    ])
    .select();

  if (error) throw error;
  return data[0] as ContactMessage;
};

export const getContactMessages = async (userId: string) => {
  const { data, error } = await supabase
    .from('contact_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as ContactMessage[];
};

// New functions for payment history
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
