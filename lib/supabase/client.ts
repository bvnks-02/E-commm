// lib/supabase/client.ts
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

export const isSupabaseConfigured = 
  process.env.NEXT_PUBLIC_SUPABASE_URL && 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

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

export type Product = {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category: string
  created_at: string
  updated_at: string
}

export type Order = {
  id: string
  product_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_region: string
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  created_at: string
  updated_at: string
  product_name?: string
  product_price?: number
}
