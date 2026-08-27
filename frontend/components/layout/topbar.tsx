"use client";

import { useRouter } from "next/navigation";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
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
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
      <div className="flex items-center gap-4"><Menu size={17} className="text-muted" /><span className="text-sm font-bold">Subscription Management System</span></div>
      <div className="flex items-center gap-3"><div className="hidden h-8 w-52 items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-xs text-muted md:flex"><Search size={14} /> Search clients, tickets, meetings...</div><button aria-label="Notifications" className="relative rounded-lg bg-canvas p-2 text-muted"><Bell size={15} /><span className="absolute -right-1 -top-1 grid size-3 place-items-center rounded-full bg-red-500 text-[8px] text-white">5</span></button><button aria-label="Help" className="rounded-lg bg-canvas p-2 text-muted"><HelpCircle size={15} /></button>
        {actor && (
          <span className="hidden text-right text-sm leading-tight sm:block">
            <span className="block font-medium">{actor.name}</span>
            <span className="block text-xs text-muted">
              {/* A missing role is stated, not blank. A blank slot reads as
                  a rendering bug rather than an unconfigured account. */}
              {actor.role ? ROLE_LABEL[actor.role] : "No role assigned"}
            </span>
          </span>
        )}
        <Button variant="ghost" onClick={signOut} className="hidden sm:inline-flex">
          Sign out
        </Button>
      </div>
    </header>
  );
}
