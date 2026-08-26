"use client";

import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Message {
  id: number;
  sender: {
    id: number;
    username: string;
    email: string;
  };
  text: string;
  created_at: string;
}

interface Conversation {
  id: number;
  type: string;
  created_at: string;
  updated_at: string;
  messages: Message[];
}

export function CommunicationChannel({ conversationType }: { conversationType: string }) {
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch conversations to find the one matching this type
  const { data: conversations = [], refetch } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const res = await api.get<Conversation[]>("/messaging/conversations");
      return res.data;
    },
  });

  const currentConversation = conversations.find((c) => c.type === conversationType);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentConversation || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await api.post(`/messaging/conversations/${currentConversation.id}/messages`, {
        text: newMessage,
      });
      setNewMessage("");
      refetch();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const messages = currentConversation?.messages || [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-semibold">
          {currentConversation?.type.replace(/_/g, " ").toUpperCase() || "Channel"}
        </h1>
        <p className="text-sm text-muted">Team communication and updates.</p>
      </div>

      <Card>
        <div className="flex flex-col h-96 gap-4 p-4">
          {/* Messages container */}
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-baseline gap-2">
                    <span className="font-medium text-sm">{msg.sender.username}</span>
                    <span className="text-xs text-muted">
                      {new Date(msg.created_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm text-ink">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          {/* Message input */}
          <form onSubmit={handleSendMessage} className="flex gap-2 border-t pt-4">
            <Input
              type="text"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isSubmitting}
              className="flex-1"
            />
            <Button type="submit" disabled={isSubmitting || !newMessage.trim()}>
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
