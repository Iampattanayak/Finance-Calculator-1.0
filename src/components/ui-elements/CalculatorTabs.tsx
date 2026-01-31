
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface CalculatorTabsProps {
  tabs: Tab[];
  defaultTab?: string;
  className?: string;
  onChange?: (value: string) => void;
}

const CalculatorTabs: React.FC<CalculatorTabsProps> = ({
  tabs,
  defaultTab,
  className,
  onChange,
}) => {
  const defaultValue = defaultTab || tabs[0]?.id || '';

  return (
    <Tabs 
      defaultValue={defaultValue} 
      className={cn("w-full", className)}
      onValueChange={onChange}
    >
      <TabsList className="grid grid-cols-2 sm:grid-cols-4 mb-6 w-full">
        {tabs.map((tab) => (
          <TabsTrigger 
            key={tab.id}
            value={tab.id}
            className="text-xs sm:text-sm py-2 transition-all duration-300"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      
      {tabs.map((tab) => (
        <TabsContent 
          key={tab.id} 
          value={tab.id}
          className="animate-fade-in"
        >
          {tab.content}
        </TabsContent>
      ))}
    </Tabs>
  );
};

export default CalculatorTabs;
