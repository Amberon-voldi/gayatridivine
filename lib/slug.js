export function slugify(input, { maxLength = 36 } = {}) {
  const raw = String(input || "").trim().toLowerCase();
  if (!raw) return "";

  // Replace common separators and symbols, then strip unsafe characters.
  const normalized = raw
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!normalized) return "";
  if (!maxLength || normalized.length <= maxLength) return normalized;

  // Keep within max length without ending on a hyphen.
  return normalized
    .slice(0, maxLength)
    .replace(/-+$/g, "")
    .replace(/^-+/g, "");
}

export function withSlugSuffix(baseSlug, suffix, { maxLength = 36 } = {}) {
  const base = String(baseSlug || "").trim();
  const sfx = String(suffix || "").trim();
  if (!sfx) return base;
  if (!maxLength) return `${base}-${sfx}`;

  const full = `${base}-${sfx}`;
  if (full.length <= maxLength) return full;

  const allowedBaseLen = Math.max(1, maxLength - (sfx.length + 1));
  const trimmedBase = base.slice(0, allowedBaseLen).replace(/-+$/g, "");
  return `${trimmedBase}-${sfx}`;
}
