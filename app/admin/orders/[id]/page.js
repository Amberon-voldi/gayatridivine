"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAdmin } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";
import ShippingInvoice from "@/components/admin/ShippingInvoice";
import { databases, DATABASE_ID, COLLECTIONS } from "@/lib/appwrite";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped: "bg-purple-100 text-purple-700 border-purple-200",
  delivered: "bg-green-100 text-green-700 border-green-200",
  cancelled: "bg-red-100 text-red-700 border-red-200"
};

const statusSteps = ["pending", "processing", "shipped", "delivered"];

export default function OrderDetailPage({ params }) {
  const router = useRouter();
  const { isAdmin, isLoading } = useAdmin();
  const unwrappedParams = use(params);
  const orderId = unwrappedParams.id;
  
  const [order, setOrder] = useState(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showShipmentModal, setShowShipmentModal] = useState(false);
  const [shipmentData, setShipmentData] = useState({
    courierPartner: "",
    trackingNumber: "",
    trackingUrl: "",
    estimatedDelivery: ""
  });

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    if (isAdmin && orderId) {
      fetchOrder();
    }
  }, [isAdmin, orderId]);

  const fetchOrder = async () => {
    try {
      const response = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        orderId
      );
      setOrder(response);
      // Initialize shipment data from order
      setShipmentData({
        courierPartner: response.courierPartner || "",
        trackingNumber: response.trackingNumber || "",
        trackingUrl: response.trackingUrl || "",
        estimatedDelivery: response.estimatedDelivery || ""
      });
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoadingOrder(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    setUpdating(true);
    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        orderId,
        { status: newStatus }
      );
      setOrder({ ...order, status: newStatus });
    } catch (error) {
      console.error("Error updating order:", error);
      alert("Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  const updateShipmentDetails = async () => {
    setUpdating(true);
    try {
      const updateData = {
        courierPartner: shipmentData.courierPartner,
        trackingNumber: shipmentData.trackingNumber,
        trackingUrl: shipmentData.trackingUrl,
        estimatedDelivery: shipmentData.estimatedDelivery
      };
      
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.ORDERS,
        orderId,
        updateData
      );
      
      setOrder({ ...order, ...updateData });
      setShowShipmentModal(false);
      alert("Shipment details updated successfully!");
    } catch (error) {
      console.error("Error updating shipment details:", error);
      alert("Failed to update shipment details. Make sure the attributes exist in your Appwrite collection.");
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getOrderItems = () => {
    if (!order?.items) return [];
    try {
      return JSON.parse(order.items);
    } catch {
      return [];
    }
  };

  const getShippingAddress = () => {
    if (!order?.shippingAddress) return null;
    try {
      return JSON.parse(order.shippingAddress);
    } catch {
      return null;
    }
  };

  const getCurrentStepIndex = () => {
    if (order?.status === "cancelled") return -1;
    return statusSteps.indexOf(order?.status || "pending");
  };

  if (loadingOrder) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          <AdminHeader title="Order Details" />
          <div className="p-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64">
          <AdminHeader title="Order Details" />
          <div className="p-8">
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <p className="text-gray-600">Order not found</p>
              <Link href="/admin/orders" className="text-purple-600 hover:text-purple-700 mt-2 inline-block">
                ← Back to Orders
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const items = getOrderItems();
  const shippingAddress = getShippingAddress();
  const currentStep = getCurrentStepIndex();

  return (
    <div className="flex">
      <AdminSidebar />
      
      <main className="flex-1 ml-64">
        <AdminHeader title={`Order #${orderId.substring(0, 8)}`} />
        
        <div className="p-8">
          {/* Back Button */}
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Orders
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status Tracker */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status</h3>
                
                {order.status === "cancelled" ? (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 font-medium">This order has been cancelled</p>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    {statusSteps.map((step, index) => (
                      <div key={step} className="flex-1 flex items-center">
                        <div className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            index <= currentStep
                              ? "bg-purple-600 text-white"
                              : "bg-gray-200 text-gray-400"
                          }`}>
                            {index < currentStep ? (
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            ) : (
                              <span>{index + 1}</span>
                            )}
                          </div>
                          <span className={`mt-2 text-sm capitalize ${
                            index <= currentStep ? "text-purple-600 font-medium" : "text-gray-400"
                          }`}>
                            {step}
                          </span>
                        </div>
                        {index < statusSteps.length - 1 && (
                          <div className={`flex-1 h-1 mx-2 ${
                            index < currentStep ? "bg-purple-600" : "bg-gray-200"
                          }`} />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Status Update */}
                <div className="mt-6 pt-4 border-t flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Update Status:</label>
                  <select
                    value={order.status || "pending"}
                    onChange={(e) => updateOrderStatus(e.target.value)}
                    disabled={updating}
                    className={`px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                      statusColors[order.status] || statusColors.pending
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {updating && (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-600"></div>
                  )}
                </div>
              </div>

              {/* Order Items */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
                <div className="space-y-4">
                  {items.map((item, index) => {
                    const product = getProductById(item.productId);
                    return (
                      <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                        <img
                          src={product?.image || "/placeholder.jpg"}
                          alt={product?.name || item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{product?.name || item.name}</h4>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                          {item.color && (
                            <p className="text-sm text-gray-500">Color: {item.color}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900">
                            ₹{((item.price || product?.price || 0) * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">
                            ₹{(item.price || product?.price || 0).toLocaleString()} each
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Order Summary */}
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>₹{(order.total - (order.shipping || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{order.shipping > 0 ? `₹${order.shipping}` : "Free"}</span>
                  </div>
                  <div className="flex justify-between text-lg font-semibold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span>₹{order.total?.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Info */}
            <div className="space-y-6">
              {/* Order Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Order ID:</span>
                    <p className="font-medium text-gray-900">{order.$id}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <p className="font-medium text-gray-900">{formatDate(order.$createdAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Payment Method:</span>
                    <p className="font-medium text-gray-900">
                      {order.paymentMethod === "razorpay" ? "Online (Razorpay)" : "Cash on Delivery"}
                    </p>
                  </div>
                  {order.razorpayPaymentId && (
                    <div>
                      <span className="text-gray-500">Payment ID:</span>
                      <p className="font-medium text-gray-900 break-all">{order.razorpayPaymentId}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Customer Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>
                    <p className="font-medium text-gray-900">{order.customerName || "Guest"}</p>
                  </div>
                  {order.email && (
                    <div>
                      <span className="text-gray-500">Email:</span>
                      <p className="font-medium text-gray-900">{order.email}</p>
                    </div>
                  )}
                  {order.phone && (
                    <div>
                      <span className="text-gray-500">Phone:</span>
                      <p className="font-medium text-gray-900">{order.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {shippingAddress && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium text-gray-900">{shippingAddress.name}</p>
                    <p>{shippingAddress.address}</p>
                    <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.pincode}</p>
                    <p className="mt-2">{shippingAddress.phone}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowInvoice(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Invoice
                  </button>
                  <button
                    onClick={() => setShowShipmentModal(true)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                    </svg>
                    Update Shipment
                  </button>
                </div>

                {/* Shipment Info Display */}
                {(order.courierPartner || order.trackingNumber) && (
                  <div className="mt-4 pt-4 border-t">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Current Shipment Info</h4>
                    <div className="space-y-2 text-sm">
                      {order.courierPartner && (
                        <p className="text-gray-600">
                          <span className="font-medium">Courier:</span> {order.courierPartner}
                        </p>
                      )}
                      {order.trackingNumber && (
                        <p className="text-gray-600">
                          <span className="font-medium">Tracking #:</span> {order.trackingNumber}
                        </p>
                      )}
                      {order.trackingUrl && (
                        <a
                          href={order.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline inline-flex items-center gap-1"
                        >
                          Track Package
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                      {order.estimatedDelivery && (
                        <p className="text-gray-600">
                          <span className="font-medium">ETA:</span> {formatDate(order.estimatedDelivery)}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Shipment Details Modal */}
          {showShipmentModal && (
            <div className="fixed inset-0 z-50 overflow-y-auto">
              <div className="fixed inset-0 bg-black/50" onClick={() => setShowShipmentModal(false)} />
              <div className="relative min-h-screen flex items-center justify-center p-4">
                <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Update Shipment Details</h2>
                    <button
                      onClick={() => setShowShipmentModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Courier Partner
                      </label>
                      <select
                        value={shipmentData.courierPartner}
                        onChange={(e) => setShipmentData({ ...shipmentData, courierPartner: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="">Select Courier</option>
                        <option value="Delhivery">Delhivery</option>
                        <option value="BlueDart">BlueDart</option>
                        <option value="DTDC">DTDC</option>
                        <option value="Ecom Express">Ecom Express</option>
                        <option value="Shiprocket">Shiprocket</option>
                        <option value="XpressBees">XpressBees</option>
                        <option value="India Post">India Post</option>
                        <option value="Professional Couriers">Professional Couriers</option>
                        <option value="FedEx">FedEx</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking Number / AWB
                      </label>
                      <input
                        type="text"
                        value={shipmentData.trackingNumber}
                        onChange={(e) => setShipmentData({ ...shipmentData, trackingNumber: e.target.value })}
                        placeholder="Enter tracking number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tracking URL
                      </label>
                      <input
                        type="url"
                        value={shipmentData.trackingUrl}
                        onChange={(e) => setShipmentData({ ...shipmentData, trackingUrl: e.target.value })}
                        placeholder="https://track.courier.com/..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Full URL where customer can track their package
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Delivery Date
                      </label>
                      <input
                        type="date"
                        value={shipmentData.estimatedDelivery}
                        onChange={(e) => setShipmentData({ ...shipmentData, estimatedDelivery: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setShowShipmentModal(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={updateShipmentDetails}
                        disabled={updating}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updating && (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        )}
                        Save Details
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Print Invoice Modal */}
          {showInvoice && (
            <ShippingInvoice order={order} onClose={() => setShowInvoice(false)} />
          )}
        </div>
      </main>
    </div>
  );
}
