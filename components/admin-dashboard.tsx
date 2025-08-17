"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Package, ShoppingCart } from "lucide-react"
import ProductList from "./product-list"
import OrderList from "./order-list"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products")

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Admin Dashboard</h2>
        <p className="text-sm sm:text-base text-muted-foreground">Manage products and orders</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:justify-center">
        <Button
          variant={activeTab === "products" ? "default" : "outline"}
          onClick={() => setActiveTab("products")}
          className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <Package className="w-4 h-4" />
          Products
        </Button>
        <Button
          variant={activeTab === "orders" ? "default" : "outline"}
          onClick={() => setActiveTab("orders")}
          className="flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
        >
          <ShoppingCart className="w-4 h-4" />
          Orders
        </Button>
      </div>

      {activeTab === "products" ? <ProductList /> : <OrderList />}
    </div>
  )
}
