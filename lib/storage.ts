// lib/storage.ts
import { supabase, isSupabaseConfigured, type Product, type Order } from './client'

// Cache configuration
const cache = new Map<string, { data: any, timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

// Products
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) return []
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return []
  }
}

export const getProduct = async (id: string): Promise<Product | null> => {
  if (!isSupabaseConfigured) return null
  
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error(`Failed to fetch product ${id}:`, error)
    return null
  }
}

export const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> => {
  if (!isSupabaseConfigured) return null
  
  try {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to create product:', error)
    return null
  }
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  
  try {
    const { error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Failed to update product ${id}:`, error)
    return false
  }
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Failed to delete product ${id}:`, error)
    return false
  }
}

// Orders
export const getOrders = async (): Promise<Order[]> => {
  if (!isSupabaseConfigured) return []
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, products(name, price)')
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return data?.map(order => ({
      ...order,
      product_name: order.products?.name,
      product_price: order.products?.price
    })) || []
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return []
  }
}

export const addOrder = async (order: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> => {
  if (!isSupabaseConfigured) return null
  
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...order,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to create order:', error)
    return null
  }
}

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  
  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Failed to update order ${id}:`, error)
    return false
  }
}

export const deleteOrder = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false
  
  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  } catch (error) {
    console.error(`Failed to delete order ${id}:`, error)
    return false
  }
}
