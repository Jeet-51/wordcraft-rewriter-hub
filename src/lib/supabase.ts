
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
