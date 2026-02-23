import { execSync } from 'node:child_process'

async function globalSetup() {
  // Ensure schema and deterministic seed data exist before E2E runs.
  execSync('pnpm exec prisma db push --skip-generate', { stdio: 'inherit' })
  execSync('pnpm exec prisma db seed', { stdio: 'inherit' })
}

export default globalSetup
