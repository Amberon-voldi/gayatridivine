import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MSG91_VERIFY_OTP_URL = "https://api.msg91.com/api/v5/widget/verifyOtp";

function mask(value, keepStart = 0, keepEnd = 4) {
  const v = String(value || "");
  if (!v) return "";
  if (v.length <= keepStart + keepEnd) return "*".repeat(v.length);
  return `${v.slice(0, keepStart)}${"*".repeat(v.length - keepStart - keepEnd)}${v.slice(-keepEnd)}`;
}

export async function POST(request) {
  try {
    const authkey = (
      process.env.MSG91_AUTHKEY ||
      process.env.MSG91_AUTH_KEY ||
      process.env.MSG91_AUTH ||
      ""
    )
      .replace(/\s+/g, "")
      .trim();
    const widgetId = (
      process.env.MSG91_WIDGET_ID ||
      process.env.MSG91_WIDGETID ||
      process.env.MSG91_WIDGET ||
      ""
    )
      .replace(/\s+/g, "")
      .trim();

    if (!authkey || !widgetId) {
      return NextResponse.json(
        {
          success: false,
          error: "MSG91 is not configured: set MSG91_AUTHKEY and MSG91_WIDGET_ID",
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const reqId = body?.reqId;
    const otp = body?.otp;

    const debugEnabled = String(process.env.MSG91_DEBUG || "").trim() === "1";

    if (!reqId || typeof reqId !== "string") {
      return NextResponse.json(
        { success: false, error: "reqId is required" },
        { status: 400 }
      );
    }

    if (!otp || typeof otp !== "string") {
      return NextResponse.json(
        { success: false, error: "otp is required" },
        { status: 400 }
      );
    }

    const upstream = await fetch(MSG91_VERIFY_OTP_URL, {
      method: "POST",
      headers: {
        Authkey: authkey,
        "content-type": "application/json",
      },
      body: JSON.stringify({ widgetId, reqId, otp }),
    });

    const text = await upstream.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (debugEnabled) {
      console.log("[MSG91] verifyOtp response", {
        endpoint: MSG91_VERIFY_OTP_URL,
        status: upstream.status,
        ok: upstream.ok,
        request: {
          widgetId: mask(widgetId, 2, 4),
          reqId: mask(reqId, 0, 6),
          otpLength: typeof otp === "string" ? otp.length : null,
        },
        raw: text,
        parsed: data,
      });
    }

    const msg91Type =
      data && typeof data === "object" ? String(data.type || data.status || "") : "";
    const msg91MessageRaw =
      data && typeof data === "object" ? data.message || data.msg || data.error : null;
    const msg91Message = msg91MessageRaw ? String(msg91MessageRaw) : "";
    const friendlyAuthHint =
      /authenticationfailure/i.test(msg91Message) || /authenticationfailure/i.test(msg91Type)
        ? "MSG91 AuthenticationFailure: check MSG91_AUTHKEY and MSG91_WIDGET_ID configuration. Restart `npm run dev` after editing .env.local."
        : "";

    return NextResponse.json(
      {
        success: upstream.ok,
        data,
        error: upstream.ok ? undefined : friendlyAuthHint || msg91Message || undefined,
      },
      { status: upstream.status }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
  }
}
