// components/customer-shop.tsx
"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { type Product, getProducts } from "@/lib/storage"
import ProductCard from "./product-card"
import OrderModal from "./order-modal"

export default function CustomerShop() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        const loadedProducts = await getProducts()
        if (loadedProducts.length === 0) {
          setError("No products available. Please check back later.")
        } else {
          setProducts(loadedProducts)
          setFilteredProducts(loadedProducts)
          setError(null)
        }
      } catch (err) {
        console.error("Error loading products:", err)
        setError("Failed to load products. Please try again later.")
      } finally {
        setLoading(false)
      }
    }
    
    loadProducts()
  }, [])

  useEffect(() => {
    const filtered = products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    setFilteredProducts(filtered)
  }, [searchTerm, products])

  const handleOrder = (product: Product) => {
    setSelectedProduct(product)
    setIsOrderModalOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading products...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-primary mb-2">Welcome to HealthTea Store</h2>
        <p className="text-muted-foreground">
          Discover premium health supplements, herbal products, and authentic Chinese teas
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            {searchTerm ? "No products found matching your search criteria." : "No products available yet."}
          </p>
          {searchTerm && (
            <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onOrder={handleOrder} 
              />
            ))}
          </div>
          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredProducts.length} of {products.length} products
          </div>
        </>
      )}

      <OrderModal 
        product={selectedProduct} 
        isOpen={isOrderModalOpen} 
        onClose={() => setIsOrderModalOpen(false)} 
      />
    </div>
  )
}
