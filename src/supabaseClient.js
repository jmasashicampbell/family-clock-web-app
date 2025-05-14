import { createClient } from '@supabase/supabase-js';

// Hardcoded values from .env file since environment variables aren't loading correctly
const supabaseUrl = 'https://evmtuvgoonqfpdohecwf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2bXR1dmdvb25xZnBkb2hlY3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxOTQzOTAsImV4cCI6MjA2Mjc3MDM5MH0.b7pBkdU5sTDvJ-04jPSfjq1sZt0n_2IHlHLu1x0Xca0';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
