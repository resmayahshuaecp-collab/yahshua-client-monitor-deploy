"use client";

import Link from "next/link";
import { ArrowRight, BarChart3, Bug, Wrench, FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="mt-1 text-sm text-muted">View detailed reports on bugs, RSC requests, and contracts</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/reports/bugs">
          <div className="rounded-xl border border-line bg-surface p-6 transition hover:border-blue-300 hover:shadow-sm cursor-pointer">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-red-50">
              <Bug size={24} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold">Bugs Report</h2>
            <p className="mt-2 text-sm text-muted">Track and monitor all bugs in the system with priority and status breakdowns</p>
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              View Report <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        </Link>

        <Link href="/reports/rsc">
          <div className="rounded-xl border border-line bg-surface p-6 transition hover:border-blue-300 hover:shadow-sm cursor-pointer">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-amber-50">
              <Wrench size={24} className="text-amber-600" />
            </div>
            <h2 className="text-lg font-semibold">RSC Report</h2>
            <p className="mt-2 text-sm text-muted">Monitor request for system customization records and their completion status</p>
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              View Report <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        </Link>

        <Link href="/reports/contracts">
          <div className="rounded-xl border border-line bg-surface p-6 transition hover:border-blue-300 hover:shadow-sm cursor-pointer">
            <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-green-50">
              <FileText size={24} className="text-green-600" />
            </div>
            <h2 className="text-lg font-semibold">Contracts Monitoring</h2>
            <p className="mt-2 text-sm text-muted">Monitor contract statuses, expiration dates, and identify contracts requiring attention</p>
            <div className="mt-4 flex items-center text-sm font-medium text-blue-600">
              View Report <ArrowRight size={16} className="ml-2" />
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
