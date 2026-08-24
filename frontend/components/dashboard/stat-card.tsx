import { Card, CardContent, CardTitle } from "@/components/ui/card";

/**
 * A stat card with no data behind it.
 *
 * data-placeholder is deliberate: it makes every unwired value findable
 * with one grep when a later milestone wires them, and it lets the test
 * assert this screen is still a shell.
 */
export function StatCard({ label, hint }: { label: string; hint: string }) {
  return (
    <Card>
      <CardTitle>{label}</CardTitle>
      <CardContent data-placeholder={label} className="text-muted">
        —
      </CardContent>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}
