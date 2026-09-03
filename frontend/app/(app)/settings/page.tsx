"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchActor } from "@/lib/actor";
import { Card } from "@/components/ui/card";

const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  CONSULTANT: "Consultant",
  ENGINEER: "System Engineer",
};

export default function SettingsPage() {
  const { data: actor } = useQuery({ queryKey: ["actor"], queryFn: fetchActor });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Settings</h1>
        <p className="text-sm text-muted">Your account details.</p>
      </div>

      <Card>
        <div className="space-y-4 p-5 text-sm">
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-muted">Name</span>
            <span className="font-medium">{actor?.name ?? "—"}</span>
          </div>
          <div className="flex justify-between border-b border-line pb-3">
            <span className="text-muted">Email</span>
            <span className="font-medium">{actor?.email ?? "—"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Role</span>
            <span className="font-medium">
              {actor?.role ? ROLE_LABEL[actor.role] ?? actor.role : "No role assigned"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}