import { normalizeUrlString } from "./site-url"

export function normalizeAuthUrlEnv() {
  const urlVars = [
    "AUTH_URL",
    "NEXTAUTH_URL",
    "NEXTAUTH_URL_INTERNAL",
    "VERCEL_URL",
    "VERCEL_PROJECT_PRODUCTION_URL",
  ] as const;

  for (const key of urlVars) {
    const normalized = normalizeUrlString(process.env[key]);
    if (normalized) {
      process.env[key] = normalized;
    }
  }

  if (!process.env.AUTH_URL && process.env.NEXTAUTH_URL) {
    process.env.AUTH_URL = process.env.NEXTAUTH_URL;
  }

  if (!process.env.NEXTAUTH_URL && process.env.AUTH_URL) {
    process.env.NEXTAUTH_URL = process.env.AUTH_URL;
  }

  if (!process.env.AUTH_URL) {
    const fallback =
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      process.env.VERCEL_URL;
    const normalizedFallback = normalizeUrlString(fallback);
    if (normalizedFallback) {
      process.env.AUTH_URL = normalizedFallback;
      process.env.NEXTAUTH_URL = normalizedFallback;
    }
  }

  if (!process.env.AUTH_SECRET && process.env.NEXTAUTH_SECRET) {
    process.env.AUTH_SECRET = process.env.NEXTAUTH_SECRET;
  }

  if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET;
  }
}

normalizeAuthUrlEnv();
