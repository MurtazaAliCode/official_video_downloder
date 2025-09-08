import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function ProgressBar({ 
  value, 
  className, 
  showLabel = true,
  label = "Progress" 
}: ProgressBarProps) {
  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{label}</span>
          <span data-testid="progress-percentage">{Math.round(value)}%</span>
        </div>
      )}
      <Progress 
        value={value} 
        className={cn("progress-bar h-3", className)}
        data-testid="progress-bar"
      />
    </div>
  );
}
