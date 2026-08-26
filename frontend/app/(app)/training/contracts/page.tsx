"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";

interface Client {
  id: number;
  name: string;
  segment: string;
  contract_start: string;
  contract_end: string;
  status: string;
}

const STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring Soon",
  EXPIRED: "Expired",
};

export default function ClientContractsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["clients", "contracts"],
    queryFn: async () => {
      const res = await api.get<Client[]>("/clients/");
      return res.data;
    },
  });

  const clients = data ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Client Contracts</h1>
        <p className="text-sm text-muted">SME &amp; Globe contract overview</p>
      </div>
      {isLoading ? (
        <p className="text-sm text-muted">Loading...</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Client</th>
                <th className="p-3 font-medium">Segment</th>
                <th className="p-3 font-medium">Start</th>
                <th className="p-3 font-medium">End</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id} className="border-t">
                  <td className="p-3">{client.name}</td>
                  <td className="p-3">{client.segment}</td>
                  <td className="p-3">{client.contract_start}</td>
                  <td className="p-3">{client.contract_end}</td>
                  <td className="p-3">{STATUS_LABEL[client.status] ?? client.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
