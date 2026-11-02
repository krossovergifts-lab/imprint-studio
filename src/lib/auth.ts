/**
 * Minimal admin auth for template/pricing writes. Checks a bearer token against
 * ADMIN_API_KEY. Swap for NextAuth / Clerk / your SSO when you add real accounts;
 * the only contract the routes depend on is requireAdmin(req) throwing on failure.
 */
export function requireAdmin(req: Request) {
  const key = process.env.ADMIN_API_KEY;
  if (!key) return; // demo: open when unset
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (token !== key) throw new AuthError();
}
export class AuthError extends Error {
  constructor() {
    super("unauthorized");
  }
}
