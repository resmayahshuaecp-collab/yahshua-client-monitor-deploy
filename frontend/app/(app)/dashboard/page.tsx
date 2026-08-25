"use client";

import { useQuery } from "@tanstack/react-query";

import { Panel } from "@/components/dashboard/panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { DASHBOARD_STATS } from "@/components/dashboard/stats";
import { api } from "@/lib/api";

interface ClientStats {
  total: number;
  globe: number;
  sme: number;
  active_contracts: number;
}

export default function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["client-stats"],
    queryFn: async () => {
      const res = await api.get<ClientStats>("/clients/stats");
      return res.data;
    },
  });

  const valueFor = (label: string): number | undefined => {
    if (!data) return undefined;
    switch (label) {
      case "Total Clients":
        return data.total;
      case "Globe Clients":
        return data.globe;
      case "SME Clients":
        return data.sme;
      case "Active Contracts":
        return data.active_contracts;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">Live client data.</p>
      </div>
      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            hint={stat.hint}
            value={valueFor(stat.label)}
          />
        ))}
      </section>
      <section aria-label="Overviews" className="grid gap-4 lg:grid-cols-2">
        <Panel title="Subscription Overview" />
        <Panel title="Client Concerns Overview" />
      </section>
    </div>
  );
}