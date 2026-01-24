"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Redirect to login page (which handles Google OAuth)
    if (!isAuthenticated) {
      router.push(`/login${redirect !== "/" ? `?redirect=${redirect}` : ""}`);
    } else {
      router.push(redirect);
    }
  }, [isAuthenticated, redirect, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
    </div>
  );
}

