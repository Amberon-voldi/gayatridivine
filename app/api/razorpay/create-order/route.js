import { NextResponse } from "next/server";
import {
  buildMagicCheckoutOrderPayload,
  getRazorpayClient,
  getStoreSettings,
} from "@/lib/razorpay.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request) {
  try {
    const body = await request.json();
    const settings = await getStoreSettings();

    if (!settings?.payment?.razorpayEnabled) {
      return NextResponse.json(
        { success: false, error: "Online payments are not enabled" },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayClient();
    const siteOrigin =
      request.headers.get("origin") ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      process.env.SITE_URL;

    const receipt =
      body.receipt || `GD_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (Array.isArray(body.cart) && body.cart.length > 0) {
      const payload = buildMagicCheckoutOrderPayload({
        cart: body.cart,
        receipt,
        siteOrigin,
        shippingSettings: settings.shipping,
        paymentSettings: settings.payment,
      });

      const order = await razorpay.orders.create({
        amount: payload.amount,
        currency: payload.currency,
        receipt: payload.receipt,
        line_items_total: payload.line_items_total,
        line_items: payload.line_items,
        notes: payload.notes,
      });

      return NextResponse.json({
        success: true,
        order,
        meta: payload.meta,
      });
    }

    const { amount, currency = "INR" } = body;
    if (!amount) {
      return NextResponse.json(
        { success: false, error: "amount or cart is required" },
        { status: 400 }
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency,
      receipt,
    });

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
