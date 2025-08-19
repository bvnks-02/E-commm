// lib/storage.ts
import { supabase, safeSupabase, isSupabaseConfigured } from './supabase/client'

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

export const getOrders = async (): Promise<Order[]> => {
  if (!isSupabaseConfigured) return []

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch orders:', error)
    return []
  }
}

export const addOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at'>): Promise<Order | null> => {
  if (!isSupabaseConfigured) return null

  try {
    const { data, error } = await supabase
      .from('orders')
      .insert({
        ...orderData,
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

export const updateOrderStatus = async (orderId: string, status: Order['status']): Promise<boolean> => {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to update order:', error)
    return false
  }
}

export const deleteOrder = async (orderId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to delete order:', error)
    return false
  }
}

// Add similar functions for product operations
export const addProduct = async (productData: Omit<Product, 'id' | 'created_at' | 'updated_at'>): Promise<Product | null> => {
  if (!isSupabaseConfigured) return null

  try {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Failed to add product:', error)
    return null
  }
}

export const updateProduct = async (productId: string, productData: Partial<Product>): Promise<boolean> => {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', productId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to update product:', error)
    return false
  }
}

export const deleteProduct = async (productId: string): Promise<boolean> => {
  if (!isSupabaseConfigured) return false

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to delete product:', error)
    return false
  }
}
