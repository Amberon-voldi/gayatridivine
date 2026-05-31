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
    console.log("[shipping-info] incoming body:", JSON.stringify(body));
    const addresses = body.addresses || [];
    if (addresses.length === 0) {
      return NextResponse.json(
        { error: "addresses required" },
        { status: 400 }
      );
    }

    const responseAddresses = addresses.map((addr) =>
      buildShippingMethodsResponse({
        addressId: String(addr.id ?? "0"),
        zipcode: String(addr.zipcode ?? ""),
        shippingPaise: 0,
        codAllowed: false,
        codFeePaise: 0,
      }).addresses[0]
    );

    console.log("[shipping-info] responseAddresses:", JSON.stringify(responseAddresses));

    return NextResponse.json({ addresses: responseAddresses });
  } catch (error) {
    console.error("Magic Checkout shipping-info error:", error);
    return NextResponse.json(
      { error: error.message || "Shipping info failed" },
      { status: 500 }
    );
  }
}
