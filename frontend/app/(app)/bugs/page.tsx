"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Bug {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
}

const STATUSES = ["OPEN", "IN_PROGRESS", "RESOLVED"];
const PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const LABEL: Record<string, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function BugsPage() {
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [filterPriority, setFilterPriority] = useState("ALL");

  const { data = [], refetch } = useQuery({
    queryKey: ["bugs"],
    queryFn: async () => {
      const res = await api.get<Bug[]>("/concerns/bugs");
      return res.data;
    },
  });

  const createBug = async () => {
    if (!title.trim()) return;
    await api.post("/concerns/bugs", { title, priority });
    setTitle("");
    setPriority("MEDIUM");
    refetch();
  };

  const changeStatus = async (id: number, status: string) => {
    await api.put(`/concerns/bugs/${id}`, { status });
    refetch();
  };

  const changePriority = async (id: number, p: string) => {
    await api.put(`/concerns/bugs/${id}`, { priority: p });
    refetch();
  };

  const bugs =
    filterPriority === "ALL"
      ? data
      : data.filter((b) => b.priority === filterPriority);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Bugs</h1>
        <p className="text-sm text-muted">Track and manage bug tickets.</p>
      </div>

      <Card>
        <div className="flex gap-2 p-4">
          <Input
            type="text"
            placeholder="New bug title..."
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
          <Button onClick={createBug} disabled={!title.trim()}>
            Add Bug
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
            {bugs.map((b) => (
              <tr key={b.id} className="border-t">
                <td className="p-3">{b.title}</td>
                <td className="p-3">
                  <select
                    value={b.priority}
                    onChange={(e) => changePriority(b.id, e.target.value)}
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
                    value={b.status}
                    onChange={(e) => changeStatus(b.id, e.target.value)}
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