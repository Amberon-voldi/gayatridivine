import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Razorpay Magic Checkout — validate and apply a promotion code.
 */
export async function POST(request) {
  try {
    const { code } = await request.json();

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Invalid promotion code" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Promotion code not found" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Magic Checkout apply promotion error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to apply promotion" },
      { status: 500 }
    );
  }
}
