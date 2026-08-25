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

export default function GlobePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["clients", "globe"],
    queryFn: async () => {
      const res = await api.get<Client[]>("/clients/");
      return res.data.filter((c) => c.segment === "GLOBE");
    },
  });

  const clients = data ?? [];
  const count = (status: string) =>
    clients.filter((c) => c.status === status).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Globe Clients</h1>
        <p className="text-sm text-muted">
          {clients.length} total · {count("ACTIVE")} active ·{" "}
          {count("EXPIRING_SOON")} expiring soon · {count("EXPIRED")} expired
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 text-left">
              <tr>
                <th className="p-3 font-medium">Name</th>
                <th className="p-3 font-medium">Contract start</th>
                <th className="p-3 font-medium">Contract end</th>
                <th className="p-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3">{c.contract_start}</td>
                  <td className="p-3">{c.contract_end}</td>
                  <td className="p-3">{STATUS_LABEL[c.status] ?? c.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}