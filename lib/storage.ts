import { supabase, safeSupabase, isSupabaseConfigured } from './supabase/client'

// Simple in-memory cache with TTL
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Cache management functions
const getCache = <T>(key: string): T | null => {
  const entry = cache.get(key)
  if (!entry) return null
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }
  return entry.data
}

const setCache = (key: string, data: any) => {
  cache.set(key, { data, timestamp: Date.now() })
}

const clearRelatedCache = (prefix: string) => {
  Array.from(cache.keys())
    .filter(key => key.startsWith(prefix))
    .forEach(key => cache.delete(key))
}

// Product operations
export const getProducts = async (page = 1, limit = 10): Promise<Product[]> => {
  const cacheKey = `products:${page}:${limit}`
  const cached = getCache<Product[]>(cacheKey)
  if (cached) return cached

  if (isSupabaseConfigured) {
    try {
      const data = await safeSupabase.query<Product[]>(
        supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .range((page - 1) * limit, page * limit - 1)
      )
      if (data) {
        setCache(cacheKey, data)
        return data
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }

  return []
}

export const getProduct = async (id: string): Promise<Product | null> => {
  const cacheKey = `product:${id}`
  const cached = getCache<Product>(cacheKey)
  if (cached) return cached

  if (isSupabaseConfigured) {
    try {
      const data = await safeSupabase.query<Product>(
        supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
      )
      if (data) {
        setCache(cacheKey, data)
        return data
      }
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error)
    }
  }

  return null
}

export const createProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> => {
  if (isSupabaseConfigured) {
    try {
      const data = await safeSupabase.mutate<Product>(
        supabase
          .from('products')
          .insert(product)
          .select()
          .single()
      )
      if (data) {
        clearRelatedCache('products:')
        return data
      }
    } catch (error) {
      console.error('Failed to create product:', error)
    }
  }
  return null
}

// Similar optimized implementations for:
// updateProduct, deleteProduct, adjustStockQuantity

// Order operations
export const getOrders = async (page = 1, limit = 10, status?: string): Promise<Order[]> => {
  const cacheKey = `orders:${page}:${limit}:${status || 'all'}`
  const cached = getCache<Order[]>(cacheKey)
  if (cached) return cached

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('orders')
        .select('*, products(name, price)')
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (status) {
        query = query.eq('status', status)
      }

      const data = await safeSupabase.query<Order[]>(query)
      if (data) {
        // Enrich orders with product info
        const enriched = data.map(order => ({
          ...order,
          product_name: order.products?.name,
          product_price: order.products?.price
        }))
        setCache(cacheKey, enriched)
        return enriched
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    }
  }

  return []
}

export const createOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> => {
  if (isSupabaseConfigured) {
    try {
      // First verify product exists and has stock
      const product = await getProduct(order.product_id)
      if (!product || product.stock_quantity <= 0) {
        throw new Error('Product not available')
      }

      const data = await safeSupabase.mutate<Order>(
        supabase
          .from('orders')
          .insert({
            ...order,
            status: 'pending'
          })
          .select()
          .single()
      )

      if (data) {
        // Update product stock
        await safeSupabase.mutate(
          supabase
            .from('products')
            .update({ stock_quantity: product.stock_quantity - 1 })
            .eq('id', order.product_id)
        )

        clearRelatedCache('orders:')
        clearRelatedCache(`product:${order.product_id}`)
        return data
      }
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }
  return null
}

// Similar optimized implementations for:
// updateOrderStatus, cancelOrder, getOrder
