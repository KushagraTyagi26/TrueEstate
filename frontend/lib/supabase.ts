import { createBrowserClient } from '@supabase/ssr'

console.log(
  "Supabase URL loaded:",
  !!process.env.NEXT_PUBLIC_SUPABASE_URL
)

console.log(
  "Supabase key loaded:",
  !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
)
