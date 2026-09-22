"use client";

import { useState } from "react";
import { Bot, Sparkles } from "lucide-react";

import { currentClientStatus, type Client } from "@/lib/clients";

interface BugReportSummary {
  total: number;
  open: number;
  in_progress: number;
  resolved: number;
}

interface RscReportSummary {
  total: number;
  open: number;
  in_progress: number;
  completed: number;
}

interface ContractReportSummary {
  total: number;
  active: number;
  expiring_soon: number;
  expired: number;
}

interface AiSupportProps {
  clients: Client[];
  bugReport?: BugReportSummary;
  rscReport?: RscReportSummary;
  contractReport?: ContractReportSummary;
}

const SUGGESTIONS = [
  "Open bugs this month",
  "Expiring contracts",
  "Top active clients",
  "How to create RSC report?",
];

function plural(n: number, word: string, pluralWord = `${word}s`) {
  return `${n} ${n === 1 ? word : pluralWord}`;
}

const FALLBACK =
  "I can't answer that one yet. Try one of the suggested questions below, or ask about clients, bugs, contracts, or reports.";

export function AiSupport({
  clients,
  bugReport,
  rscReport,
  contractReport,
}: AiSupportProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<string | null>(null);

  function answerFor(raw: string): string {
    const q = raw.toLowerCase();

    if (q.includes("bug")) {
      if (!bugReport) return "I'm still loading the bug data — try again in a moment.";
            return `Bugs: ${plural(bugReport.open, "open bug")}, ${bugReport.in_progress} in progress, and ${bugReport.resolved} resolved (${bugReport.total} total).`;
    }

    if (q.includes("contract") || q.includes("expiring") || q.includes("expire")) {
      if (!contractReport)
        return "I'm still loading the contract data — try again in a moment.";
            return `Of ${plural(contractReport.total, "contract")}: ${contractReport.active} active, ${contractReport.expiring_soon} expiring soon, and ${contractReport.expired} expired.`;
    }

    if (q.includes("rsc") && (q.includes("how") || q.includes("create") || q.includes("make"))) {
      return "Go to Client Concerns → Request for System Customization, type a title, pick a priority, and click Add Request. You can view the summary under Reports → Request for System Customization.";
    }

    if (q.includes("rsc") || q.includes("customization")) {
      if (!rscReport) return "I'm still loading the RSC data — try again in a moment.";
            return `RSC requests: ${plural(rscReport.open, "open request")}, ${rscReport.in_progress} in progress, and ${rscReport.completed} completed (${rscReport.total} total).`;
    }

    if (q.includes("client") || q.includes("globe") || q.includes("sme")) {
      const globe = clients.filter((c) => c.segment === "GLOBE").length;
      const sme = clients.filter((c) => c.segment === "SME").length;
      const active = clients.filter((c) => currentClientStatus(c) === "ACTIVE").length;
            return `You have ${plural(clients.length, "client")}: ${globe} Globe and ${sme} SME, with ${plural(active, "active contract")} overall.`;
    }

    if (q.includes("meeting")) {
      return "You can view and book meetings under Client Concerns → Book Meetings.";
    }

    return FALLBACK;
  }

  function ask(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;
    setAnswer(answerFor(trimmed));
    setQuestion("");
  }

  return (
    <div className="min-h-44 rounded-xl border border-line bg-surface p-5 lg:col-span-3">
      <h2 className="flex items-center gap-2 text-sm font-bold">
        <Sparkles size={16} className="text-violet-500" /> AI Support
        <span className="ml-auto rounded-full bg-violet-100 px-2 py-1 text-[9px] text-violet-500">
          BETA
        </span>
      </h2>

      <p className="mt-4 inline-block rounded-lg bg-canvas px-3 py-2 text-xs">
        Ask me anything about YBO, clients, reports, or system usage.
      </p>

      {answer && (
        <p className="mt-3 inline-block rounded-lg bg-canvas px-3 py-2 text-xs" role="status">
          {answer}
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <input
          aria-label="AI question"
          placeholder="Type your question here..."
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") ask(question);
          }}
          className="h-9 min-w-0 flex-1 rounded-lg border border-line px-3 text-xs outline-none"
        />
        <button
          aria-label="Ask AI"
          onClick={() => ask(question)}
          className="grid size-9 place-items-center rounded-lg bg-blue-600 text-white"
        >
          <Bot size={16} />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => ask(s)}
            className="rounded-full border border-line px-3 py-1 text-[10px] text-muted transition hover:border-blue-300 hover:text-blue-600"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}