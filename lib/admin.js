import { getServerSession } from "next-auth/next"
import { authOptions } from "../pages/api/auth/[...nextauth]"

// Comma-separated list of admin emails in env. Case-insensitive.
// ADMIN_EMAILS=jp.pedroporto@gmail.com,ana@neogeneralista.pt
function adminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email) {
  if (!email) return false
  return adminEmails().includes(email.toLowerCase())
}

// Use inside getServerSideProps. Returns { session } if OK, or a
// { redirect } / { notFound } value ready to return as-is from gssp.
export async function requireAdmin(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session) {
    const callback = encodeURIComponent(ctx.resolvedUrl || "/admin")
    return { redirect: { destination: `/auth/entrar?callbackUrl=${callback}`, permanent: false } }
  }
  if (!isAdminEmail(session.user?.email)) {
    return { notFound: true }
  }
  return { session }
}

// Use inside /api/* handlers. Returns the session on success, or null
// after responding with 404 (we don't reveal admin routes to non-admins).
export async function requireAdminApi(req, res) {
  const session = await getServerSession(req, res, authOptions)
  if (!session || !isAdminEmail(session.user?.email)) {
    res.status(404).end()
    return null
  }
  return session
}
