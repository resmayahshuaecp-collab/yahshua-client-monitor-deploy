import { api } from "@/lib/api";

// Hits GET /api/auth/csrf once so the csrftoken cookie exists before any
// state-changing request needs it (see backend/accounts/views.py). Fire and
// forget: a failure here must not block rendering -- the first real POST
// will surface its own csrf_failed refusal if the cookie never landed.
export async function primeCsrfCookie(): Promise<void> {
  try {
    await api.get("/auth/csrf");
  } catch {
    // Best-effort only, see above.
  }
}
