"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";

import { Panel } from "@/components/dashboard/panel";
import { ArrowRight, Bot, ExternalLink, Globe2, MessageCircle, Sparkles } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { DASHBOARD_STATS } from "@/components/dashboard/stats";
import { CommunicationHub } from "@/components/dashboard/communication-hub";
import { api } from "@/lib/api";
import { currentClientStatus, type Client } from "@/lib/clients";

interface ConcernStats {
  open_concerns: number;
  meetings_this_week: number;
  total_bugs: number;
  total_rsc: number;
  total_meetings: number;
}

interface BugReportSummary {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

interface RscReportSummary {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
}

interface ContractReportSummary {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
}

export default function DashboardPage() {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await api.get<Client[]>("/clients/");
      return res.data;
    },
    refetchInterval: 86400000,
  });

  const globeClients = clients.filter((client) => client.segment === "GLOBE");
  const smeClients = clients.filter((client) => client.segment === "SME");

  const { data: concernData } = useQuery({
    queryKey: ["concern-stats"],
    queryFn: async () => {
      const res = await api.get<ConcernStats>("/concerns/stats");
      return res.data;
    },
  });

  const { data: bugReport } = useQuery({
    queryKey: ["bug-report-summary"],
    queryFn: async () => {
      const res = await api.get<BugReportSummary>("/concerns/bugs/summary");
      return res.data;
    },
  });

  const { data: rscReport } = useQuery({
    queryKey: ["rsc-report-summary"],
    queryFn: async () => {
      const res = await api.get<RscReportSummary>("/concerns/rsc/summary");
      return res.data;
    },
  });

  const { data: contractReport } = useQuery({
    queryKey: ["contract-report-summary"],
    queryFn: async () => {
      const res = await api.get<ContractReportSummary>("/clients/contracts/summary");
      return res.data;
    },
  });

  const valueFor = (label: string): number | undefined => {
    switch (label) {
      case "Total Subscription Clients":
        return clients.length;
      case "Globe Clients":
        return globeClients.length;
      case "SME Clients":
        return smeClients.length;
      case "Active Contracts":
        return clients.filter((client) => currentClientStatus(client) === "ACTIVE").length;
      case "Open Client Concerns":
      case "Open Concerns":
        return concernData?.open_concerns;
      case "Meetings This Week":
        return concernData?.meetings_this_week;
      default:
        return undefined;
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between"><div><h1 className="text-xl font-bold">Yahshua afternoon, Ralph!</h1><p className="mt-1 text-xs text-muted">Here&apos;s what&apos;s happening with your subscription management today.</p></div><div className="hidden rounded-lg border border-line bg-surface px-3 py-2 text-xs font-bold sm:block">May 20, 2026 <span className="ml-2 border-l border-line pl-2 font-normal text-muted">Wednesday</span></div></div>
      <section aria-label="Summary" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        {DASHBOARD_STATS.map((stat, index) => (
          <StatCard
            key={stat.label}
            label={stat.label}
            hint={stat.hint}
            value={valueFor(stat.label)}
            index={index}
            href={
              stat.label === "Globe Clients"
                ? "/globe"
                : stat.label === "SME Clients"
                ? "/sme"
                : stat.label === "Meetings This Week"
                ? "/meetings"
                : undefined
            }
          />
        ))}
      </section>
      <section aria-label="Overviews" className="grid gap-4 lg:grid-cols-3">
        <Panel title="Subscription Client Overview"><div className="flex items-center gap-7"><div className="grid size-36 place-items-center rounded-full text-center" style={{ background: `conic-gradient(#4164e8 0 ${clients.length ? globeClients.length / clients.length * 100 : 0}%, #16b981 ${clients.length ? globeClients.length / clients.length * 100 : 0}% 100%)` }}><div className="grid size-16 place-items-center rounded-full bg-surface"><span className="text-xl font-bold">{clients.length}<small className="block text-[9px] font-normal text-muted">Total Clients</small></span></div></div><div className="space-y-4 text-xs"><p><b className="text-blue-500">●</b> <strong>Globe Clients</strong><span className="block pl-4 text-muted">{globeClients.length} ({clients.length ? (globeClients.length / clients.length * 100).toFixed(1) : "0.0"}%)</span></p><p><b className="text-emerald-500">●</b> <strong>SME Clients</strong><span className="block pl-4 text-muted">{smeClients.length} ({clients.length ? (smeClients.length / clients.length * 100).toFixed(1) : "0.0"}%)</span></p></div></div></Panel>
        <Panel title="Client Concerns Overview"><div className="w-full space-y-2 text-xs"><p className="flex justify-between border-b border-line pb-3"><span>🐞 &nbsp; Bugs</span><b>{concernData?.total_bugs ?? 0}</b><Link href="/bugs" className="text-blue-500">View All <ArrowRight size={12} className="inline" /></Link></p><p className="flex justify-between border-b border-line pb-3"><span>🔧 &nbsp; Request for System Customization</span><b>{concernData?.total_rsc ?? 0}</b><Link href="/rsc" className="text-blue-500">View All <ArrowRight size={12} className="inline" /></Link></p><p className="flex justify-between"><span>▣ &nbsp; Book Meetings</span><b>{concernData?.total_meetings ?? 0}</b><Link href="/meetings" className="text-blue-500">View All <ArrowRight size={12} className="inline" /></Link></p></div></Panel>
        <CommunicationHub />
      </section>
      <section className="grid gap-4 lg:grid-cols-2"><StatusStrip title="Globe Clients" clients={globeClients} /><StatusStrip title="SME Clients" clients={smeClients} /></section>
      <section><div className="mb-3 flex items-center justify-between"><h2 className="text-sm font-bold">Reports Summary</h2><Link href="/reports" className="text-xs font-bold text-blue-500">View All <ArrowRight size={12} className="inline" /></Link></div><div className="grid gap-4 xl:grid-cols-3"><ReportCard title="Bugs Report" href="/reports/bugs" stats={[{ label: "Open", value: bugReport?.open ?? 0 }, { label: "In Progress", value: bugReport?.in_progress ?? 0 }, { label: "Resolved", value: bugReport?.resolved ?? 0 }]} total={bugReport?.total} /><ReportCard title="Request for System Customization" href="/reports/rsc" stats={[{ label: "Open", value: rscReport?.open ?? 0 }, { label: "In Progress", value: rscReport?.in_progress ?? 0 }, { label: "Completed", value: rscReport?.completed ?? 0 }]} total={rscReport?.total} /><ReportCard title="Contracts Monitoring Report" href="/reports/contracts" stats={[{ label: "Active", value: contractReport?.active ?? 0 }, { label: "Expiring Soon", value: contractReport?.expiring_soon ?? 0 }, { label: "Expired", value: contractReport?.expired ?? 0 }]} total={contractReport?.total} /></div></section>
      <section className="grid gap-4 lg:grid-cols-5"><div className="min-h-44 rounded-xl border border-line bg-surface p-5 lg:col-span-3"><h2 className="flex items-center gap-2 text-sm font-bold"><Sparkles size={16} className="text-violet-500" /> AI Support <span className="ml-auto rounded-full bg-violet-100 px-2 py-1 text-[9px] text-violet-500">BETA</span></h2><p className="mt-4 inline-block rounded-lg bg-canvas px-3 py-2 text-xs">Ask me anything about YBO, clients, reports, or system usage.</p><div className="mt-3 flex gap-2"><input aria-label="AI question" placeholder="Type your question here..." className="h-9 min-w-0 flex-1 rounded-lg border border-line px-3 text-xs outline-none" /><button aria-label="Ask AI" className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"><Bot size={16} /></button></div></div><div className="min-h-44 rounded-xl border border-line bg-surface p-5 lg:col-span-2"><h2 className="text-sm font-bold">Quick Links</h2><div className="mt-3 space-y-3 text-xs">{["YBO Training Videos", "Training Materials", "Client Contracts (SME & Globe)", "Notion (Bugs / Projects)", "Pumble Channels"].map((link) => <p className="flex items-center justify-between" key={link}><span className="flex items-center gap-2"><MessageCircle size={15} className="text-blue-500" />{link}</span><ExternalLink size={13} className="text-muted" /></p>)}</div></div></section>
    </div>
  );
}

