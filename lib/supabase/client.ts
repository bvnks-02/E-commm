import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

// Check if Supabase environment variables are available
export const isSupabaseConfigured =
  typeof process.env.NEXT_PUBLIC_SUPABASE_URL === "string" &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.length > 0 &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "string" &&
  typeof process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.length > 0

// Create a singleton instance of the Supabase client
export const supabase = createClientComponentClient({
  options: {
    global: {
      // Enable faster queries by reducing round trips
      fetch: (input, init) => fetch(input, {
        ...init,
        cache: 'force-cache', // Cache GET requests
        next: { revalidate: 60 } // Revalidate every 60 seconds
      })
    }
  }
})

// Rate-limited and retry wrapper for Supabase operations
export const safeSupabase = {
  query: async <T>(query: Promise<{ data: T | null; error: any }>) => {
    try {
      const { data, error } = await query
      if (error) throw error
      return data
    } catch (error) {
      console.error('Supabase query error:', error)
      throw error
    }
  },
  
  mutate: async <T>(query: Promise<{ data: T | null; error: any }>) => {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data, error } = await query
        if (error) throw error
        return data
      } catch (error) {
        if (attempt === 3) throw error
        await new Promise(resolve => setTimeout(resolve, 300 * attempt))
      }
    }
    throw new Error('Max retries reached')
  }
}

export type Product = {
  id: string
  name: string
  price: number
  description: string
  image_url: string
  category: string
  stock_quantity: number
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
