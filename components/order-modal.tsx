"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle } from "lucide-react"
import type { Product } from "@/lib/storage"
import { addOrder } from "@/lib/storage"

interface OrderModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

const algerianRegions = [
  "Adrar",
  "Chlef",
  "Laghouat",
  "Oum El Bouaghi",
  "Batna",
  "Béjaïa",
  "Biskra",
  "Béchar",
  "Blida",
  "Bouira",
  "Tamanrasset",
  "Tébessa",
  "Tlemcen",
  "Tiaret",
  "Tizi Ouzou",
  "Alger",
  "Djelfa",
  "Jijel",
  "Sétif",
  "Saïda",
  "Skikda",
  "Sidi Bel Abbès",
  "Annaba",
  "Guelma",
  "Constantine",
  "Médéa",
  "Mostaganem",
  "M'Sila",
  "Mascara",
  "Ouargla",
  "Oran",
  "El Bayadh",
  "Illizi",
  "Bordj Bou Arréridj",
  "Boumerdès",
  "El Tarf",
  "Tindouf",
  "Tissemsilt",
  "El Oued",
  "Khenchela",
  "Souk Ahras",
  "Tipaza",
  "Mila",
  "Aïn Defla",
  "Naâma",
  "Aïn Témouchent",
  "Ghardaïa",
  "Relizane",
]

export default function OrderModal({ product, isOpen, onClose }: OrderModalProps) {
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    customerAddress: "",
    customerRegion: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      !product ||
      !formData.customerName ||
      !formData.customerPhone ||
      !formData.customerAddress ||
      !formData.customerRegion
    ) {
      alert("Please fill in all required fields")
      return
    }

    const orderData = {
      productId: product.id,
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerAddress: formData.customerAddress,
      customerRegion: formData.customerRegion,
      status: "pending",
    }

    await addOrder(orderData)

    setIsSubmitted(true)
  }

  const handleClose = () => {
    setFormData({
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      customerRegion: "",
    })
    setIsSubmitted(false)
    onClose()
  }

  if (!product) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isSubmitted ? "Order Confirmed!" : "Place Your Order"}</DialogTitle>
          <DialogDescription>
            {isSubmitted
              ? "Your order has been successfully submitted. We'll contact you soon!"
              : "Fill in your details to order this product"}
          </DialogDescription>
        </DialogHeader>

        {isSubmitted ? (
          <div className="text-center py-6">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700 mb-2">Order Confirmed!</h3>
            <p className="text-muted-foreground mb-4">
              Thank you for your order. We'll contact you within 24 hours to confirm delivery details.
            </p>
            <Button onClick={handleClose} className="w-full">
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Product Summary */}
            <Card>
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <img
                    src={product.imageUrl || "/placeholder.svg?height=60&width=60&query=health product"}
                    alt={product.name}
                    className="w-15 h-15 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{product.name}</h4>
                    <Badge className="text-xs mt-1">
                      {product.category === "supplement"
                        ? "Health Supplement"
                        : product.category === "herbal"
                          ? "Herbal Product"
                          : "Chinese Tea"}
                    </Badge>
                    <p className="font-bold text-primary mt-1">{product.price.toFixed(2)} DZD</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerPhone">Phone Number *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                  placeholder="Enter your phone number"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerRegion">Region *</Label>
                <Select
                  value={formData.customerRegion}
                  onValueChange={(value) => setFormData({ ...formData, customerRegion: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your region" />
                  </SelectTrigger>
                  <SelectContent>
                    {algerianRegions.map((region) => (
                      <SelectItem key={region} value={region}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerAddress">Full Address *</Label>
                <Textarea
                  id="customerAddress"
                  value={formData.customerAddress}
                  onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                  placeholder="Enter your complete address"
                  rows={3}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  Confirm Order
                </Button>
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
