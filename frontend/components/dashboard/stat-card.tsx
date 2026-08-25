import { Card, CardContent, CardTitle } from "@/components/ui/card";

export function StatCard({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value?: number;
}) {
  return (
    <Card>
      <CardTitle>{label}</CardTitle>
      <CardContent
        data-placeholder={value === undefined ? label : undefined}
        className={value === undefined ? "text-muted" : "text-2xl font-semibold"}
      >
        {value === undefined ? "—" : value}
      </CardContent>
      <p className="mt-1 text-xs text-muted">{hint}</p>
    </Card>
  );
}