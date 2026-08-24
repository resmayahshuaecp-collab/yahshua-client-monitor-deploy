"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { Actor, Role } from "@/lib/actor";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  CONSULTANT: "Consultant",
  ENGINEER: "System Engineer",
};

export function Topbar({ actor }: { actor?: Actor }) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4">
      <span className="text-sm text-muted">Delivery team</span>
      <div className="flex items-center gap-4">
        {actor && (
          <span className="text-right text-sm leading-tight">
            <span className="block font-medium">{actor.name}</span>
            <span className="block text-xs text-muted">
              {/* A missing role is stated, not blank. A blank slot reads as
                  a rendering bug rather than an unconfigured account. */}
              {actor.role ? ROLE_LABEL[actor.role] : "No role assigned"}
            </span>
          </span>
        )}
        <Button variant="ghost" onClick={signOut}>
          Sign out
        </Button>
      </div>
    </header>
  );
}
