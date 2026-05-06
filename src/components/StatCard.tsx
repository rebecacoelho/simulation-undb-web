import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon: LucideIcon;
}

export const StatCard = ({ label, value, hint, icon: Icon }: StatCardProps) => (
  <Card className="border-border bg-card p-5">
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1.5 min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
        <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground truncate">{hint}</p>}
      </div>
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-1" strokeWidth={1.5} />
    </div>
  </Card>
);
