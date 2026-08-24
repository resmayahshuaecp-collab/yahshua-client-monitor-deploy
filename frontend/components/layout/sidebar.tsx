"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { NAV_SECTIONS } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Sections" className="w-56 shrink-0 border-r border-line bg-surface p-3">
      <p className="mb-4 px-2 text-sm font-semibold">Client Monitor</p>
      <ul className="space-y-1">
        {NAV_SECTIONS.map((section) => {
          const current = pathname.startsWith(section.href);
          if (!section.built) {
            return (
              <li key={section.href}>
                <span
                  aria-disabled="true"
                  title="Not built yet"
                  className="flex cursor-not-allowed items-center justify-between rounded-md px-2 py-1.5 text-sm text-muted opacity-60"
                >
                  {section.label}
                  <span className="text-[10px] uppercase tracking-wide">soon</span>
                </span>
              </li>
            );
          }
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "block rounded-md px-2 py-1.5 text-sm",
                  current ? "bg-canvas font-medium text-ink" : "text-muted hover:bg-canvas",
                )}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
