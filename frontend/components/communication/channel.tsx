"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
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
  updated_at: string;
  is_edited: boolean;
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
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const { data: user } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const res = await api.get("/auth/me");
      return res.data;
    },
  });

  useEffect(() => {
    if (user?.user_id) {
      setCurrentUserId(user.user_id);
    }
  }, [user]);

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

  const handleEditMessage = async (messageId: number) => {
    if (!editText.trim()) return;
    try {
      await api.put(`/messaging/messages/${messageId}`, {
        text: editText,
      });
      setEditingId(null);
      setEditText("");
      refetch();
    } catch (error) {
      console.error("Failed to edit message:", error);
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/messaging/messages/${messageId}`);
      refetch();
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const startEdit = (message: Message) => {
    setEditingId(message.id);
    setEditText(message.text);
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
          <div className="flex-1 overflow-y-auto space-y-3">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-muted">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="border-l-2 border-gray-200 pl-3 py-2 group hover:bg-gray-50 pr-2 rounded"
                >
                  {editingId === msg.id ? (
                    <div className="space-y-2">
                      <Input
                        type="text"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="text-sm"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleEditMessage(msg.id)}
                          disabled={!editText.trim()}
                        >
                          Save
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditText("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-medium text-sm">{msg.sender.username}</span>
                          <span className="text-xs text-muted">
                            {new Date(msg.created_at).toLocaleTimeString()}
                          </span>
                          {msg.is_edited && (
                            <span className="text-xs text-muted italic">(edited)</span>
                          )}
                        </div>
                        <p className="text-sm text-ink mt-1">{msg.text}</p>
                      </div>
                      {currentUserId === msg.sender.id && (
                        <div className="flex gap-1 flex-shrink-0">
                          <Button
                            variant="ghost"
                            onClick={() => startEdit(msg)}
                            className="h-6 px-2 text-xs whitespace-nowrap text-blue-600 hover:text-blue-700"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 whitespace-nowrap"
                          >
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
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