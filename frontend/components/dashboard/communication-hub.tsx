"use client";

import { useQuery } from "@tanstack/react-query";
import { Panel } from "@/components/dashboard/panel";
import { api } from "@/lib/api";
import Link from "next/link";

interface Conversation {
  id: number;
  type: string;
  messages: Array<{ id: number }>;
}

const CHANNEL_LINKS: Record<string, string> = {
  GLOBE_CHAT: "/communication/globe-chat",
  SME_CHAT: "/communication/sme-chat",
  CONSULTANT_CHANNEL: "/communication/consultant-channel",
  ENGINEER_CHANNEL: "/communication/engineer-channel",
};

const CHANNEL_LABELS: Record<string, string> = {
  GLOBE_CHAT: "Globe Group Chat",
  SME_CHAT: "SME Group Chat",
  CONSULTANT_CHANNEL: "Consultant Channel",
  ENGINEER_CHANNEL: "System Engineer Channel",
};

export function CommunicationHub() {
  const { data: conversations = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get<Conversation[]>("/messaging/conversations");
      return res.data;
    },
  });

  return (
    <Panel title="Communication Hub">
      <div className="space-y-2 w-full p-2">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={CHANNEL_LINKS[conv.type] || "#"}
            className="block p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{CHANNEL_LABELS[conv.type] || conv.type}</span>
              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {conv.messages.length} messages
              </span>
            </div>
          </Link>
        ))}
      </div>
    </Panel>
  );
}
