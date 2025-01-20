import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xubhhxpatppnttbjmrzk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1YmhoeHBhdHBwbnR0YmptcnprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzcyMzUyNTMsImV4cCI6MjA1MjgxMTI1M30.aV01rNjH-IVM7iPmuApWHKUfLFpQt2W8n-rZ7M8w5FI";

export const supabase = createClient<Database>(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
);