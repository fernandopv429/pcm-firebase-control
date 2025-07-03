import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

export const KPICard = ({ title, value, subtitle, icon, trend, trendValue }: KPICardProps) => {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-status-success";
      case "down":
        return "text-status-error";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <Card className="bg-gradient-card shadow-card border-border/50 hover:shadow-elevated transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-primary">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {subtitle && (
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">{subtitle}</p>
            {trendValue && (
              <span className={`text-xs font-medium ${getTrendColor()}`}>
                {trendValue}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};