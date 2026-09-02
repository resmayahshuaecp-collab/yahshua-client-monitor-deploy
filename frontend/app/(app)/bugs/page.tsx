"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data = [], refetch } = useQuery({
    queryKey: ["bugs"],
    queryFn: async () => {
      const res = await api.get<Bug[]>("/concerns/bugs");
      return res.data;
    },
  });

  const createBug = async () => {
    if (!title.trim()) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      await api.post("/concerns/bugs", { title, priority });
      setTitle("");
      setPriority("MEDIUM");
      
      // Refetch all related queries
      await refetch();
      
      // Invalidate dashboard report queries to update the counts
      await queryClient.invalidateQueries({ queryKey: ["bug-report-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["concern-stats"] });
    } catch (err) {
      let message = "Failed to create bug";
      
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null) {
        const error = err as any;
        if (error.response?.data?.detail) {
          message = error.response.data.detail;
        } else if (error.response?.data?.message) {
          message = error.response.data.message;
        } else if (error.response?.statusText) {
          message = `${error.response.status} ${error.response.statusText}`;
        } else if (error.message) {
          message = error.message;
        }
      }
      
      setError(message);
      console.error("Error creating bug:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const changeStatus = async (id: number, status: string) => {
    try {
      await api.put(`/concerns/bugs/${id}`, { status });
      await refetch();
      // Invalidate dashboard reports when bug status changes
      await queryClient.invalidateQueries({ queryKey: ["bug-report-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["concern-stats"] });
    } catch (err) {
      console.error("Error updating bug status:", err);
    }
  };

  const changePriority = async (id: number, p: string) => {
    try {
      await api.put(`/concerns/bugs/${id}`, { priority: p });
      await refetch();
      // Invalidate dashboard reports when bug priority changes
      await queryClient.invalidateQueries({ queryKey: ["bug-report-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["concern-stats"] });
    } catch (err) {
      console.error("Error updating bug priority:", err);
    }
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
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="New bug title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim() && !isCreating) {
                  createBug();
                }
              }}
              className="flex-1"
              disabled={isCreating}
            />
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="rounded border px-2 text-sm"
              disabled={isCreating}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {LABEL[p]}
                </option>
              ))}
            </select>
            <Button 
              onClick={createBug} 
              disabled={!title.trim() || isCreating}
            >
              {isCreating ? "Adding..." : "Add Bug"}
            </Button>
          </div>
          {error && (
            <p className="mt-2 text-sm text-red-600">{error}</p>
          )}
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