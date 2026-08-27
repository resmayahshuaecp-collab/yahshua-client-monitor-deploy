"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { fetchActor } from "@/lib/actor";
import { primeCsrfCookie } from "@/lib/csrf";
import { QueryProvider } from "@/lib/query-client";

function Shell({ children }: { children: ReactNode }) {
  const { data: actor } = useQuery({ queryKey: ["actor"], queryFn: fetchActor });

  // Once per mount of the app shell, not per request: every state-changing
  // call after this point can rely on the cookie already being there.
  useEffect(() => {
    void primeCsrfCookie();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar actor={actor} />
        <main className="min-w-0 flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <Shell>{children}</Shell>
    </QueryProvider>
  );
}
