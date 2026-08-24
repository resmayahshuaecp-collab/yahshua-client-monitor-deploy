"use client";

import { useQuery } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { fetchActor } from "@/lib/actor";
import { QueryProvider } from "@/lib/query-client";

function Shell({ children }: { children: ReactNode }) {
  const { data: actor } = useQuery({ queryKey: ["actor"], queryFn: fetchActor });

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar actor={actor} />
        <main className="flex-1 p-6">{children}</main>
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
