import { redirect } from "next/navigation";

export default function Home() {
  // There is no marketing page for an internal tool. The dashboard is the
  // front door, and the middleware sends an unauthenticated visitor to
  // /login from there.
  redirect("/dashboard");
}
