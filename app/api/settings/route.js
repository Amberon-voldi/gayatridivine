import { NextResponse } from "next/server";
import { readSettingsFile } from "@/lib/settings.server";

export async function GET() {
  try {
    const settings = await readSettingsFile();

    // Public subset used by storefront and invoices.
    const publicSettings = {
      store: settings.store,
      shipping: settings.shipping,
      payment: {
        razorpayEnabled: settings?.payment?.razorpayEnabled,
        codEnabled: settings?.payment?.codEnabled,
        codLimit: settings?.payment?.codLimit,
        razorpayKeyId: settings?.payment?.razorpayKeyId,
      },
      gst: settings.gst,
      otp: settings.otp,
      admin: {
        adminEmails: settings?.admin?.adminEmails || [],
        supportEmail: settings?.admin?.supportEmail || settings?.store?.storeEmail || "",
      },
    };

    return NextResponse.json({ success: true, settings: publicSettings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}
