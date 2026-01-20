"use client";

import { forwardRef, useEffect, useMemo, useState } from "react";

const ShippingInvoice = forwardRef(({ order, onClose }, ref) => {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/settings", { cache: "no-store" });
        const json = await res.json();
        if (!cancelled && json?.success) setSettings(json.settings);
      } catch {
        // ignore (fallback values are used)
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const seller = useMemo(() => {
    const store = settings?.store || {};
    const gst = settings?.gst || {};
    const admin = settings?.admin || {};

    const storeName = store.storeName || "Gayatri Divine";
    const tagline = store.tagline || "";
    const email = admin.supportEmail || store.storeEmail || "";
    const phone = store.storePhone || "";
    const address = store.storeAddress || "";
    const logoPath = store.logoPath || "/logo.png";

    return {
      storeName,
      tagline,
      email,
      phone,
      address,
      logoPath,
      gstEnabled: !!gst.enabled,
      gstin: gst.gstin || "",
    };
  }, [settings]);

  const formatPhoneDisplay = (value) => {
    const digits = String(value || "").replace(/\D/g, "");
    if (!digits) return "";
    if (digits.length === 10) return `+91 ${digits}`;
    if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
    return value;
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

  const items = getOrderItems();
  const shippingAddress = getShippingAddress();

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white w-full max-w-4xl rounded-xl shadow-2xl">
          {/* Close & Print Buttons - Hidden in print */}
          <div className="print:hidden flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Shipping Invoice</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Print Invoice
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Invoice Content */}
          <div ref={ref} className="p-8 print:p-0 print:m-0" id="shipping-invoice">
            {/* Print styles */}
            <style jsx>{`
              @media print {
                @page {
                  size: A4;
                  margin: 15mm;
                }
                body * {
                  visibility: hidden;
                }
                #shipping-invoice, #shipping-invoice * {
                  visibility: visible;
                }
                #shipping-invoice {
                  position: absolute;
                  left: 0;
                  top: 0;
                  width: 100%;
                }
              }
            `}</style>

            {/* Header with Logo and Company Info */}
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-300">
              <div className="flex items-center gap-4">
                <img
                  src={seller.logoPath}
                  alt={seller.storeName}
                  className="w-16 h-16 object-contain"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{seller.storeName}</h1>
                  {seller.tagline && <p className="text-sm text-gray-600">{seller.tagline}</p>}
                  {seller.email && <p className="text-sm text-gray-600">Email: {seller.email}</p>}
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-xl font-bold text-red-600">SHIPPING INVOICE</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Invoice #: <span className="font-medium">{order.$id?.substring(0, 8).toUpperCase()}</span>
                </p>
                <p className="text-sm text-gray-600">
                  Date: <span className="font-medium">{formatDate(order.$createdAt)}</span>
                </p>
              </div>
            </div>

            {/* Ship From & Ship To */}
            <div className="grid grid-cols-2 gap-8 mb-8">
              {/* Ship From */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Ship From (Seller)
                </h3>
                <p className="font-semibold text-gray-900">{seller.storeName}</p>
                {seller.address && <p className="text-sm text-gray-600">{seller.address}</p>}
                {seller.phone && (
                  <p className="text-sm text-gray-600">Phone: {formatPhoneDisplay(seller.phone)}</p>
                )}
                {seller.gstin && (
                  <p className="text-sm text-gray-600">GSTIN: {seller.gstin}</p>
                )}
              </div>

              {/* Ship To */}
              <div className="border-2 border-red-200 rounded-lg p-4 bg-red-50">
                <h3 className="text-sm font-bold text-red-700 uppercase mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Ship To (Customer)
                </h3>
                {shippingAddress ? (
                  <>
                    <p className="font-semibold text-gray-900">{shippingAddress.name || order.customerName}</p>
                    <p className="text-sm text-gray-600">{shippingAddress.address}</p>
                    <p className="text-sm text-gray-600">
                      {shippingAddress.city}, {shippingAddress.state} - {shippingAddress.pincode}
                    </p>
                    <p className="text-sm text-gray-600">Phone: {shippingAddress.phone || order.phone}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-gray-900">{order.customerName}</p>
                    <p className="text-sm text-gray-600">Phone: {order.phone}</p>
                  </>
                )}
              </div>
            </div>

            {/* Order & Shipment Details */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 uppercase">Order ID</p>
                <p className="font-semibold text-gray-900">{order.$id?.substring(0, 12)}</p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 uppercase">Payment Method</p>
                <p className="font-semibold text-gray-900">
                  {order.paymentMethod === "razorpay" ? "Online Paid" : "COD"}
                </p>
              </div>
              <div className="border rounded-lg p-3 text-center">
                <p className="text-xs text-gray-500 uppercase">Order Status</p>
                <p className={`font-semibold capitalize ${
                  order.status === "delivered" ? "text-green-600" :
                  order.status === "shipped" ? "text-blue-600" :
                  order.status === "cancelled" ? "text-red-600" :
                  "text-yellow-600"
                }`}>
                  {order.status || "Pending"}
                </p>
              </div>
            </div>

            {/* Shipment Tracking Info */}
            {(order.courierPartner || order.trackingNumber || order.estimatedDelivery) && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-sm font-bold text-blue-700 uppercase mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                  Shipment Information
                </h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  {order.courierPartner && (
                    <div>
                      <p className="text-gray-500">Courier Partner</p>
                      <p className="font-medium text-gray-900">{order.courierPartner}</p>
                    </div>
                  )}
                  {order.trackingNumber && (
                    <div>
                      <p className="text-gray-500">Tracking Number</p>
                      <p className="font-medium text-gray-900">{order.trackingNumber}</p>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div>
                      <p className="text-gray-500">Expected Delivery</p>
                      <p className="font-medium text-gray-900">{formatDate(order.estimatedDelivery)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Items Table */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 uppercase mb-3">Package Contents</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">#</th>
                    <th className="border px-3 py-2 text-left text-xs font-semibold text-gray-700 uppercase">Item Description</th>
                    <th className="border px-3 py-2 text-center text-xs font-semibold text-gray-700 uppercase">Qty</th>
                    <th className="border px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Unit Price</th>
                    <th className="border px-3 py-2 text-right text-xs font-semibold text-gray-700 uppercase">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const unitPrice = item.price || 0;
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="border px-3 py-2 text-sm text-gray-600">{index + 1}</td>
                        <td className="border px-3 py-2">
                          <p className="font-medium text-gray-900">{item.name || `Product ${item.productId || item.id || ""}`}</p>
                          {item.color && (
                            <p className="text-xs text-gray-500">Color: {item.color}</p>
                          )}
                          {(item.productId || item.id) && (
                            <p className="text-xs text-gray-500">ID: {item.productId || item.id}</p>
                          )}
                        </td>
                        <td className="border px-3 py-2 text-center text-sm text-gray-900">{item.quantity}</td>
                        <td className="border px-3 py-2 text-right text-sm text-gray-900">₹{unitPrice.toLocaleString()}</td>
                        <td className="border px-3 py-2 text-right text-sm font-medium text-gray-900">
                          ₹{(unitPrice * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="border px-3 py-2 text-right text-sm font-medium text-gray-700">
                      Subtotal:
                    </td>
                    <td className="border px-3 py-2 text-right text-sm font-medium text-gray-900">
                      ₹{(order.total - (order.shipping || 0)).toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td colSpan="4" className="border px-3 py-2 text-right text-sm font-medium text-gray-700">
                      Shipping:
                    </td>
                    <td className="border px-3 py-2 text-right text-sm font-medium text-gray-900">
                      {order.shipping > 0 ? `₹${order.shipping}` : "FREE"}
                    </td>
                  </tr>
                  <tr className="bg-red-50">
                    <td colSpan="4" className="border px-3 py-2 text-right text-sm font-bold text-gray-900">
                      Total Amount:
                    </td>
                    <td className="border px-3 py-2 text-right text-lg font-bold text-red-600">
                      ₹{order.total?.toLocaleString()}
                    </td>
                  </tr>
                  {order.paymentMethod === "cod" && (
                    <tr className="bg-yellow-50">
                      <td colSpan="5" className="border px-3 py-2 text-center text-sm font-semibold text-yellow-700">
                        💵 CASH ON DELIVERY - Collect ₹{order.total?.toLocaleString()} on delivery
                      </td>
                    </tr>
                  )}
                </tfoot>
              </table>
            </div>

            {/* Package Details */}
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Package Details</h3>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Total Items: <span className="font-medium text-gray-900">{items.reduce((sum, item) => sum + item.quantity, 0)}</span></p>
                  <p className="text-gray-600">Weight: <span className="font-medium text-gray-900">~{(items.reduce((sum, item) => sum + item.quantity, 0) * 0.3).toFixed(1)} kg</span></p>
                  <p className="text-gray-600">Dimensions: <span className="font-medium text-gray-900">Standard Package</span></p>
                </div>
              </div>
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-2">Special Instructions</h3>
                <div className="text-sm text-gray-600">
                  <p>• Handle with care - Fragile items</p>
                  <p>• Keep away from water</p>
                  {order.paymentMethod === "cod" && <p className="text-yellow-600 font-medium">• Collect payment on delivery</p>}
                </div>
              </div>
            </div>

            {/* Barcode Section */}
            <div className="flex justify-center mb-6">
              <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Order Reference</p>
                <p className="font-mono text-2xl font-bold tracking-wider text-gray-900">
                  {order.$id?.substring(0, 12).toUpperCase()}
                </p>
                <div className="mt-2 flex justify-center gap-0.5">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-gray-900"
                      style={{
                        width: `${Math.random() * 2 + 1}px`,
                        height: "40px"
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t pt-4 text-center text-xs text-gray-500">
              <p>Thank you for shopping with {seller.storeName}!</p>
              {(seller.email || seller.phone) && (
                <p className="mt-1">
                  For queries, contact us at {seller.email || ""}
                  {seller.email && seller.phone ? " | " : ""}
                  {seller.phone ? formatPhoneDisplay(seller.phone) : ""}
                </p>
              )}
              <p className="mt-2 text-gray-400">This is a computer-generated invoice and does not require a signature.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ShippingInvoice.displayName = "ShippingInvoice";

export default ShippingInvoice;
