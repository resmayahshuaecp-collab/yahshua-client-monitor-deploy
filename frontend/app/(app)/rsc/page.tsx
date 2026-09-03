"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data = [], refetch } = useQuery({
    queryKey: ["rsc"],
    queryFn: async () => {
      const res = await api.get<Rsc[]>("/concerns/rsc");
      return res.data;
    },
  });

  const createRsc = async () => {
    if (!title.trim()) return;
    
    setIsCreating(true);
    setError(null);
    
    try {
      await api.post("/concerns/rsc", { title, priority });
      setTitle("");
      setPriority("MEDIUM");
      
      // Refetch all related queries
      await refetch();
      
      // Invalidate dashboard report queries to update the counts
      await queryClient.invalidateQueries({ queryKey: ["rsc-report-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["concern-stats"] });
    } catch (err) {
      let message = "Failed to create RSC request";
      
      if (err instanceof Error) {
        message = err.message;
      } else if (typeof err === "object" && err !== null) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const error = err as any;
        // Check for Refusal response with code and message
        if (error.response?.data?.code && error.response?.data?.message) {
          const code = error.response.data.code;
          const msg = error.response.data.message;
          // Map error codes to user-friendly messages
          if (code === "not_authenticated") {
            message = "Your session has expired. Please log in again.";
          } else if (code === "csrf_failed") {
            message = "Security validation failed. Please refresh and try again.";
          } else if (code === "no_role") {
            message = "Your account does not have a role assigned.";
          } else if (code === "role_not_permitted") {
            message = "You do not have permission to create RSC requests.";
          } else {
            message = msg;
          }
        } else if (error.response?.data?.detail) {
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
      console.error("Error creating RSC request:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const changeStatus = async (id: number, status: string) => {
    try {
      await api.put(`/concerns/rsc/${id}`, { status });
      await refetch();
      // Invalidate dashboard reports when RSC status changes
      await queryClient.invalidateQueries({ queryKey: ["rsc-report-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["concern-stats"] });
    } catch (err) {
      console.error("Error updating RSC status:", err);
    }
  };

  const changePriority = async (id: number, p: string) => {
    try {
      await api.put(`/concerns/rsc/${id}`, { priority: p });
      await refetch();
      // Invalidate dashboard reports when RSC priority changes
      await queryClient.invalidateQueries({ queryKey: ["rsc-report-summary"] });
      await queryClient.invalidateQueries({ queryKey: ["concern-stats"] });
    } catch (err) {
      console.error("Error updating RSC priority:", err);
    }
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
        <div className="p-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="New request title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && title.trim() && !isCreating) {
                  createRsc();
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
              onClick={createRsc} 
              disabled={!title.trim() || isCreating}
            >
              {isCreating ? "Adding..." : "Add Request"}
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