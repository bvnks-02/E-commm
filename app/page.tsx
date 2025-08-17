"use client"
import { Button } from "@/components/ui/button"
import { ShoppingBag } from "lucide-react"
import CustomerShop from "@/components/customer-shop"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-100 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-green-200/30 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-200/40 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-green-300/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-1/3 w-28 h-28 bg-yellow-300/30 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-100/20 to-yellow-100/20 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm relative z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">H</span>
              </div>
              <h1 className="text-2xl font-bold text-primary">HealthTea Store</h1>
            </div>

            <div className="flex gap-2">
              <Button variant="default" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Shop
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 relative z-10">
        <CustomerShop />
      </main>
    </div>
  )
}
