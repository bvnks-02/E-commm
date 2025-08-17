"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Trash2, Phone, MapPin, Calendar, Package } from "lucide-react"
import { type Order, type Product, getOrders, getProducts, updateOrderStatus, deleteOrder } from "@/lib/storage"

export default function OrderList() {
  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    const loadData = async () => {
      const [ordersData, productsData] = await Promise.all([
        getOrders(),
        getProducts()
      ])
      setOrders(ordersData)
      setProducts(productsData)
    }
    loadData()
  }, [])

  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId)
  }

  const handleConfirmOrder = (orderId: string) => {
    const updateStatus = async () => {
      const success = await updateOrderStatus(orderId, "confirmed")
      if (success) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: "confirmed" } : order)))
      }
    }
    updateStatus()
  }

  const handleDeleteOrder = (orderId: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      const deleteOrderAsync = async () => {
        const success = await deleteOrder(orderId)
        if (success) {
          setOrders(orders.filter((order) => order.id !== orderId))
        }
      }
      deleteOrderAsync()
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const confirmedOrders = orders.filter((order) => order.status === "confirmed")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Order Management</h3>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Total: {orders.length}</span>
          <span>Pending: {pendingOrders.length}</span>
          <span>Confirmed: {confirmedOrders.length}</span>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No orders received yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-4 text-yellow-700">Pending Orders ({pendingOrders.length})</h4>
              <div className="space-y-4">
                {pendingOrders.map((order) => {
                  const product = getProductById(order.productId || order.product_id || '')
                  return (
                    <Card key={order.id} className="border-yellow-200">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleConfirmOrder(order.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteOrder(order.id)}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Product Info */}
                        {product && (
                          <div className="flex gap-4 p-3 bg-muted rounded-lg">
                            <img
                              src={product.imageUrl || "/placeholder.svg?height=60&width=60&query=health product"}
                              alt={product.name}
                              className="w-15 h-15 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold">{product.name}</h5>
                              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                              <p className="font-bold text-primary mt-1">{product.price.toFixed(2)} DZD</p>
                            </div>
                          </div>
                        )}

                        {/* Customer Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h6 className="font-medium text-sm">Customer Information</h6>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Name:</strong> {order.customerName || order.customer_name}
                              </p>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{order.customerPhone || order.customer_phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h6 className="font-medium text-sm">Delivery Information</h6>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p>
                                    <strong>Region:</strong> {order.customerRegion || order.customer_region}
                                  </p>
                                  <p>
                                    <strong>Address:</strong> {order.customerAddress || order.customer_address}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {/* Confirmed Orders */}
          {confirmedOrders.length > 0 && (
            <div>
              <h4 className="text-lg font-medium mb-4 text-green-700">Confirmed Orders ({confirmedOrders.length})</h4>
              <div className="space-y-4">
                {confirmedOrders.map((order) => {
                  const product = getProductById(order.productId || order.product_id || '')
                  return (
                    <Card key={order.id} className="border-green-200 bg-green-50/50">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">Order #{order.id.slice(-6)}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{formatDate(order.createdAt)}</span>
                              <Badge className={getStatusColor(order.status)}>
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </Badge>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteOrder(order.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {/* Product Info */}
                        {product && (
                          <div className="flex gap-4 p-3 bg-white rounded-lg">
                            <img
                              src={product.imageUrl || "/placeholder.svg?height=60&width=60&query=health product"}
                              alt={product.name}
                              className="w-15 h-15 object-cover rounded"
                            />
                            <div className="flex-1">
                              <h5 className="font-semibold">{product.name}</h5>
                              <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                              <p className="font-bold text-primary mt-1">{product.price.toFixed(2)} DZD</p>
                            </div>
                          </div>
                        )}

                        {/* Customer Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <h6 className="font-medium text-sm">Customer Information</h6>
                            <div className="space-y-1 text-sm">
                              <p>
                                <strong>Name:</strong> {order.customerName || order.customer_name}
                              </p>
                              <div className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{order.customerPhone || order.customer_phone}</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <h6 className="font-medium text-sm">Delivery Information</h6>
                            <div className="space-y-1 text-sm">
                              <div className="flex items-start gap-1">
                                <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p>
                                    <strong>Region:</strong> {order.customerRegion || order.customer_region}
                                  </p>
                                  <p>
                                    <strong>Address:</strong> {order.customerAddress || order.customer_address}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}