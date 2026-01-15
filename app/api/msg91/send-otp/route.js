import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MSG91_SEND_OTP_URL = "https://api.msg91.com/api/v5/widget/sendOtp";

function mask(value, keepStart = 0, keepEnd = 4) {
  const v = String(value || "");
  if (!v) return "";
  if (v.length <= keepStart + keepEnd) return "*".repeat(v.length);
  return `${v.slice(0, keepStart)}${"*".repeat(v.length - keepStart - keepEnd)}${v.slice(-keepEnd)}`;
}

function extractReqIdFromUnknown(payload) {
  const isObject = (v) => v !== null && typeof v === "object";
  const toKey = (k) => String(k || "").toLowerCase();

  const visit = (value, depth) => {
    if (depth > 8) return null;
    if (typeof value === "string") {
      const match = value.match(
        /(reqId|reqID|requestId|requestID)\s*[:=]\s*"?([a-zA-Z0-9_-]+)"?/i
      );
      return match?.[2] || null;
    }
    if (!isObject(value)) return null;

    if (Array.isArray(value)) {
      for (const item of value) {
        const found = visit(item, depth + 1);
        if (found) return found;
      }
      return null;
    }

    for (const [key, val] of Object.entries(value)) {
      const k = toKey(key);
      if (
        k === "reqid" ||
        k === "requestid" ||
        k === "req_id" ||
        k === "request_id" ||
        k === "txnid" ||
        k === "txn_id" ||
        k === "transactionid" ||
        k === "transaction_id"
      ) {
        if (typeof val === "string") return val;
        if (typeof val === "number") return String(val);
      }
    }

    for (const val of Object.values(value)) {
      const found = visit(val, depth + 1);
      if (found) return found;
    }

    return null;
  };

  return visit(payload, 0);
}

function looksLikeReqId(value) {
  if (typeof value !== "string") return false;
  const v = value.trim();
  if (v.length < 12 || v.length > 128) return false;
  if (/\s/.test(v)) return false;
  // Mostly ids are url-safe/base16/base64ish tokens
  return /^[a-zA-Z0-9_-]+$/.test(v);
}

export async function POST(request) {
  try {
    const authkey = (
      process.env.MSG91_AUTHKEY ||
      process.env.MSG91_AUTH_KEY ||
      process.env.MSG91_AUTH ||
      ""
    )
      // Remove all whitespace (handles hidden newlines/zero-width-ish paste issues)
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
    const identifier = body?.identifier;

    // Optional fields (some widget configurations require captcha token)
    const captchaToken = body?.captchaToken || body?.captcha_token || body?.captcha;

    if (!identifier || typeof identifier !== "string") {
      return NextResponse.json(
        { success: false, error: "identifier is required" },
        { status: 400 }
      );
    }

    const upstreamPayload = {
      widgetId,
      identifier,
      ...(captchaToken ? { captchaToken } : {}),
    };

    const debugEnabled = String(process.env.MSG91_DEBUG || "").trim() === "1";

    const upstream = await fetch(MSG91_SEND_OTP_URL, {
      method: "POST",
      headers: {
        // Some upstreams are buggy about header casing; be explicit.
        Authkey: authkey,
        "content-type": "application/json",
      },
      body: JSON.stringify(upstreamPayload),
    });

    const text = await upstream.text();
    let data;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    if (debugEnabled) {
      console.log("[MSG91] sendOtp response", {
        endpoint: MSG91_SEND_OTP_URL,
        status: upstream.status,
        ok: upstream.ok,
        request: {
          widgetId: mask(widgetId, 2, 4),
          identifier: mask(identifier, 0, 4),
          captchaTokenProvided: Boolean(captchaToken),
        },
        raw: text,
        parsed: data,
      });
    }

    let reqId = extractReqIdFromUnknown(data);

    // MSG91 sometimes returns HTTP 200 even for logical failures.
    const msg91Type =
      data && typeof data === "object" ? String(data.type || data.status || "") : "";
    const msg91MessageRaw =
      data && typeof data === "object" ? data.message || data.msg || data.error : null;
    const msg91Message = msg91MessageRaw ? String(msg91MessageRaw) : "";

    // Some widget responses put the reqId directly in `message` (as a token)
    if (!reqId && looksLikeReqId(msg91Message)) {
      reqId = msg91Message.trim();
    }

    const looksLikeLogicalFailure =
      msg91Type && /error|failed|failure/i.test(msg91Type);

    const success = upstream.ok && !looksLikeLogicalFailure && !!reqId;

    const friendlyAuthHint =
      /authenticationfailure/i.test(msg91Message) || /authenticationfailure/i.test(msg91Type)
        ? "MSG91 AuthenticationFailure: check MSG91_AUTHKEY (Auth Key from MSG91 dashboard) and that MSG91_WIDGET_ID belongs to the same account. Restart `npm run dev` after editing .env.local."
        : "";

    const friendlyCaptchaHint =
      /invalid captcha token/i.test(msg91Message)
        ? "MSG91 Invalid Captcha Token: your OTP Widget likely has captcha enabled. Either disable captcha in the MSG91 OTP Widget settings, or pass a valid captcha token as `captchaToken`."
        : "";

    const debug =
      process.env.NODE_ENV === "production"
        ? undefined
        : {
            endpoint: MSG91_SEND_OTP_URL,
            authkey: { present: Boolean(authkey), length: authkey.length, masked: mask(authkey, 0, 4) },
            widgetId: { present: Boolean(widgetId), length: widgetId.length, masked: mask(widgetId, 2, 4) },
            identifier: { length: String(identifier).length, masked: mask(identifier, 0, 4) },
          };

    return NextResponse.json(
      {
        success,
        reqId,
        data,
        debug,
        error:
          success || !upstream.ok
            ? undefined
            :
                friendlyCaptchaHint ||
                friendlyAuthHint ||
                msg91Message ||
                "MSG91 did not return reqId. Check widgetId/identifier.",
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
