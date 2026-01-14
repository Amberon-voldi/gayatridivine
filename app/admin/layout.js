"use client";

import { AdminProvider } from "@/context/AdminContext";

export default function AdminLayout({ children }) {
  return (
    <AdminProvider>
      <div className="min-h-screen bg-gray-100">
        {children}
      </div>
    </AdminProvider>
  );
}
