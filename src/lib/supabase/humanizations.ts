
import { supabase } from "@/integrations/supabase/client";
import { Humanization } from "./types";

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
