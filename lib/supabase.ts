// Impor fungsi createClient dari utils untuk mengikuti best practice Next.js
import { createClient } from "@/utils/supabase/client";

// Membuat instance klien Supabase untuk digunakan di seluruh aplikasi (client-side)
export const supabase = createClient();
