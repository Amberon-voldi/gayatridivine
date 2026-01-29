"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function OrdersPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoaded, getOrders } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push("/login?redirect=/account/orders");
    }
  }, [isLoaded, isAuthenticated, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (isAuthenticated) {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
        setLoading(false);
      }
    };
    fetchOrders();
  }, [isAuthenticated, getOrders]);

  if (!isLoaded || !isAuthenticated || loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-red-600">Home</Link>
        <span className="text-gray-400">/</span>
        <Link href="/account" className="text-gray-500 hover:text-red-600">Account</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">Orders</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">My Orders</h1>

      {orders.length > 0 ? (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.$id || order.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
              {/* Order Header */}
              <div className="bg-gray-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order Placed</p>
                  <p className="font-medium">
                    {new Date(order.createdAt || order.$createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric"
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="font-semibold">₹{order.total.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Order #</p>
                  <p className="font-medium">{order.orderNumber}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  order.status === "confirmed" ? "bg-green-100 text-green-700" :
                  order.status === "shipped" ? "bg-blue-100 text-blue-700" :
                  order.status === "delivered" ? "bg-gray-100 text-gray-700" :
                  "bg-yellow-100 text-yellow-700"
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <Link href={`/product/${item.id}`} className="font-medium text-gray-900 hover:text-red-600">
                          {item.name}
                        </Link>
                        {item.selectedColor && (
                          <p className="text-sm text-gray-600">Color: {item.selectedColor}</p>
                        )}
                        <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                        <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Shipping Address */}
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium text-gray-900 mb-2">Shipping Address</h3>
                  <p className="text-gray-600">
                    {(order.shippingAddress?.name) ||
                      (order.shippingAddress?.firstName && order.shippingAddress?.lastName
                        ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`
                        : order.shippingAddress?.firstName || order.shippingAddress?.lastName || order.customerName || "Customer")}
                    <br />
                    {order.shippingAddress?.address}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                  </p>
                </div>

                {/* Shipment Tracking Info */}
                {(order.courierPartner || order.trackingNumber || order.estimatedDelivery) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                      Shipment Tracking
                    </h3>
                    <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                      {order.courierPartner && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Courier Partner</span>
                          <span className="font-medium text-gray-900">{order.courierPartner}</span>
                        </div>
                      )}
                      {order.trackingNumber && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Tracking Number</span>
                          <span className="font-mono font-medium text-gray-900">{order.trackingNumber}</span>
                        </div>
                      )}
                      {order.estimatedDelivery && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Expected Delivery</span>
                          <span className="font-medium text-green-600">
                            {new Date(order.estimatedDelivery).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric"
                            })}
                          </span>
                        </div>
                      )}
                      {order.trackingUrl && (
                        <div className="pt-2">
                          <a
                            href={order.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Track Your Package
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <svg className="w-20 h-20 text-gray-300 mx-auto mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">When you place orders, they will appear here.</p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
}

