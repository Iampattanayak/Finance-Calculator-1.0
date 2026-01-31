
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CalculatorCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  highlight?: boolean;
}

const CalculatorCard: React.FC<CalculatorCardProps> = ({
  title,
  description,
  children,
  className,
  highlight = false,
}) => {
  return (
    <Card className={cn(
      "w-full overflow-hidden transition-all duration-300",
      "border border-border/60 shadow-smooth",
      "animate-scale-in",
      highlight ? "card-highlight glass-card" : "bg-card",
      className
    )}>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-medium tracking-tight">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default CalculatorCard;
