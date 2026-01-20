import { NextResponse } from "next/server";
import { readSettingsFile, sanitizeSettings, writeSettingsFile } from "@/lib/settings.server";

function isAuthorized(request) {
  // Optional bearer token protection.
  const token = process.env.ADMIN_SETTINGS_TOKEN;
  if (!token) return true;

  const header = request.headers.get("authorization") || "";
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return false;
  return match[1] === token;
}

export async function GET(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const settings = await readSettingsFile();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to load settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const next = sanitizeSettings(body?.settings ?? body);

    await writeSettingsFile(next);
    return NextResponse.json({ success: true, settings: next });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to save settings" },
      { status: 500 }
    );
  }
}
