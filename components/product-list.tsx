// components/product-list.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Edit, Trash2, Plus, Loader2 } from "lucide-react"
import { type Product, getProducts, deleteProduct, addProduct, updateProduct } from "@/lib/storage"
import ProductForm from "./product-form"

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const fetchedProducts = await getProducts()
      if (fetchedProducts.length === 0) {
        setError("No products found. Add your first product to get started.")
      } else {
        setProducts(fetchedProducts)
        setError(null)
      }
    } catch (err) {
      console.error("Error loading products:", err)
      setError("Failed to load products. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProduct = async (productData: Omit<Product, "id" | "created_at" | "updated_at">) => {
    try {
      const newProduct = await addProduct(productData)
      if (newProduct) {
        setProducts([newProduct, ...products])
        setShowAddForm(false)
      } else {
        throw new Error("Failed to add product")
      }
    } catch (err) {
      console.error("Error adding product:", err)
      setError("Failed to add product. Please try again.")
    }
  }

  const handleUpdateProduct = async (productData: Omit<Product, "id" | "created_at" | "updated_at">) => {
    if (!editingProduct) return
    
    try {
      const success = await updateProduct(editingProduct.id, productData)
      if (success) {
        setProducts(products.map((p) => (p.id === editingProduct.id ? { ...p, ...productData } : p)))
        setEditingProduct(null)
      } else {
        throw new Error("Failed to update product")
      }
    } catch (err) {
      console.error("Error updating product:", err)
      setError("Failed to update product. Please try again.")
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return
    
    try {
      const success = await deleteProduct(id)
      if (success) {
        setProducts(products.filter((p) => p.id !== id))
      } else {
        throw new Error("Failed to delete product")
      }
    } catch (err) {
      console.error("Error deleting product:", err)
      setError("Failed to delete product. Please try again.")
    }
  }

  if (showAddForm) {
    return <ProductForm onSubmit={handleAddProduct} onCancel={() => setShowAddForm(false)} />
  }

  if (editingProduct) {
    return (
      <ProductForm 
        product={editingProduct} 
        onSubmit={handleUpdateProduct} 
        onCancel={() => setEditingProduct(null)} 
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading products...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <Button 
          onClick={() => loadProducts()} 
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Product Management</h3>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No products added yet. Click "Add Product" to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-20 h-20 object-cover rounded-md"
                    />
                  )}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold">{product.name}</h4>
                        <p className="text-sm text-muted-foreground">{product.description}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingProduct(product)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProduct(product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="font-semibold text-primary">{product.price.toFixed(2)} DZD</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
