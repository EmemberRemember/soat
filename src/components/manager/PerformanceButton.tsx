import { LucideIcon } from "lucide-react";
import { Button } from "../ui/button";

interface PerformanceButtonProps {
    onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
    label?: string;
    className?: string;
    Icon?: LucideIcon;
}
export function PerformanceButton({
  Icon,
  label,
  onClick,
  className
}: PerformanceButtonProps) {

  const renderIcon = () => {
    if (Icon) {
        return <Icon className="h-4 w-4 mr-1"/>
    }
  }
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={`flex justify-start items-center w-full rounded-none text-sm font-medium py-2 h-auto
      hover:bg-muted hover:text-foreground
      ${className}`}
    >
      {renderIcon()}
      {label}
    </Button>
  );
}
