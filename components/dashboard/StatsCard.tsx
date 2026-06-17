import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  subValue?: string;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  trend?: "up" | "down" | "neutral";
  className?: string;
}

export function StatsCard({
  title,
  value,
  subValue,
  change,
  icon: Icon,
  iconColor = "text-indigo-400",
  trend,
  className,
}: StatsCardProps) {
  const isPositive = trend === "up" || (change !== undefined && change > 0);
  const isNegative = trend === "down" || (change !== undefined && change < 0);

  return (
    <Card className={cn("hover:border-zinc-700 transition-colors", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          <div className={cn("w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center", iconColor)}>
            <Icon className="w-4 h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className={cn(
          "text-2xl font-bold tracking-tight",
          isPositive && "text-emerald-400",
          isNegative && "text-red-400",
          !isPositive && !isNegative && "text-white"
        )}>
          {value}
        </div>
        {(subValue || change !== undefined) && (
          <div className="mt-1 flex items-center gap-2">
            {subValue && <span className="text-xs text-zinc-500">{subValue}</span>}
            {change !== undefined && (
              <span className={cn(
                "text-xs font-medium",
                change > 0 ? "text-emerald-400" : change < 0 ? "text-red-400" : "text-zinc-500"
              )}>
                {change > 0 ? "+" : ""}{change.toFixed(1)}%
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
