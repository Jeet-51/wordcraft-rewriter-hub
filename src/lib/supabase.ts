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

export type DocumentInfo = {
  id: string;
  file_name: string;
  file_url: string;
  file_type: string;
  extracted_text?: string;
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
  if (!userId) {
    throw new Error("User ID is required for document uploads");
  }
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
  
  try {
    console.log("Starting file upload to documents bucket");
    
    // Now upload the file
    const { error: storageError, data } = await supabase.storage
      .from('documents')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (storageError) {
      console.error("Storage error during upload:", storageError);
      throw storageError;
    }
    
    console.log("Upload successful, getting public URL");
    
    const { data: urlData } = supabase.storage
      .from('documents')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error with document storage:", error);
    throw error;
  }
};

// Function to extract text from document
export const extractTextFromDocument = async (fileUrl: string, fileType: string): Promise<string> => {
  // In a real implementation, this would call a document processing service or API
  // For now, we'll simulate text extraction with a placeholder
  console.log(`Extracting text from document: ${fileUrl}`);
  
  // Simple simulation of text extraction
  // This would be replaced with actual API calls to services like DocumentAI, Azure Form Recognizer, etc.
  return new Promise((resolve) => {
    setTimeout(() => {
      const extractedText = `This is extracted text from the document at ${fileUrl}.\n\nThe document appears to contain several paragraphs of content that would typically be processed by an AI document understanding system. In a real implementation, we would extract the actual text content from the ${fileType} document.\n\nFor demonstration purposes, this is placeholder text that simulates what extracted content might look like. The actual implementation would connect to document processing APIs to extract real text content from the uploaded files.`;
      
      resolve(extractedText);
    }, 1500); // Simulate processing time
  });
};

// Updated function for contact messages to ensure proper format and error handling
export const createContactMessage = async (name: string, email: string, message: string, userId?: string) => {
  if (!name || !email || !message) {
    throw new Error("Name, email, and message are required fields");
  }
  
  console.log("Creating contact message:", { name, email, message: message.substring(0, 20) + "...", userId });
  
  try {
    const { data, error } = await supabase
      .from('contact_messages')
      .insert([{ 
        name,
        email,
        message,
        user_id: userId || null 
      }])
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
