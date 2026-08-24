import { Panel } from "@/components/dashboard/panel";
import { StatCard } from "@/components/dashboard/stat-card";
import { DASHBOARD_STATS } from "@/components/dashboard/stats";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Dashboard</h1>
        <p className="text-sm text-muted">
          Placeholders only — no client data exists yet.
        </p>
      </div>

      <section aria-label="Summary" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {DASHBOARD_STATS.map((stat) => (
          <StatCard key={stat.label} label={stat.label} hint={stat.hint} />
        ))}
      </section>

      <section aria-label="Overviews" className="grid gap-4 lg:grid-cols-2">
        <Panel title="Subscription Overview" />
        <Panel title="Client Concerns Overview" />
      </section>
    </div>
  );
}
