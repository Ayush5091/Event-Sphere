import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

// Server-side client (for API routes / server components that don't need auth cookies)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Browser client (for client components that need auth session via cookies)
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}
