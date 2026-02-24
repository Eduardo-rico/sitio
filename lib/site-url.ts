const LOCAL_HOST_RE = /^(localhost|127\.0\.0\.1)(:\d+)?$/i;
const DEFAULT_SITE_URL = "https://www.ricosotomayor.com";

function withProtocol(hostOrUrl: string): string {
  const value = hostOrUrl.trim().replace(/\/+$/, "");
  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const protocol = LOCAL_HOST_RE.test(value) ? "http" : "https";
  return `${protocol}://${value}`;
}

export function normalizeUrlString(value?: string | null): string | null {
  if (!value) return null;

  const candidate = value.trim();
  if (!candidate) return null;

  try {
    return new URL(withProtocol(candidate)).toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const candidates = [
    process.env.SITE_URL,
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.AUTH_URL,
    process.env.NEXTAUTH_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeUrlString(candidate);
    if (normalized) return normalized;
  }

  return DEFAULT_SITE_URL;
}
