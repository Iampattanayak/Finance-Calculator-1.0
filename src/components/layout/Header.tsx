import React from 'react';
import { Calculator, LineChart, BadgePercent, Landmark, Coins, Wallet, BarChart2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeaderProps {
  activeCalculator: string;
  onChangeCalculator: (calculator: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeCalculator, onChangeCalculator }) => {
  const menuItems = [
    { id: 'emi', label: 'EMI Calculator', icon: <Calculator className="w-4 h-4" /> },
    { id: 'loan-comparison', label: 'Loan Comparison', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'sip', label: 'SIP Calculator', icon: <LineChart className="w-4 h-4" /> },
    { id: 'gst', label: 'GST Calculator', icon: <BadgePercent className="w-4 h-4" /> },
    { id: 'fd', label: 'FD Calculator', icon: <Landmark className="w-4 h-4" /> },
    { id: 'rd', label: 'RD Calculator', icon: <Coins className="w-4 h-4" /> },
    { id: 'ppf', label: 'PPF Calculator', icon: <Wallet className="w-4 h-4" /> },
  ];

  return (
    <header className="w-full py-4 px-4 sm:px-6 border-b border-border/60 bg-white/80 backdrop-blur-sm sticky top-0 z-10 animate-slide-down">
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-2">
            <Calculator className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold tracking-tight">Finance Calculator</h1>
          </div>
          
          <nav>
            <ul className="flex items-center space-x-1 p-1 bg-muted/50 rounded-lg overflow-x-auto hide-scrollbar">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => onChangeCalculator(item.id)}
                    className={cn(
                      "inline-flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-all duration-200",
                      "button-press",
                      activeCalculator === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted/80 text-foreground/70"
                    )}
                  >
                    {item.icon}
                    <span className="hidden sm:inline-block">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
