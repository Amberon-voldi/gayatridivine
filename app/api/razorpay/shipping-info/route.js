import { NextResponse } from "next/server";
import { buildShippingMethodsResponse } from "@/lib/razorpay.server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay Magic Checkout shipping-info webhook.
 * @see https://razorpay.com/docs/payments/magic-checkout/web/
 */
export async function POST(request) {
  try {
    const start = Date.now();
    const body = await request.json();
    console.log("[shipping-info] incoming body:", JSON.stringify(body));
    const headers = Object.fromEntries(request.headers.entries());
    console.log("[shipping-info] request headers:", headers);
    const addresses = body.addresses || [];
    if (addresses.length === 0) {
      return NextResponse.json(
        { error: "addresses required" },
        { status: 400 }
      );
    }

    const responseAddresses = addresses.map((addr) => {
      const id = String(addr.id ?? "0");
      const zipcode = String(addr.zipcode ?? "");
      const state_code = addr.state_code || addr.state || "";
      const country = (addr.country || "IN").toUpperCase();

      const shipping_methods = [
        {
          id: "1",
          description: "Free shipping",
          name: "Delivery within 5 days",
          serviceable: true,
          shipping_fee: 1000,
          cod: true,
          cod_fee: 1000,
        },
        {
          id: "2",
          description: "Standard Delivery",
          name: "Delivered on the same day",
          serviceable: true,
          shipping_fee: 1000,
          cod: false,
          cod_fee: 0,
        },
      ];

      return {
        id,
        zipcode,
        state_code,
        country,
        shipping_methods,
      };
    });

    const duration = Date.now() - start;
    console.log("[shipping-info] responseAddresses:", JSON.stringify(responseAddresses), "duration_ms:", duration);

    // Persist trace for correlation with Razorpay 503s
    try {
      const logDir = process.cwd();
      const logPath = path.join(logDir, "razorpay_shipping_info.log");
      const entry = {
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        headers,
        body,
        response: responseAddresses,
      };
      await fs.appendFile(logPath, JSON.stringify(entry) + "\n");
    } catch (writeErr) {
      console.warn("[shipping-info] failed to write trace:", writeErr?.message || writeErr);
    }

    return NextResponse.json(
      { addresses: responseAddresses },
      { headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Magic Checkout shipping-info error:", error);
    return NextResponse.json(
      { error: error.message || "Shipping info failed" },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } }
    );
  }
}
