// lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const supabase = createClientComponentClient({
  options: {
    db: {
      schema: 'public'
    },
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
})

// Add this helper function
export const getPublicUrl = (bucket: string, path: string) => {
  const { data } = supabase
    .storage
    .from(bucket)
    .getPublicUrl(path)
  return data.publicUrl
}
