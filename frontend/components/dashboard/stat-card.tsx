import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { ArrowUp, CalendarDays, FileCheck2, Globe2, MessagesSquare, UsersRound } from "lucide-react";

const icons = [UsersRound, Globe2, UsersRound, FileCheck2, MessagesSquare, CalendarDays];
const colors = ["bg-blue-50 text-blue-500", "bg-emerald-50 text-emerald-500", "bg-amber-50 text-amber-500", "bg-blue-50 text-blue-500", "bg-orange-50 text-orange-500", "bg-blue-50 text-blue-500"];

export function StatCard({
  label,
  hint,
  value,
  index = 0,
}: {
  label: string;
  hint: string;
  value?: number;
  index?: number;
}) {
  const Icon = icons[index % icons.length];
  return (
    <Card className="min-h-[140px] p-4"><div className={`mb-3 grid size-8 place-items-center rounded-lg ${colors[index % colors.length]}`}><Icon size={16} /></div>
      <CardTitle className="text-[10px] normal-case tracking-normal">{label}</CardTitle>
      <CardContent
        data-placeholder={value === undefined ? label : undefined}
        className={value === undefined ? "text-muted" : "text-2xl font-semibold"}
      >
        {value === undefined ? "—" : value}
      </CardContent>
      {index === 0 ? <p className="mt-1 flex items-center gap-1 text-[10px] font-bold text-emerald-500"><ArrowUp size={11} /> 6% vs last month</p> : <p className="mt-1 text-[10px] text-muted">{hint}</p>}
    </Card>
  );
}