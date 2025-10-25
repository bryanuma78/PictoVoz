// supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://kicxfzxzubvpivzwlfsy.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtpY3hmenh6dWJ2cGl2endsZnN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjEzMzg2NjcsImV4cCI6MjA3NjkxNDY2N30.UGpuS698M8OhN5tMWEDFHjXtcuj6LiyL_pOYv_N8z5I";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
