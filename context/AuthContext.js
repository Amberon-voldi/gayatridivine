"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { account, databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Check for existing session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      // No active session
      setUser(null);
    } finally {
      setIsLoaded(true);
    }
  };

  const login = async (email, password) => {
    try {
      await account.createEmailPasswordSession({ email, password });
      const session = await account.get();
      setUser(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Invalid email or password" };
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      // Create account
      await account.create({
        userId: ID.unique(),
        email,
        password,
        name
      });
      
      // Auto login after registration
      await account.createEmailPasswordSession({ email, password });
      const session = await account.get();
      
      // Update phone if provided
      if (phone) {
        try {
          await account.updatePhone({ phone, password });
        } catch (e) {
          // Phone update is optional, don't fail registration
          console.log("Phone update skipped:", e.message);
        }
      }
      
      setUser(session);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession({ sessionId: "current" });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (updates.name) {
        await account.updateName({ name: updates.name });
      }
      if (updates.email && updates.password) {
        await account.updateEmail({ email: updates.email, password: updates.password });
      }
      const updatedUser = await account.get();
      setUser(updatedUser);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Update failed" };
    }
  };

  // Address functions using Appwrite Database
  const getAddresses = async () => {
    if (!user) return [];
    try {
      const response = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.ADDRESSES,
        queries: [Query.equal("userId", user.$id)]
      });
      return response.documents;
    } catch (error) {
      console.error("Error fetching addresses:", error);
      return [];
    }
  };

  const addAddress = async (address) => {
    if (!user) return { success: false, error: "Not authenticated" };
    try {
      const newAddress = await databases.createDocument({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.ADDRESSES,
        documentId: ID.unique(),
        data: {
          userId: user.$id,
          ...address
        },
        permissions: [`read("user:${user.$id}")`, `update("user:${user.$id}")`, `delete("user:${user.$id}")`]
      });
      return { success: true, address: newAddress };
    } catch (error) {
      return { success: false, error: error.message || "Failed to add address" };
    }
  };

  const updateAddress = async (addressId, updates) => {
    if (!user) return { success: false, error: "Not authenticated" };
    try {
      const updated = await databases.updateDocument({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.ADDRESSES,
        documentId: addressId,
        data: updates
      });
      return { success: true, address: updated };
    } catch (error) {
      return { success: false, error: error.message || "Failed to update address" };
    }
  };

  const removeAddress = async (addressId) => {
    if (!user) return { success: false, error: "Not authenticated" };
    try {
      await databases.deleteDocument({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.ADDRESSES,
        documentId: addressId
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message || "Failed to remove address" };
    }
  };

  // Order functions using Appwrite Database
  const getOrders = async () => {
    if (!user) return [];
    try {
      const response = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.ORDERS,
        queries: [
          Query.equal("userId", user.$id),
          Query.orderDesc("createdAt")
        ]
      });
      return response.documents.map(doc => ({
        ...doc,
        items: JSON.parse(doc.items),
        shippingAddress: JSON.parse(doc.shippingAddress),
        // Include shipment tracking fields
        courierPartner: doc.courierPartner || null,
        trackingNumber: doc.trackingNumber || null,
        trackingUrl: doc.trackingUrl || null,
        estimatedDelivery: doc.estimatedDelivery || null
      }));
    } catch (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
  };

  const addOrder = async (orderData) => {
    if (!user) return { success: false, error: "Not authenticated" };
    try {
      const orderNumber = `GD${Date.now()}`;
      const newOrder = await databases.createDocument({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.ORDERS,
        documentId: ID.unique(),
        data: {
          userId: user.$id,
          orderNumber,
          items: JSON.stringify(orderData.items),
          subtotal: orderData.subtotal,
          shipping: orderData.shipping,
          total: orderData.total,
          status: "confirmed",
          paymentMethod: orderData.paymentMethod,
          shippingAddress: JSON.stringify(orderData.shippingAddress),
          contactEmail: orderData.contactEmail,
          contactPhone: orderData.contactPhone || "",
          createdAt: new Date().toISOString()
        },
        permissions: [`read("user:${user.$id}")`]
      });
      return { 
        success: true, 
        order: {
          ...newOrder,
          items: orderData.items,
          shippingAddress: orderData.shippingAddress
        }
      };
    } catch (error) {
      return { success: false, error: error.message || "Failed to create order" };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoaded,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        getAddresses,
        addAddress,
        updateAddress,
        removeAddress,
        getOrders,
        addOrder
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
