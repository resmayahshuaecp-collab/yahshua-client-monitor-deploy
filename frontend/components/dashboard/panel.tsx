import type { ReactNode } from "react";
import { Card, CardTitle } from "@/components/ui/card";

export function Panel({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card>
      <CardTitle className="normal-case text-sm text-ink">{title}</CardTitle>
      <div
        data-placeholder={title}
        className="flex h-40 items-center justify-center text-sm text-muted"
      >
        {children ?? "No data yet"}
      </div>
    </Card>
  );
}
