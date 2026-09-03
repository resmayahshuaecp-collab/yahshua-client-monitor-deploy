"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Bell, HelpCircle, Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";
import type { Actor, Role } from "@/lib/actor";

const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Admin",
  CONSULTANT: "Consultant",
  ENGINEER: "System Engineer",
};

interface SearchResult {
  type: string;
  id: number;
  label: string;
  href: string;
}

const TYPE_LABEL: Record<string, string> = {
  client: "Client",
  bug: "Bug",
  rsc: "RSC",
  meeting: "Meeting",
};

export function Topbar({ actor }: { actor?: Actor }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [open, setOpen] = useState(false);

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  async function runSearch(value: string) {
    setQuery(value);
    if (!value.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }
    try {
      const res = await api.get<{ results: SearchResult[] }>("/search/", {
        params: { q: value },
      });
      setResults(res.data.results);
      setOpen(true);
    } catch {
      setResults([]);
    }
  }

  function goTo(href: string) {
    setOpen(false);
    setQuery("");
    setResults([]);
    router.push(href);
  }

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-5">
      <div className="flex items-center gap-4">
        <Menu size={17} className="text-muted" />
        <span className="text-sm font-bold">Subscription Management System</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <div className="flex h-8 w-52 items-center gap-2 rounded-lg border border-line bg-canvas px-3 text-xs text-muted">
            <Search size={14} />
            <input
              value={query}
              onChange={(e) => runSearch(e.target.value)}
              onFocus={() => query && setOpen(true)}
              onBlur={() => setTimeout(() => setOpen(false), 150)}
              placeholder="Search clients, tickets, meetings..."
              className="w-full bg-transparent outline-none"
            />
          </div>
          {open && results.length > 0 && (
            <div className="absolute left-0 top-9 z-20 w-72 rounded-lg border border-line bg-surface py-1 shadow-lg">
              {results.map((r) => (
                <button
                  key={`${r.type}-${r.id}`}
                  onMouseDown={() => goTo(r.href)}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-xs hover:bg-canvas"
                >
                  <span className="truncate">{r.label}</span>
                  <span className="ml-2 shrink-0 rounded bg-canvas px-1.5 py-0.5 text-[9px] text-muted">
                    {TYPE_LABEL[r.type] ?? r.type}
                  </span>
                </button>
              ))}
            </div>
          )}
          {open && query.trim() && results.length === 0 && (
            <div className="absolute left-0 top-9 z-20 w-72 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-muted shadow-lg">
              No results found.
            </div>
          )}
        </div>
        <button aria-label="Notifications" className="relative rounded-lg bg-canvas p-2 text-muted">
          <Bell size={15} />
          <span className="absolute -right-1 -top-1 grid size-3 place-items-center rounded-full bg-red-500 text-[8px] text-white">5</span>
        </button>
        <button aria-label="Help" className="rounded-lg bg-canvas p-2 text-muted">
          <HelpCircle size={15} />
        </button>
        {actor && (
          <span className="hidden text-right text-sm leading-tight sm:block">
            <span className="block font-medium">{actor.name}</span>
            <span className="block text-xs text-muted">
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