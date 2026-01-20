"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAdmin } from "@/context/AdminContext";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAdmin, isLoading, admin } = useAdmin();
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("store");
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [error, setError] = useState("");
  const [settings, setSettings] = useState(null);
  
  const safeSettings = settings || {
    store: {
      storeName: "",
      tagline: "",
      storeEmail: "",
      storePhone: "",
      storeAddress: "",
      logoPath: "/logo.png",
      currency: "INR",
    },
    shipping: {
      freeShippingThreshold: 1500,
      standardShippingRate: 99,
      expressShippingRate: 199,
      estimatedDelivery: "5-7 business days",
    },
    payment: {
      razorpayEnabled: true,
      codEnabled: true,
      codLimit: 10000,
      razorpayKeyId: "",
    },
    gst: {
      enabled: false,
      gstin: "",
      ratePercent: 18,
      pricesAreInclusive: true,
    },
    otp: {
      enabled: true,
      provider: "msg91",
      requireOnCheckout: true,
    },
    admin: {
      adminEmails: [],
      supportEmail: "",
    },
  };

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.push("/admin/login");
    }
  }, [isAdmin, isLoading, router]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (isLoading || !isAdmin) return;
      try {
        setLoadingSettings(true);
        setError("");
        const res = await fetch("/api/admin/settings", { cache: "no-store" });
        const json = await res.json();
        if (!json?.success) throw new Error(json?.error || "Failed to load settings");
        if (!cancelled) setSettings(json.settings);
      } catch (e) {
        if (!cancelled) setError(e?.message || "Failed to load settings");
      } finally {
        if (!cancelled) setLoadingSettings(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [isAdmin, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const updateSection = (section, patch) => {
    setSettings((prev) => ({
      ...(prev || safeSettings),
      [section]: { ...((prev || safeSettings)[section] || {}), ...patch },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: settings || safeSettings }),
      });
      const json = await res.json();
      if (!json?.success) throw new Error(json?.error || "Failed to save settings");
      setSettings(json.settings);
      alert("Settings saved successfully!");
    } catch (e) {
      setError(e?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "store", label: "Store", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
    { id: "shipping", label: "Shipping", icon: "M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" },
    { id: "payment", label: "Payment", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { id: "gst", label: "GST", icon: "M9 14l6-6m-5.5 0h.01M15 14h.01M12 21a9 9 0 110-18 9 9 0 010 18z" },
    { id: "otp", label: "OTP", icon: "M12 11c0-1.657-1.343-3-3-3S6 9.343 6 11v2h6v-2zm0 0a3 3 0 013 3v3a2 2 0 01-2 2H9a2 2 0 01-2-2v-3a3 3 0 013-3h2z" },
    { id: "admin", label: "Admin", icon: "M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
  ];

  return (
    <div className="flex">
      <AdminSidebar />
      
      <main className="flex-1 ml-64">
        <AdminHeader title="Settings" />
        
        <div className="p-8">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Tabs */}
            <div className="border-b">
              <div className="flex">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors ${
                      activeTab === tab.id
                        ? "text-red-600 border-b-2 border-red-600"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                    </svg>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6">
              {loadingSettings && (
                <div className="p-4 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 mb-6">
                  Loading settings…
                </div>
              )}

              {error && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 mb-6">
                  {error}
                </div>
              )}

              {/* Store Settings */}
              {activeTab === "store" && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Store Name
                      </label>
                      <input
                        type="text"
                        name="storeName"
                        value={safeSettings.store.storeName}
                        onChange={(e) => updateSection("store", { storeName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tagline
                      </label>
                      <input
                        type="text"
                        name="tagline"
                        value={safeSettings.store.tagline}
                        onChange={(e) => updateSection("store", { tagline: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        name="storeEmail"
                        value={safeSettings.store.storeEmail}
                        onChange={(e) => updateSection("store", { storeEmail: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <input
                        type="tel"
                        name="storePhone"
                        value={safeSettings.store.storePhone}
                        onChange={(e) => updateSection("store", { storePhone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Use 10-digit number (no +91)</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <textarea
                        name="storeAddress"
                        value={safeSettings.store.storeAddress}
                        onChange={(e) => updateSection("store", { storeAddress: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Logo Path
                      </label>
                      <input
                        type="text"
                        name="logoPath"
                        value={safeSettings.store.logoPath}
                        onChange={(e) => updateSection("store", { logoPath: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Example: /logo.png</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Currency
                      </label>
                      <select
                        name="currency"
                        value={safeSettings.store.currency}
                        onChange={(e) => updateSection("store", { currency: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (â‚¬)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Shipping Settings */}
              {activeTab === "shipping" && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900">Shipping Configuration</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Free Shipping Threshold (₹)
                      </label>
                      <input
                        type="number"
                        name="freeShippingThreshold"
                        value={safeSettings.shipping.freeShippingThreshold}
                        onChange={(e) => updateSection("shipping", { freeShippingThreshold: e.target.value })}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">Orders above this amount get free shipping</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Standard Shipping Rate (₹)
                      </label>
                      <input
                        type="number"
                        name="standardShippingRate"
                        value={safeSettings.shipping.standardShippingRate}
                        onChange={(e) => updateSection("shipping", { standardShippingRate: e.target.value })}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Express Shipping Rate (₹)
                      </label>
                      <input
                        type="number"
                        name="expressShippingRate"
                        value={safeSettings.shipping.expressShippingRate}
                        onChange={(e) => updateSection("shipping", { expressShippingRate: e.target.value })}
                        min="0"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estimated Delivery
                      </label>
                      <input
                        type="text"
                        name="estimatedDelivery"
                        value={safeSettings.shipping.estimatedDelivery}
                        onChange={(e) => updateSection("shipping", { estimatedDelivery: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Settings */}
              {activeTab === "payment" && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900">Payment Methods</h3>
                  
                  <div className="space-y-4">
                    {/* Razorpay */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <span className="text-blue-600 font-bold text-sm">R</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Razorpay</h4>
                            <p className="text-sm text-gray-500">Accept online payments</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="razorpayEnabled"
                            checked={!!safeSettings.payment.razorpayEnabled}
                            onChange={(e) => updateSection("payment", { razorpayEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                      
                      {safeSettings.payment.razorpayEnabled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Razorpay Key ID
                          </label>
                          <input
                            type="text"
                            name="razorpayKeyId"
                            value={safeSettings.payment.razorpayKeyId}
                            onChange={(e) => updateSection("payment", { razorpayKeyId: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Configure in .env.local for security</p>
                        </div>
                      )}
                    </div>

                    {/* Cash on Delivery */}
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">Cash on Delivery</h4>
                            <p className="text-sm text-gray-500">Pay when you receive</p>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            name="codEnabled"
                            checked={!!safeSettings.payment.codEnabled}
                            onChange={(e) => updateSection("payment", { codEnabled: e.target.checked })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                        </label>
                      </div>
                      
                      {safeSettings.payment.codEnabled && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Maximum COD Amount (₹)
                          </label>
                          <input
                            type="number"
                            name="codLimit"
                            value={safeSettings.payment.codLimit}
                            onChange={(e) => updateSection("payment", { codLimit: e.target.value })}
                            min="0"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          />
                          <p className="text-xs text-gray-500 mt-1">Orders above this amount must pay online</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* GST Settings */}
              {activeTab === "gst" && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900">GST</h3>

                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable GST</h4>
                        <p className="text-sm text-gray-500">Used in invoice breakdown</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!safeSettings.gst.enabled}
                          onChange={(e) => updateSection("gst", { enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GSTIN</label>
                        <input
                          type="text"
                          value={safeSettings.gst.gstin}
                          onChange={(e) => updateSection("gst", { gstin: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="27AABCU9603R1ZM"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={safeSettings.gst.ratePercent}
                          onChange={(e) => updateSection("gst", { ratePercent: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!safeSettings.gst.pricesAreInclusive}
                            onChange={(e) => updateSection("gst", { pricesAreInclusive: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Prices are GST-inclusive</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-1">
                          If enabled, invoice will split GST out of the total.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* OTP Settings */}
              {activeTab === "otp" && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900">OTP Verification</h3>

                  <div className="border rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">Enable OTP</h4>
                        <p className="text-sm text-gray-500">Controls phone verification during checkout</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={!!safeSettings.otp.enabled}
                          onChange={(e) => updateSection("otp", { enabled: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                        <select
                          value={safeSettings.otp.provider}
                          onChange={(e) => updateSection("otp", { provider: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                          <option value="msg91">MSG91</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!!safeSettings.otp.requireOnCheckout}
                            onChange={(e) => updateSection("otp", { requireOnCheckout: e.target.checked })}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">Require OTP on checkout</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Settings */}
              {activeTab === "admin" && (
                <div className="space-y-6 max-w-2xl">
                  <h3 className="text-lg font-semibold text-gray-900">Admin Account</h3>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                        <span className="text-red-600 font-bold text-2xl">
                          {admin?.name?.charAt(0) || "A"}
                        </span>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{admin?.name || "Admin User"}</h4>
                        <p className="text-sm text-gray-500">{admin?.email}</p>
                        <span className="inline-block mt-1 px-2 py-1 bg-red-100 text-red-700 text-xs rounded">
                          Administrator
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Authorized Admin Emails</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      One email per line. Changes apply immediately to admin login.
                    </p>
                    <textarea
                      rows={5}
                      value={(safeSettings.admin.adminEmails || []).join("\n")}
                      onChange={(e) =>
                        updateSection("admin", {
                          adminEmails: e.target.value
                            .split("\n")
                            .map((x) => x.trim())
                            .filter(Boolean),
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 font-mono text-sm"
                      placeholder="admin@gayatridivine.com\nowner@gayatridivine.com"
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Support Email</h4>
                    <input
                      type="email"
                      value={safeSettings.admin.supportEmail}
                      onChange={(e) => updateSection("admin", { supportEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Security</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Email whitelist authentication
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Appwrite session management
                      </li>
                      <li className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Protected admin routes
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

