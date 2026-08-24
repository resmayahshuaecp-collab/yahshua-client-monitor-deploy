import { Panel } from "@/components/dashboard/panel";
import { StatCard } from "@/components/dashboard/stat-card";

/**
 * The six cards named in the plan's Milestone 0 story. Every value is a
 * placeholder; Milestone 1 wires the first four and Milestone 2 the last
 * two.
 */
export const DASHBOARD_STATS = [
  { label: "Total Clients", hint: "Globe and SME combined" },
  { label: "Globe Clients", hint: "Active, expiring and expired" },
  { label: "SME Clients", hint: "Active, expiring and expired" },
  { label: "Active Contracts", hint: "Not expiring within 30 days" },
  { label: "Open Concerns", hint: "Bugs and RSC not yet resolved" },
  { label: "Meetings This Week", hint: "Booked, Monday to Sunday" },
] as const;

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
