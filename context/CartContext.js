"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { databases, DATABASE_ID, COLLECTIONS, ID, Query } from "@/lib/appwrite";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const { user, isLoaded: authLoaded } = useAuth();

  // Load cart when auth state changes
  useEffect(() => {
    if (authLoaded) {
      if (user) {
        setIsLoaded(false);
        (async () => {
          const didSync = await syncCartToAppwrite();
          if (!didSync) {
            await loadCartFromAppwrite();
          }
        })();
      } else {
        loadCartFromLocalStorage();
      }
    }
  }, [user, authLoaded]);

  const loadCartFromLocalStorage = () => {
    try {
      const savedCart = localStorage.getItem("gayatri-divine-cart");
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setCart([]);
    }
    setIsLoaded(true);
  };

  const loadCartFromAppwrite = async () => {
    try {
      const response = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.CART,
        queries: [Query.equal("userId", user.$id)]
      });
      const cartItems = response.documents.map(doc => ({
        id: doc.productId,
        documentId: doc.$id,
        name: doc.productName,
        price: doc.price,
        image: doc.image,
        quantity: doc.quantity,
        selectedColor: doc.selectedColor || null
      }));
      setCart(cartItems);
    } catch (error) {
      console.error("Error loading cart from Appwrite:", error);
      // Fall back to localStorage
      loadCartFromLocalStorage();
    } finally {
      setIsLoaded(true);
    }
  };

  // Save cart to localStorage for non-authenticated users
  useEffect(() => {
    if (isLoaded && !user) {
      try {
        localStorage.setItem("gayatri-divine-cart", JSON.stringify(cart));
      } catch (error) {
        console.error("Error saving cart to localStorage:", error);
      }
    }
  }, [cart, isLoaded, user]);

  const addToCart = async (product, quantity = 1, selectedColor = null) => {
    // Convert product id to string for consistency
    const productId = String(product.id);
    
    const existingItem = cart.find(
      item => String(item.id) === productId && item.selectedColor === selectedColor
    );

    if (user) {
      try {
        if (existingItem && existingItem.documentId) {
          // Update quantity in Appwrite
          await databases.updateDocument({
            databaseId: DATABASE_ID,
            collectionId: COLLECTIONS.CART,
            documentId: existingItem.documentId,
            data: { quantity: existingItem.quantity + quantity }
          });
          // Update local state
          setCart(prevCart =>
            prevCart.map(item =>
              String(item.id) === productId && item.selectedColor === selectedColor
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          );
        } else {
          // Create new cart item in Appwrite
          const doc = await databases.createDocument({
            databaseId: DATABASE_ID,
            collectionId: COLLECTIONS.CART,
            documentId: ID.unique(),
            data: {
              userId: user.$id,
              productId: productId,
              productName: product.name,
              price: product.price,
              image: product.image || "",
              quantity: quantity,
              selectedColor: selectedColor || ""
            },
            permissions: [`read("user:${user.$id}")`, `update("user:${user.$id}")`, `delete("user:${user.$id}")`]
          });
          
          setCart(prev => [...prev, {
            id: productId,
            documentId: doc.$id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity,
            selectedColor
          }]);
        }
      } catch (error) {
        console.error("Error adding to cart in Appwrite:", error);
        // Fall back to local state update
        updateLocalCart(product, quantity, selectedColor);
      }
    } else {
      // Not logged in - update local state only
      updateLocalCart(product, quantity, selectedColor);
    }
  };

  const updateLocalCart = (product, quantity, selectedColor) => {
    const productId = String(product.id);
    setCart(prevCart => {
      const existingItem = prevCart.find(
        item => String(item.id) === productId && item.selectedColor === selectedColor
      );
      
      if (existingItem) {
        return prevCart.map(item =>
          String(item.id) === productId && item.selectedColor === selectedColor
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { 
        id: productId,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity, 
        selectedColor 
      }];
    });
  };

  const removeFromCart = async (productId, selectedColor) => {
    const pid = String(productId);
    const item = cart.find(
      item => String(item.id) === pid && item.selectedColor === selectedColor
    );

    if (user && item?.documentId) {
      try {
        await databases.deleteDocument({
          databaseId: DATABASE_ID,
          collectionId: COLLECTIONS.CART,
          documentId: item.documentId
        });
      } catch (error) {
        console.error("Error removing from cart:", error);
      }
    }

    setCart(prevCart =>
      prevCart.filter(
        item => !(String(item.id) === pid && item.selectedColor === selectedColor)
      )
    );
  };

  const updateQuantity = async (productId, selectedColor, quantity) => {
    const pid = String(productId);
    
    if (quantity < 1) {
      removeFromCart(productId, selectedColor);
      return;
    }

    const item = cart.find(
      item => String(item.id) === pid && item.selectedColor === selectedColor
    );

    if (user && item?.documentId) {
      try {
        await databases.updateDocument({
          databaseId: DATABASE_ID,
          collectionId: COLLECTIONS.CART,
          documentId: item.documentId,
          data: { quantity }
        });
      } catch (error) {
        console.error("Error updating quantity:", error);
      }
    }

    setCart(prevCart =>
      prevCart.map(item =>
        String(item.id) === pid && item.selectedColor === selectedColor
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = async () => {
    if (user) {
      try {
        // Delete all cart items for this user
        const deletePromises = cart
          .filter(item => item.documentId)
          .map(item => 
            databases.deleteDocument({
              databaseId: DATABASE_ID,
              collectionId: COLLECTIONS.CART,
              documentId: item.documentId
            })
          );
        await Promise.all(deletePromises);
      } catch (error) {
        console.error("Error clearing cart:", error);
      }
    }
    setCart([]);
  };

  // Sync (merge) guest/local cart into Appwrite after login.
  // Returns true if it performed a sync (and refreshed cart), else false.
  const syncCartToAppwrite = async () => {
    if (!user) return false;

    let localCart = [];
    try {
      localCart = JSON.parse(localStorage.getItem("gayatri-divine-cart") || "[]");
    } catch {
      localCart = [];
    }

    if (!Array.isArray(localCart) || localCart.length === 0) return false;

    try {
      const existing = await databases.listDocuments({
        databaseId: DATABASE_ID,
        collectionId: COLLECTIONS.CART,
        queries: [Query.equal("userId", user.$id)]
      });

      const byKey = new Map();
      for (const doc of existing.documents) {
        const key = `${String(doc.productId)}::${String(doc.selectedColor || "")}`;
        byKey.set(key, doc);
      }

      for (const item of localCart) {
        const productId = String(item.id);
        const selectedColor = String(item.selectedColor || "");
        const key = `${productId}::${selectedColor}`;

        const existingDoc = byKey.get(key);
        if (existingDoc) {
          const nextQty = (Number(existingDoc.quantity) || 0) + (Number(item.quantity) || 0);
          await databases.updateDocument({
            databaseId: DATABASE_ID,
            collectionId: COLLECTIONS.CART,
            documentId: existingDoc.$id,
            data: { quantity: nextQty }
          });
        } else {
          const created = await databases.createDocument({
            databaseId: DATABASE_ID,
            collectionId: COLLECTIONS.CART,
            documentId: ID.unique(),
            data: {
              userId: user.$id,
              productId,
              productName: item.name,
              price: item.price,
              image: item.image || "",
              quantity: item.quantity,
              selectedColor,
            },
            permissions: [`read("user:${user.$id}")`, `update("user:${user.$id}")`, `delete("user:${user.$id}")`]
          });
          byKey.set(key, created);
        }
      }

      localStorage.removeItem("gayatri-divine-cart");
      await loadCartFromAppwrite();
      return true;
    } catch (error) {
      console.error("Error syncing cart:", error);
      return false;
    }
  };

  const isInCart = (productId) => {
    const pid = String(productId);
    return cart.some(item => String(item.id) === pid);
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isInCart,
        getCartTotal,
        getCartCount,
        isLoaded,
        syncCartToAppwrite
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
