// ✅ /pages/Login/supabase.js
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// 🔹 Configuración de tu proyecto Supabase
const SUPABASE_URL = 'https://yxbxfdwotdzuryicjyxs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4YnhmZHdvdGR6dXJ5aWNqeXhzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0MDkyOTMsImV4cCI6MjA3Njk4NTI5M30.9dli0P2wfZhQYjxtA-7vThfKnbaWuBQLR41bH1Ju2JU';

// 🔹 Crear cliente Supabase
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
