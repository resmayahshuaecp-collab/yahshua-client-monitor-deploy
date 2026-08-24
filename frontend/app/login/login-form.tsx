"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginErrorBody = {
  message?: string;
};

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok) {
        const body = (await response.json().catch(() => ({}))) as LoginErrorBody;
        setError(body.message ?? "Sign in failed.");
        return;
      }
      router.push("/dashboard");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="email" className="text-sm text-muted">
          Email
        </label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="password" className="text-sm text-muted">
          Password
        </label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      <Button type="submit" disabled={busy} className="w-full">
        Sign in
      </Button>
    </form>
  );
}
