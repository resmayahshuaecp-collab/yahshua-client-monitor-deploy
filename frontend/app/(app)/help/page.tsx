"use client";

import { Card } from "@/components/ui/card";

const SECTIONS = [
  { title: "Dashboard", body: "An overview of clients, open concerns, and meetings this week, with quick links to each section." },
  { title: "Subscription Clients", body: "View Globe and SME clients with their contract dates and status (Active, Expiring Soon, Expired)." },
  { title: "Communication", body: "Group chats and channels for clients, consultants, and system engineers. You can edit or delete your own messages." },
  { title: "Client Concerns", body: "Log and track Bugs and system customization requests (RSC), set priority, update status, and book meetings." },
  { title: "Reports", body: "Summaries of bugs, RSC, and contract monitoring for an at-a-glance view of overall status." },
  { title: "Consultant Onboarding", body: "Training videos, materials, and client contract references for onboarding." },
];

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Help &amp; Support</h1>
        <p className="text-sm text-muted">How to use the Subscription Management System.</p>
      </div>

      <div className="space-y-3">
        {SECTIONS.map((s) => (
          <Card key={s.title}>
            <div className="p-4">
              <h2 className="text-sm font-semibold">{s.title}</h2>
              <p className="mt-1 text-xs text-muted">{s.body}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <div className="p-4 text-xs text-muted">
          Need more help? Contact the delivery team lead or your system administrator.
        </div>
      </Card>
    </div>
  );
}