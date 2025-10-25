// supabase.js
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const SUPABASE_URL = "https://TU_PROYECTO.supabase.co"; // 🔹 cambia esto
const SUPABASE_ANON_KEY = "TU_ANON_KEY"; // 🔹 cambia esto

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
