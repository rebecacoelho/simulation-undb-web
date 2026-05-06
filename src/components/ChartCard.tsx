import { Card } from "@/components/ui/card";

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}

export const ChartCard = ({ title, description, children, action }: ChartCardProps) => (
  <Card className="border-border/60 bg-card/60 backdrop-blur p-5 shadow-[var(--shadow-card)]">
    <div className="flex items-start justify-between mb-4 gap-4">
      <div>
        <h3 className="text-base font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {action}
    </div>
    {children}
  </Card>
);
