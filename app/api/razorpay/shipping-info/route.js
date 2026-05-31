import { NextResponse } from "next/server";
import { buildShippingMethodsResponse } from "@/lib/razorpay.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay Magic Checkout shipping-info webhook.
 * @see https://razorpay.com/docs/payments/magic-checkout/web/
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const addresses = body.addresses || [];
    if (addresses.length === 0) {
      return NextResponse.json(
        { error: "addresses required" },
        { status: 400 }
      );
    }
    // Per Razorpay Magic Checkout docs: respond quickly with serviceability info.
    // For now respond that all addresses are serviceable and have zero shipping fee.
    const responseAddresses = addresses.map((addr) =>
      buildShippingMethodsResponse({
        addressId: addr.id ?? "0",
        zipcode: addr.zipcode ?? "",
        shippingPaise: 1000,
        codAllowed: false,
        codFeePaise: 1000,
      }).addresses[0]
    );

    return NextResponse.json({ addresses: responseAddresses });
  } catch (error) {
    console.error("Magic Checkout shipping-info error:", error);
    return NextResponse.json(
      { error: error.message || "Shipping info failed" },
      { status: 500 }
    );
  }
}
