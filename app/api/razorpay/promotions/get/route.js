import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay Magic Checkout — list applicable promotions.
 * Configure coupon URLs in Razorpay Dashboard → Magic Checkout → Platform Setup.
 */
export async function POST() {
  return NextResponse.json({ promotions: [] });
}
