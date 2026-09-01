"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Meeting {
  id: number;
  title: string;
  description: string;
  scheduled_for: string;
  created_at: string;
}

const LABELS = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

export default function MeetingsPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledFor, setScheduledFor] = useState("");

  const { data = [], refetch } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      const res = await api.get<Meeting[]>("/concerns/meetings");
      return res.data;
    },
  });

  const createMeeting = async () => {
    if (!title.trim() || !scheduledFor) return;

    await api.post("/concerns/meetings", {
      title,
      description,
      scheduled_for: scheduledFor,
    });

    setTitle("");
    setDescription("");
    setScheduledFor("");
    refetch();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Book Meetings</h1>
        <p className="text-sm text-muted">Schedule client meetings and keep track of upcoming sessions.</p>
      </div>

      <Card>
        <div className="space-y-3 p-4">
          <Input
            type="text"
            placeholder="Meeting title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Input
            type="text"
            placeholder="Description (optional)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-2">
            <Input
              type="datetime-local"
              value={scheduledFor}
              onChange={(e) => setScheduledFor(e.target.value)}
              className="flex-1"
            />
            <Button onClick={createMeeting} disabled={!title.trim() || !scheduledFor}>
              Add Meeting
            </Button>
          </div>
        </div>
      </Card>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Title</th>
              <th className="p-3 font-medium">Description</th>
              <th className="p-3 font-medium">Scheduled</th>
            </tr>
          </thead>
          <tbody>
            {data.map((meeting) => (
              <tr key={meeting.id} className="border-t">
                <td className="p-3">{meeting.title}</td>
                <td className="p-3 text-muted">{meeting.description || "—"}</td>
                <td className="p-3">
                  {new Date(meeting.scheduled_for).toLocaleString([], {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
