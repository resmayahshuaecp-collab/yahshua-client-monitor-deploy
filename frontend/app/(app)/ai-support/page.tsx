"use client";

import { useQuery } from "@tanstack/react-query";

import { AiSupport } from "@/components/dashboard/ai-support";
import { api } from "@/lib/api";
import type { Client } from "@/lib/clients";

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

export default function AiSupportPage() {
  const { data: clients = [] } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await api.get<Client[]>("/clients");
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">AI Support</h1>
        <p className="text-sm text-muted">
          Ask about clients, bugs, RSC requests, contracts, and how to use the system.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <AiSupport
          clients={clients}
          bugReport={bugReport}
          rscReport={rscReport}
          contractReport={contractReport}
        />
        <div className="min-h-44 rounded-xl border border-line bg-surface p-5 lg:col-span-2">
          <h2 className="text-sm font-bold">What I can help with</h2>
          <ul className="mt-3 space-y-2 text-xs text-muted">
            <li>Client counts by segment and active contracts</li>
            <li>Open, in-progress, and resolved bugs</li>
            <li>RSC request status</li>
            <li>Contracts expiring soon or expired</li>
            <li>Where to find features in the system</li>
          </ul>
          <p className="mt-4 text-[10px] text-muted">
            This is an early version. It answers from live system data and will say so
            when it can&apos;t help.
          </p>
        </div>
      </div>
    </div>
  );
}