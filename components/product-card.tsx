"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { ShoppingCart } from "lucide-react"
import type { Product } from "@/lib/storage"

interface ProductCardProps {
  product: Product
  onOrder: (product: Product) => void
}

export default function ProductCard({ product, onOrder }: ProductCardProps) {
  return (
    <Card className="h-full flex flex-col hover:shadow-lg transition-shadow">
      <CardContent className="p-4 flex-1">
        <div className="aspect-square mb-4 overflow-hidden rounded-md bg-gray-100">
          <img
            src={product.imageUrl || "/placeholder.svg?height=200&width=200&query=health product"}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="space-y-2">
          <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-3">{product.description}</p>
          <p className="text-xl font-bold text-primary">{product.price.toFixed(2)} DZD</p>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button onClick={() => onOrder(product)} className="w-full flex items-center gap-2">
          <ShoppingCart className="w-4 h-4" />
          Order Now
        </Button>
      </CardFooter>
    </Card>
  )
}
