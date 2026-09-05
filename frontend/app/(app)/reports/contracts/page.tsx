"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";

import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { currentClientStatus, type Client } from "@/lib/clients";

interface ContractReportSummary {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
}

const statusColors: Record<string, string> = {
  ACTIVE: "text-green-600 bg-green-50",
  EXPIRING_SOON: "text-amber-600 bg-amber-50",
  EXPIRED: "text-red-600 bg-red-50",
};

export default function ContractsReportPage() {
  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["contract-report-summary"],
    queryFn: async () => {
      const res = await api.get<ContractReportSummary>("/clients/contracts/summary");
      return res.data;
    },
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const res = await api.get<Client[]>("/clients");
      return res.data;
    },
  });

  const isLoading = summaryLoading || clientsLoading;

  // Sort contracts by status and expiration date
  const sortedClients = [...clients].sort((a, b) => {
    const statusA = currentClientStatus(a);
    const statusB = currentClientStatus(b);

    // Priority: Expiring Soon > Expired > Active
    const statusPriority = { EXPIRING_SOON: 0, EXPIRED: 1, ACTIVE: 2 };
    const priorityA = statusPriority[statusA as keyof typeof statusPriority] ?? 999;
    const priorityB = statusPriority[statusB as keyof typeof statusPriority] ?? 999;

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    // Within same status, sort by expiration date (earliest first)
    return new Date(a.contract_end).getTime() - new Date(b.contract_end).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold">Contracts Monitoring Report</h1>
        <p className="mt-1 text-sm text-muted">Overview of all contract statuses and expiration dates</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">Total Contracts</p>
            <p className="mt-2 text-3xl font-bold">{isLoading ? "—" : summary?.total ?? 0}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">Active</p>
            <p className="mt-2 text-3xl font-bold text-green-600">{isLoading ? "—" : summary?.active ?? 0}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">Expiring Soon</p>
            <p className="mt-2 text-3xl font-bold text-amber-600">{isLoading ? "—" : summary?.expiring_soon ?? 0}</p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs text-muted uppercase tracking-wider">Expired</p>
            <p className="mt-2 text-3xl font-bold text-red-600">{isLoading ? "—" : summary?.expired ?? 0}</p>
          </div>
        </Card>
      </div>

      {/* Contracts List */}
      <div>
        <h2 className="mb-3 text-lg font-semibold">All Contracts</h2>
        <Card>
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted">Loading...</div>
          ) : sortedClients.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">No contracts found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="p-3 text-left font-medium">Client Name</th>
                    <th className="p-3 text-left font-medium">Segment</th>
                    <th className="p-3 text-left font-medium">Start Date</th>
                    <th className="p-3 text-left font-medium">Expiration Date</th>
                    <th className="p-3 text-left font-medium">Status</th>
                    <th className="p-3 text-left font-medium">Days</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedClients.map((client) => {
                    const status = currentClientStatus(client);
                    const today = new Date();
                    const contractEnd = new Date(client.contract_end);
                    const daysRemaining = Math.ceil((contractEnd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

                    return (
                      <tr key={client.id} className="border-t hover:bg-canvas/50">
                        <td className="p-3 font-medium">{client.name}</td>
                        <td className="p-3 text-xs">{client.segment}</td>
                        <td className="p-3 text-xs text-muted">{new Date(client.contract_start).toLocaleDateString()}</td>
                        <td className="p-3 text-xs text-muted font-medium">{new Date(client.contract_end).toLocaleDateString()}</td>
                        <td className="p-3">
                          <span className={`inline-block rounded px-2 py-1 text-xs font-medium ${statusColors[status] || statusColors.ACTIVE}`}>
                            {status === "EXPIRING_SOON" ? "Expiring Soon" : status}
                          </span>
                        </td>
                        <td className={`p-3 text-xs font-medium ${daysRemaining < 0 ? "text-red-600" : daysRemaining < 30 ? "text-amber-600" : "text-green-600"}`}>
                          {daysRemaining < 0 ? `${Math.abs(daysRemaining)} ago` : `${daysRemaining} days`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
