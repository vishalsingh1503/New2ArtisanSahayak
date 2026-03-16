export enum Language {
  HINDI = "Hindi",
  PUNJABI = "Punjabi",
  MARATHI = "Marathi",
  BENGALI = "Bengali",
  TAMIL = "Tamil",
  TELUGU = "Telugu",
  GUJARATI = "Gujarati",
  ENGLISH = "English"
}

export interface User {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  location: string;
  language: Language;
  craft_type?: string;
  token?: string;
  bankDetails?: BankDetails;
  verificationStatus?: 'pending' | 'verified' | 'unlinked';
}

export interface Product {
  id: number;
  owner_id: number;
  name: string;
  story: string;
  description: string;
  price: number;
  photo_url: string;
  category: string;
  views: number;
  cod_enabled: boolean;
  location: string;
  stock: number;
  is_active: boolean;
}

export interface BankDetails {
  id?: number;
  user_id: number;
  account_holder: string;
  bank_name: string;
  ifsc: string;
  account_number: string;
}

export interface IntentResponse {
  intent: string;
  response: string;
  data?: any;
}

export interface CommunityPost {
  id: number;
  user_id: number;
  username: string;
  content: string;
  image_url: string;
  likes: number;
  timestamp: string;
}

export interface PriceSuggestion {
  suggestedPrice: number;
  reasoning: string;
  marketRange: { min: number; max: number };
}

export interface ProductAnalysis {
  craftType: string;
  region: string;
  materials: string[];
  category: string;
  title: string;
  description: string;
  craftStory: string;
  seoKeywords: string;
  hashtags: string[];
  suggestedPrice: {
    min: number;
    max: number;
    reasoning: string;
  };
}

export interface MarketTrends {
  insights: string[];
  seasonalDemand: string;
  trendingCategories: {
    name: string;
    popularity: number;
  }[];
}
