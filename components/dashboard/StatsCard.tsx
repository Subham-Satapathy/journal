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
      <CardHeader className="pb-0">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-xs sm:text-sm leading-tight">{title}</CardTitle>
          <div className={cn("w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-zinc-800 flex items-center justify-center shrink-0", iconColor)}>
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-2">
        <div className={cn(
          "text-[clamp(0.8rem,3.8vw,1.5rem)] font-bold tracking-tight tabular-nums leading-tight",
          isPositive && "text-emerald-400",
          isNegative && "text-red-400",
          !isPositive && !isNegative && "text-white"
        )}>
          {value}
        </div>
        {(subValue || change !== undefined) && (
          <div className="mt-1.5 flex items-center gap-2 min-w-0">
            {subValue && <span className="text-[10px] sm:text-xs text-zinc-500 truncate">{subValue}</span>}
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
