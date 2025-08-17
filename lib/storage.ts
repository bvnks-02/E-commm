import { supabase, isSupabaseConfigured } from './supabase/client'

export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  image_url?: string // For Supabase compatibility
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  productId: string
  product_id?: string // For Supabase compatibility
  customerName: string
  customer_name?: string // For Supabase compatibility
  customerPhone: string
  customer_phone?: string // For Supabase compatibility
  customerAddress: string
  customer_address?: string // For Supabase compatibility
  customerRegion: string
  customer_region?: string // For Supabase compatibility
  productName?: string
  product_name?: string // For Supabase compatibility
  productPrice?: number
  product_price?: number // For Supabase compatibility
  status: "pending" | "confirmed"
  created_at?: string
  updated_at?: string
}

// Helper function to normalize product data
const normalizeProduct = (product: any): Product => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: Number(product.price),
  imageUrl: product.image_url || product.imageUrl || '',
  created_at: product.created_at,
  updated_at: product.updated_at,
})

// Helper function to normalize order data
const normalizeOrder = (order: any): Order => ({
  id: order.id,
  productId: order.product_id || order.productId,
  customerName: order.customer_name || order.customerName,
  customerPhone: order.customer_phone || order.customerPhone,
  customerAddress: order.customer_address || order.customerAddress,
  customerRegion: order.customer_region || order.customerRegion,
  productName: order.product_name || order.productName,
  productPrice: Number(order.product_price || order.productPrice || 0),
  status: order.status,
  created_at: order.created_at,
  updated_at: order.updated_at,
})

// Product storage functions
export const getProducts = async (): Promise<Product[]> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    if (typeof window === "undefined") return []
    const products = localStorage.getItem("products")
    return products ? JSON.parse(products).map(normalizeProduct) : []
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching products:', error)
      return []
    }

    return (data || []).map(normalizeProduct)
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export const saveProducts = (products: Product[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("products", JSON.stringify(products))
}

export const addProduct = async (product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product | null> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const products = await getProducts()
    const newProduct: Product = {
      ...product,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    products.unshift(newProduct)
    saveProducts(products)
    return newProduct
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .insert([{
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.imageUrl,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding product:', error)
      return null
    }

    return normalizeProduct(data)
  } catch (error) {
    console.error('Error adding product:', error)
    return null
  }
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const products = await getProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return false

    products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() }
    saveProducts(products)
    return true
  }

  try {
    const updateData: any = {}
    if (updates.name) updateData.name = updates.name
    if (updates.description) updateData.description = updates.description
    if (updates.price !== undefined) updateData.price = updates.price
    if (updates.imageUrl !== undefined) updateData.image_url = updates.imageUrl

    const { error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)

    if (error) {
      console.error('Error updating product:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating product:', error)
    return false
  }
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const products = await getProducts()
    const filteredProducts = products.filter((p) => p.id !== id)
    saveProducts(filteredProducts)
    return true
  }

  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting product:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    return false
  }
}

// Order storage functions
export const getOrders = async (): Promise<Order[]> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    if (typeof window === "undefined") return []
    const orders = localStorage.getItem("orders")
    return orders ? JSON.parse(orders).map(normalizeOrder) : []
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching orders:', error)
      return []
    }

    return (data || []).map(normalizeOrder)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return []
  }
}

export const saveOrders = (orders: Order[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("orders", JSON.stringify(orders))
}

export const addOrder = async (order: Omit<Order, "id" | "created_at" | "updated_at">): Promise<Order | null> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const orders = await getOrders()
    const newOrder: Order = {
      ...order,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    orders.unshift(newOrder)
    saveOrders(orders)
    return newOrder
  }

  try {
    // Get product details for the order
    const { data: product } = await supabase
      .from('products')
      .select('name, price')
      .eq('id', order.productId)
      .single()

    const { data, error } = await supabase
      .from('orders')
      .insert([{
        customer_name: order.customerName,
        customer_phone: order.customerPhone,
        customer_address: order.customerAddress,
        customer_region: order.customerRegion,
        product_id: order.productId,
        product_name: product?.name || '',
        product_price: product?.price || 0,
        status: order.status,
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding order:', error)
      return null
    }

    return normalizeOrder(data)
  } catch (error) {
    console.error('Error adding order:', error)
    return null
  }
}

export const updateOrderStatus = async (id: string, status: Order["status"]): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const orders = await getOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) return false

    orders[index] = { ...orders[index], status, updated_at: new Date().toISOString() }
    saveOrders(orders)
    return true
  }

  try {
    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating order status:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error updating order status:', error)
    return false
  }
}

export const deleteOrder = async (id: string): Promise<boolean> => {
  if (!isSupabaseConfigured) {
    // Fallback to localStorage
    const orders = await getOrders()
    const filteredOrders = orders.filter((o) => o.id !== id)
    saveOrders(filteredOrders)
    return true
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting order:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting order:', error)
    return false
  }
}