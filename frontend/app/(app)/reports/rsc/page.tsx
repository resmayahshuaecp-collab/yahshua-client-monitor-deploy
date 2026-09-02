"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";

interface Rsc {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

interface RscReportSummary {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
}

const LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

const priorityColors: Record<string, string> = {
  HIGH: "text-red-600 bg-red-50",
  MEDIUM: "text-amber-600 bg-amber-50",
  LOW: "text-gray-600 bg-gray-50",
};

const statusColors: Record<string, string> = {
  OPEN: "text-red-600 bg-red-50",
  IN_PROGRESS: "text-amber-600 bg-amber-50",
  COMPLETED: "text-green-600 bg-green-50",
};

export default function RscReportPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["rsc-report-summary"],
    queryFn: async () => {
      const res = await api.get<RscReportSummary>("/concerns/rsc/summary");
      return res.data;
    },
  });

  const { data: topRsc = [], isLoading: rscLoading } = useQuery({
    queryKey: ["top-open-rsc"],
    queryFn: async () => {
      const res = await api.get<Rsc[]>("/concerns/rsc/top-open");
      return res.data;
    },
  });

  const isLoading = summaryLoading || rscLoading;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Request for System Customization (RSC) Report</h1>
        <p className="mt-1 text-sm text-muted">Overview of all RSC records in the system</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">Total RSC</p>
            <p className="mt-2 text-3xl font-bold">{isLoading ? "—" : summary?.total ?? 0}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">Open</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{isLoading ? "—" : summary?.open ?? 0}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">In Progress</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{isLoading ? "—" : summary?.in_progress ?? 0}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">Completed</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{isLoading ? "—" : summary?.completed ?? 0}</p>
          </div>
        </Card>
      </div>

      {/* Top Open RSC */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">Top Open RSC (by Priority)</h2>
        <Card>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted">Loading...</div>
          ) : topRsc.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">No open RSC records at this time.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-3 text-left font-medium">ID</th>
                    <th className="p-3 text-left font-medium">Title</th>
                    <th className="p-3 text-left font-medium">Priority</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {topRsc.map((rsc) => (
                    <tr key={rsc.id} className="border-t hover:bg-canvas/50">
                      <td className="p-3 font-mono text-xs">RSC-{String(rsc.id).padStart(3, "0")}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{rsc.title}</p>
                          {rsc.description && <p className="text-xs text-muted">{rsc.description}</p>}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${priorityColors[rsc.priority] || priorityColors.LOW}`}>
                          {LABEL[rsc.priority]}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusColors[rsc.status] || statusColors.OPEN}`}>
                          {LABEL[rsc.status]}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted">{new Date(rsc.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
