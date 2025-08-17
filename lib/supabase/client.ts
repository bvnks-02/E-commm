import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client for Client Components
export const supabase = createClientComponentClient()

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_region: string
  product_id: string
  product_name: string
  product_price: number
  status: "pending" | "confirmed"
  created_at: string
  updated_at: string
}
