"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Rsc {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

const STATUSES = ["OPEN", "IN_PROGRESS", "COMPLETED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function RscPage() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const { data = [], refetch } = useQuery({
    queryKey: ["rsc"],
    queryFn: async () => {
      const res = await api.get<Rsc[]>("/concerns/rsc");
      return res.data;
    },
  });

  const createRsc = async () => {
    if (!title.trim()) return;
    await api.post("/concerns/rsc", { title, priority });
    setTitle("");
    setPriority("MEDIUM");
    refetch();
  };

  const changeStatus = async (id: number, status: string) => {
    await api.put(`/concerns/rsc/${id}`, { status });
    refetch();
  };

  const changePriority = async (id: number, p: string) => {
    await api.put(`/concerns/rsc/${id}`, { priority: p });
    refetch();
  };

  const items =
    filterPriority === "ALL"
      ? data
      : data.filter((r) => r.priority === filterPriority);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Request for System Customization</h1>
        <p className="text-sm text-muted">Track and manage customization requests.</p>
      </div>

      <Card>
        <div className="flex gap-2 p-4">
          <Input
            type="text"
            placeholder="New request title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1"
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="rounded border px-2 text-sm"
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {LABEL[p]}
              </option>
            ))}
          </select>
          <Button onClick={createRsc} disabled={!title.trim()}>
            Add Request
          </Button>
        </div>
      </Card>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted">Filter by priority:</span>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="rounded border px-2 py-1 text-sm"
        >
          <option value="ALL">All</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {LABEL[p]}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Priority</th>
              <th className="p-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} className="border-t">
                <td className="p-3">{r.title}</td>
                <td className="p-3">
                  <select
                    value={r.priority}
                    onChange={(e) => changePriority(r.id, e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p} value={p}>
                        {LABEL[p]}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3">
                  <select
                    value={r.status}
                    onChange={(e) => changeStatus(r.id, e.target.value)}
                    className="rounded border px-2 py-1 text-xs"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {LABEL[s]}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}