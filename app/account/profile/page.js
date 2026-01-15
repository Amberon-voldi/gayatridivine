"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoaded, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  useEffect(() => {
    if (isLoaded && !isAuthenticated) {
      router.push("/login?redirect=/account/profile");
    }
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || ""
      });
    }
  }, [isLoaded, isAuthenticated, router, user]);

  if (!isLoaded || !isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-64 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);
    if (result.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);
    } else {
      setMessage({ type: "error", text: result.error });
    }
    setTimeout(() => setMessage({ type: "", text: "" }), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm mb-8">
        <Link href="/" className="text-gray-500 hover:text-red-600">Home</Link>
        <span className="text-gray-400">/</span>
        <Link href="/account" className="text-gray-500 hover:text-red-600">Account</Link>
        <span className="text-gray-400">/</span>
        <span className="text-gray-900">Profile</span>
      </nav>

      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Profile Settings</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === "success" ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        {/* Profile Avatar */}
        <div className="flex items-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-2xl">
              {user.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="ml-4">
            <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
          </div>
        </div>

        {/* Profile Form */}
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                  isEditing ? "border-gray-300 bg-white" : "border-gray-200 bg-gray-50"
                }`}
              />
            </div>
          </div>

          <div className="mt-6 flex gap-4">
            {isEditing ? (
              <>
                <button
                  type="submit"
                  className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user.name || "",
                      email: user.email || "",
                      phone: user.phone || ""
                    });
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </form>

        {/* Account Info */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold text-gray-900 mb-4">Account Information</h3>
          <div className="space-y-2 text-sm">
            <p className="text-gray-600">
              <span className="font-medium">Member since:</span>{" "}
              {new Date(user.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "long",
                year: "numeric"
              })}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Total Orders:</span> {user.orders?.length || 0}
            </p>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="mt-8 pt-8 border-t">
          <h3 className="font-semibold text-red-600 mb-4">Danger Zone</h3>
          <button className="text-sm text-red-600 hover:text-red-700">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

