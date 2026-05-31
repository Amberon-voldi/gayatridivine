import { NextResponse } from "next/server";
import { getRazorpayClient } from "@/lib/razorpay.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const orderId = request.nextUrl.searchParams.get("orderId");
    console.log("[fetch-order] requested orderId:", orderId);
    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "orderId is required" },
        { status: 400 }
      );
    }

    const razorpay = getRazorpayClient();
    const order = await razorpay.orders.fetch(orderId);

    console.log("[fetch-order] fetched order id:", order?.id, "status:", order?.status);

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error("Fetch Razorpay order error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch order" },
      { status: 500 }
    );
  }
}
