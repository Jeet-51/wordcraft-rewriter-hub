
import { supabase } from "@/integrations/supabase/client";
import { ContactMessage } from "./types";

export const createContactMessage = async (name: string, email: string, message: string, userId?: string) => {
  if (!name || !email || !message) {
    throw new Error("Name, email, and message are required fields");
  }
  
  console.log("Creating contact message:", { name, email, message: message.substring(0, 20) + "..." });
  
  try {
    // Create payload without user_id for anonymous submissions
    const payload = { 
      name,
      email,
      message,
    };
    
    // Only add user_id if it exists and is a valid string to avoid RLS issues
    if (userId && typeof userId === 'string') {
      Object.assign(payload, { user_id: userId });
    }
    
    // Using the public endpoint that's designed for anonymous contact submissions
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([payload])
      .select();

    if (error) {
      console.error("Error creating contact message:", error);
      throw error;
    }
    
    console.log("Contact message created successfully:", data);
    return data[0] as ContactMessage;
  } catch (error) {
    console.error("Failed to create contact message:", error);
    throw error;
  }
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
