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
  createdAt: string // Add this for consistency
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
  createdAt: order.created_at || order.createdAt || new Date().toISOString(),
  created_at: order.created_at,
  updated_at: order.updated_at,
})

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined'

// Product storage functions
export const getProducts = async (): Promise<Product[]> => {
  // Always try Supabase first if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else if (data) {
        const products = data.map(normalizeProduct)
        // Also save to localStorage as backup
        if (isBrowser) {
          localStorage.setItem("products", JSON.stringify(products))
        }
        return products
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return []
  
  try {
    const products = localStorage.getItem("products")
    return products ? JSON.parse(products).map(normalizeProduct) : []
  } catch (error) {
    console.error('Error parsing localStorage products:', error)
    return []
  }
}

export const saveProducts = (products: Product[]): void => {
  if (!isBrowser) return
  try {
    localStorage.setItem("products", JSON.stringify(products))
  } catch (error) {
    console.error('Error saving products to localStorage:', error)
  }
}

export const addProduct = async (product: Omit<Product, "id" | "created_at" | "updated_at">): Promise<Product | null> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
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
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else if (data) {
        const newProduct = normalizeProduct(data)
        // Also add to localStorage as backup
        if (isBrowser) {
          const localProducts = await getLocalStorageProducts()
          localProducts.unshift(newProduct)
          saveProducts(localProducts)
        }
        return newProduct
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return null

  try {
    const products = await getLocalStorageProducts()
    const newProduct: Product = {
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9), // More unique ID
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    products.unshift(newProduct)
    saveProducts(products)
    return newProduct
  } catch (error) {
    console.error('Error adding product to localStorage:', error)
    return null
  }
}

export const updateProduct = async (id: string, updates: Partial<Product>): Promise<boolean> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
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
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else {
        // Also update localStorage
        if (isBrowser) {
          const products = await getLocalStorageProducts()
          const index = products.findIndex((p) => p.id === id)
          if (index !== -1) {
            products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() }
            saveProducts(products)
          }
        }
        return true
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return false

  try {
    const products = await getLocalStorageProducts()
    const index = products.findIndex((p) => p.id === id)
    if (index === -1) return false

    products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() }
    saveProducts(products)
    return true
  } catch (error) {
    console.error('Error updating product in localStorage:', error)
    return false
  }
}

export const deleteProduct = async (id: string): Promise<boolean> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else {
        // Also remove from localStorage
        if (isBrowser) {
          const products = await getLocalStorageProducts()
          const filteredProducts = products.filter((p) => p.id !== id)
          saveProducts(filteredProducts)
        }
        return true
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return false

  try {
    const products = await getLocalStorageProducts()
    const filteredProducts = products.filter((p) => p.id !== id)
    saveProducts(filteredProducts)
    return true
  } catch (error) {
    console.error('Error deleting product from localStorage:', error)
    return false
  }
}

// Helper function to get products from localStorage only
const getLocalStorageProducts = async (): Promise<Product[]> => {
  if (!isBrowser) return []
  
  try {
    const products = localStorage.getItem("products")
    return products ? JSON.parse(products).map(normalizeProduct) : []
  } catch (error) {
    console.error('Error parsing localStorage products:', error)
    return []
  }
}

// Order storage functions
export const getOrders = async (): Promise<Order[]> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else if (data) {
        const orders = data.map(normalizeOrder)
        // Also save to localStorage as backup
        if (isBrowser) {
          localStorage.setItem("orders", JSON.stringify(orders))
        }
        return orders
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return []
  
  try {
    const orders = localStorage.getItem("orders")
    return orders ? JSON.parse(orders).map(normalizeOrder) : []
  } catch (error) {
    console.error('Error parsing localStorage orders:', error)
    return []
  }
}

export const saveOrders = (orders: Order[]): void => {
  if (!isBrowser) return
  try {
    localStorage.setItem("orders", JSON.stringify(orders))
  } catch (error) {
    console.error('Error saving orders to localStorage:', error)
  }
}

export const addOrder = async (order: Omit<Order, "id" | "created_at" | "updated_at" | "createdAt">): Promise<Order | null> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
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
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else if (data) {
        const newOrder = normalizeOrder(data)
        // Also add to localStorage as backup
        if (isBrowser) {
          const localOrders = await getLocalStorageOrders()
          localOrders.unshift(newOrder)
          saveOrders(localOrders)
        }
        return newOrder
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return null

  try {
    const orders = await getLocalStorageOrders()
    const newOrder: Order = {
      ...order,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    orders.unshift(newOrder)
    saveOrders(orders)
    return newOrder
  } catch (error) {
    console.error('Error adding order to localStorage:', error)
    return null
  }
}

export const updateOrderStatus = async (id: string, status: Order["status"]): Promise<boolean> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id)

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else {
        // Also update localStorage
        if (isBrowser) {
          const orders = await getLocalStorageOrders()
          const index = orders.findIndex((o) => o.id === id)
          if (index !== -1) {
            orders[index] = { 
              ...orders[index], 
              status, 
              updated_at: new Date().toISOString() 
            }
            saveOrders(orders)
          }
        }
        return true
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return false

  try {
    const orders = await getLocalStorageOrders()
    const index = orders.findIndex((o) => o.id === id)
    if (index === -1) return false

    orders[index] = { 
      ...orders[index], 
      status, 
      updated_at: new Date().toISOString() 
    }
    saveOrders(orders)
    return true
  } catch (error) {
    console.error('Error updating order status in localStorage:', error)
    return false
  }
}

export const deleteOrder = async (id: string): Promise<boolean> => {
  // Try Supabase first if configured
  if (isSupabaseConfigured) {
    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) {
        console.warn('Supabase error, falling back to localStorage:', error.message)
      } else {
        // Also remove from localStorage
        if (isBrowser) {
          const orders = await getLocalStorageOrders()
          const filteredOrders = orders.filter((o) => o.id !== id)
          saveOrders(filteredOrders)
        }
        return true
      }
    } catch (error) {
      console.warn('Supabase connection failed, falling back to localStorage:', error)
    }
  }

  // Fallback to localStorage
  if (!isBrowser) return false

  try {
    const orders = await getLocalStorageOrders()
    const filteredOrders = orders.filter((o) => o.id !== id)
    saveOrders(filteredOrders)
    return true
  } catch (error) {
    console.error('Error deleting order from localStorage:', error)
    return false
  }
}

// Helper function to get orders from localStorage only
const getLocalStorageOrders = async (): Promise<Order[]> => {
  if (!isBrowser) return []
  
  try {
    const orders = localStorage.getItem("orders")
    return orders ? JSON.parse(orders).map(normalizeOrder) : []
  } catch (error) {
    console.error('Error parsing localStorage orders:', error)
    return []
  }
}
