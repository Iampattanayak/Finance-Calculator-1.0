
import React from 'react';
import { cn } from '@/lib/utils';

interface ResultDisplayProps {
  label: string;
  value: string | number;
  highlightColor?: string;
  className?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({
  label,
  value,
  highlightColor = "bg-primary/10",
  className,
  subtitle,
  icon,
  children,
}) => {
  return (
    <div className={cn(
      "flex flex-col p-4 rounded-lg transition-all duration-300",
      "animate-fade-in border border-border/60 relative",
      highlightColor,
      className
    )}>
      {children}
      <div className="flex items-center mb-1">
        {icon && <span className="mr-2">{icon}</span>}
        <p className="text-sm font-medium text-foreground/70">{label}</p>
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-2xl font-semibold tracking-tight">{value}</p>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
};

export default ResultDisplay;
