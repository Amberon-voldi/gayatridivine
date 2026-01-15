import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function mask(value, keepStart = 0, keepEnd = 4) {
  const v = String(value || "");
  if (!v) return "";
  if (v.length <= keepStart + keepEnd) return "*".repeat(v.length);
  return `${v.slice(0, keepStart)}${"*".repeat(v.length - keepStart - keepEnd)}${v.slice(-keepEnd)}`;
}

export async function GET() {
  const authkey = (
    process.env.MSG91_AUTHKEY ||
    process.env.MSG91_AUTH_KEY ||
    process.env.MSG91_AUTH ||
    ""
  ).trim();

  const widgetId = (
    process.env.MSG91_WIDGET_ID ||
    process.env.MSG91_WIDGETID ||
    process.env.MSG91_WIDGET ||
    ""
  ).trim();

  return NextResponse.json({
    configured: Boolean(authkey && widgetId),
    authkey: {
      present: Boolean(authkey),
      length: authkey.length,
      masked: mask(authkey, 0, 4),
    },
    widgetId: {
      present: Boolean(widgetId),
      length: widgetId.length,
      masked: mask(widgetId, 2, 4),
    },
  });
}
