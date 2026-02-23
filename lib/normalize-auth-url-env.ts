const normalize = (value: string) => {
  if (/^https?:\/\//i.test(value)) return value
  const isLocal = /^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value)
  return `${isLocal ? "http" : "https"}://${value}`
}

export function normalizeAuthUrlEnv() {
  if (process.env.AUTH_URL) {
    process.env.AUTH_URL = normalize(process.env.AUTH_URL.trim())
  }

  if (process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = normalize(process.env.NEXTAUTH_URL.trim())
  }

  if (!process.env.AUTH_URL && !process.env.NEXTAUTH_URL && process.env.VERCEL_URL) {
    process.env.AUTH_URL = normalize(process.env.VERCEL_URL.trim())
  }
}