function StatusStrip({ title, clients }: { title: string; clients: Client[] }) { const counts = clients.reduce((result, client) => { result[currentClientStatus(client)] += 1; return result; }, { ACTIVE: 0, EXPIRING_SOON: 0, EXPIRED: 0 }); return <div className="rounded-xl border border-line bg-surface p-4"><div className="flex justify-between text-sm font-bold"><span><Globe2 size={14} className="mr-2 inline text-emerald-500" />{title}</span><span>{clients.length} <small className="font-normal text-muted">Total</small></span></div><div className="mt-3 flex gap-2"><span className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-500">{counts.ACTIVE}<small className="ml-1 block text-[9px] font-normal">Active</small></span><span className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-500">{counts.EXPIRING_SOON}<small className="ml-1 block text-[9px] font-normal">Expiring Soon (30 days)</small></span><span className="rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-500">{counts.EXPIRED}<small className="ml-1 block text-[9px] font-normal">Expired</small></span></div></div> }
function ReportCard({ title, href, stats, total }: { title: string; href: string; stats: Array<{ label: string; value: number }>; total?: number }) { 
  return (
    <Link href={href}>
      <div className="rounded-xl border border-line bg-surface p-4 transition hover:border-blue-300 hover:shadow-sm">
        <h3 className="text-xs font-bold">{title}<span className="float-right text-blue-500">View Report <ArrowRight size={12} className="inline" /></span></h3>
        <div className="mt-4 flex gap-2">
          {stats.map((stat, index) => (
            <span key={stat.label} className={`rounded-lg px-3 py-2 text-xs font-bold ${index === 0 ? "bg-red-50 text-red-500" : index === 1 ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-500"}`}>
              {stat.value}
              <small className="ml-1 block text-[9px] font-normal">{stat.label}</small>
            </span>
          ))}
        </div>
        {total !== undefined && <p className="mt-4 text-[10px] text-muted">Total: <strong>{total}</strong></p>}
      </div>
    </Link>
  );
}