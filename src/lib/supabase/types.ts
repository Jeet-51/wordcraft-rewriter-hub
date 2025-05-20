
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
