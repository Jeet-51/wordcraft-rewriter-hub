
import { createClient } from '@supabase/supabase-js';

// Get Supabase credentials from environment variables or use placeholder values for development
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder-supabase-url.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

// Initialize the Supabase client
export const supabase = createClient(supabaseUrl, supabaseKey);

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
  // For development when Supabase isn't fully connected, return mock data
  if (supabaseUrl.includes('placeholder')) {
    return {
      id: userId,
      username: 'testuser',
      credits_total: 10,
      credits_used: 2,
      plan: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as Profile;
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  // For development when Supabase isn't fully connected, return mock data
  if (supabaseUrl.includes('placeholder')) {
    return {
      ...updates,
      id: userId,
      username: updates.username || 'testuser',
      credits_total: updates.credits_total || 10,
      credits_used: updates.credits_used || 0,
      plan: updates.plan || 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Profile;
  }

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();

  if (error) throw error;
  return data[0] as Profile;
};

export const createHumanization = async (userId: string, originalText: string, humanizedText: string) => {
  // For development when Supabase isn't fully connected, return mock data
  if (supabaseUrl.includes('placeholder')) {
    return {
      id: `mock-${Date.now()}`,
      user_id: userId,
      original_text: originalText,
      humanized_text: humanizedText,
      created_at: new Date().toISOString(),
    } as Humanization;
  }

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
  // For development when Supabase isn't fully connected, return mock data
  if (supabaseUrl.includes('placeholder')) {
    return [
      {
        id: 'mock-1',
        user_id: userId,
        original_text: 'This is an AI-generated text example.',
        humanized_text: 'This is how a human might write the same thing.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'mock-2',
        user_id: userId,
        original_text: 'Another example of machine-generated content.',
        humanized_text: 'Here\'s a more natural-sounding version.',
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      }
    ] as Humanization[];
  }

  const { data, error } = await supabase
    .from('humanizations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Humanization[];
};

export const uploadDocument = async (userId: string, file: File) => {
  // For development when Supabase isn't fully connected, return mock URL
  if (supabaseUrl.includes('placeholder')) {
    return `https://mock-storage.com/${userId}/${file.name}`;
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  const { error } = await supabase.storage
    .from('documents')
    .upload(fileName, file);
  
  if (error) throw error;
  
  const { data } = supabase.storage
    .from('documents')
    .getPublicUrl(fileName);
  
  return data.publicUrl;
};
