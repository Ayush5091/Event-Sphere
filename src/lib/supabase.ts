import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Public client — uses publishable key, respects RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;
// Server-side client (for API routes / server components that don't need auth cookies)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Server-side admin client — bypasses RLS (use only in API routes/server components)
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
export const supabaseAdmin = serviceRoleKey
    ? createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
    })
    : supabase; // Fallback to public client if no service role key

// Browser client (for client components that need auth session via cookies)
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
