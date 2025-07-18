import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://hzrljopjhghhabwohmop.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6cmxqb3BqaGdoaGFid29obW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODEyMjQsImV4cCI6MjA1OTI1NzIyNH0.5uZ0y4Wr94HogVMFxiICNRm3ECKEt9tUxyXB8WvVkfU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
