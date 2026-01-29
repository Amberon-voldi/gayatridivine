"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const productPathId = item?.slug || item?.id;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-200">
      {/* Image */}
      <Link href={`/product/${productPathId}`} className="shrink-0">
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-lg"
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/product/${productPathId}`}>
          <h3 className="text-sm sm:text-base font-medium text-gray-800 hover:text-red-600 transition-colors truncate">
            {item.name}
          </h3>
        </Link>
        {item.selectedColor && (
          <p className="text-sm text-gray-500 mt-1">Color: {item.selectedColor}</p>
        )}
        <p className="text-sm font-semibold text-gray-900 mt-1">
          ₹{item.price.toLocaleString()}
        </p>

        {/* Mobile quantity controls */}
        <div className="flex items-center mt-2 sm:hidden">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity - 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              -
            </button>
            <span className="px-3 py-1 text-sm">{item.quantity}</span>
            <button
              onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity + 1)}
              className="px-2 py-1 text-gray-600 hover:bg-gray-100"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* Desktop quantity controls */}
      <div className="hidden sm:flex items-center border border-gray-300 rounded-lg">
        <button
          onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity - 1)}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          -
        </button>
        <span className="px-4 py-1">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.id, item.selectedColor, item.quantity + 1)}
          className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
        >
          +
        </button>
      </div>

      {/* Subtotal */}
      <div className="text-right">
        <p className="font-semibold text-gray-900">
          ₹{(item.price * item.quantity).toLocaleString()}
        </p>
        <button
          onClick={() => removeFromCart(item.id, item.selectedColor)}
          className="text-sm text-red-500 hover:text-red-700 transition-colors mt-1"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

