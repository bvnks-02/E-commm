export interface Product {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: string
  product_id: string
  customer_name: string
  customer_phone: string
  customer_address: string
  customer_region: string
  product_name: string
  product_price: number
  status: "pending" | "confirmed"
  created_at?: string
  updated_at?: string
}

// Product storage functions
export const getProducts = (): Product[] => {
  if (typeof window === "undefined") return []
  const products = localStorage.getItem("products")
  return products ? JSON.parse(products) : []
}

export const saveProducts = (products: Product[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("products", JSON.stringify(products))
}

export const addProduct = (product: Omit<Product, "id" | "created_at" | "updated_at">): Product => {
  const products = getProducts()
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

export const updateProduct = (id: string, updates: Partial<Product>): boolean => {
  const products = getProducts()
  const index = products.findIndex((p) => p.id === id)
  if (index === -1) return false

  products[index] = { ...products[index], ...updates, updated_at: new Date().toISOString() }
  saveProducts(products)
  return true
}

export const deleteProduct = (id: string): boolean => {
  const products = getProducts()
  const productToDelete = products.find((p) => p.id === id)
  if (productToDelete?.imageUrl && productToDelete.imageUrl.startsWith("/images/")) {
    fetch("/api/delete-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imagePath: productToDelete.imageUrl }),
    }).catch(console.error)
  }

  const filteredProducts = products.filter((p) => p.id !== id)
  saveProducts(filteredProducts)
  return true
}

// Order storage functions
export const getOrders = (): Order[] => {
  if (typeof window === "undefined") return []
  const orders = localStorage.getItem("orders")
  return orders ? JSON.parse(orders) : []
}

export const saveOrders = (orders: Order[]): void => {
  if (typeof window === "undefined") return
  localStorage.setItem("orders", JSON.stringify(orders))
}

export const addOrder = (order: Omit<Order, "id" | "created_at" | "updated_at">): Order => {
  const orders = getOrders()
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

export const updateOrderStatus = (id: string, status: Order["status"]): boolean => {
  const orders = getOrders()
  const index = orders.findIndex((o) => o.id === id)
  if (index === -1) return false

  orders[index] = { ...orders[index], status, updated_at: new Date().toISOString() }
  saveOrders(orders)
  return true
}

export const deleteOrder = (id: string): boolean => {
  const orders = getOrders()
  const filteredOrders = orders.filter((o) => o.id !== id)
  saveOrders(filteredOrders)
  return true
}
