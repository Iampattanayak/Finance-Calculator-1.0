
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowUp, ArrowDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import CalculatorInput from '../ui-elements/CalculatorInput';
import CalculatorCard from '../ui-elements/CalculatorCard';
import ResultDisplay from '../ui-elements/ResultDisplay';
import LineChart from '../charts/LineChart';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';

// Credit score category ranges
const creditScoreRanges = [
  { min: 300, max: 579, category: 'Poor', color: 'text-red-500' },
  { min: 580, max: 669, category: 'Fair', color: 'text-amber-500' },
  { min: 670, max: 739, category: 'Good', color: 'text-blue-500' },
  { min: 740, max: 799, category: 'Very Good', color: 'text-emerald-500' },
  { min: 800, max: 850, category: 'Excellent', color: 'text-green-600' }
];

// Get credit score category based on score
const getCreditScoreCategory = (score: number) => {
  return creditScoreRanges.find(range => score >= range.min && score <= range.max) || 
    { category: 'Unknown', color: 'text-gray-500' };
};

const CreditScoreImpactCalculator: React.FC = () => {
  // State for the score and factors
  const [currentScore, setCurrentScore] = useState(650);
  const [factors, setFactors] = useState([
    { id: 'late_payment', name: 'Late Payment', impact: -50, selected: false },
    { id: 'credit_inquiry', name: 'Credit Inquiry', impact: -10, selected: false },
    { id: 'new_credit_card', name: 'New Credit Card', impact: -25, selected: false },
    { id: 'loan_application', name: 'Loan Application', impact: -20, selected: false },
    { id: 'debt_settlement', name: 'Debt Settlement', impact: -45, selected: false },
    { id: 'bankruptcy', name: 'Bankruptcy', impact: -150, selected: false },
    { id: 'on_time_payments', name: 'Consistent On-Time Payments', impact: 30, selected: false },
    { id: 'credit_limit_increase', name: 'Credit Limit Increase', impact: 15, selected: false },
    { id: 'pay_down_debt', name: 'Pay Down Debt', impact: 40, selected: false },
    { id: 'old_account', name: 'Keep Old Accounts Open', impact: 25, selected: false },
  ]);

  // Calculate the projected score
  const [projectedScore, setProjectedScore] = useState(currentScore);
  
  // Calculate the score impact
  useEffect(() => {
    let impact = 0;
    factors.forEach(factor => {
      if (factor.selected) {
        impact += factor.impact;
      }
    });
    
    // Make sure the score stays within the valid range (300-850)
    const newScore = Math.min(850, Math.max(300, currentScore + impact));
    setProjectedScore(newScore);
  }, [currentScore, factors]);

  // Toggle factor selection
  const toggleFactor = (id: string) => {
    setFactors(factors.map(factor => 
      factor.id === id ? { ...factor, selected: !factor.selected } : factor
    ));
  };

  // Reset all selections
  const resetSelections = () => {
    setFactors(factors.map(factor => ({ ...factor, selected: false })));
  };

  // Get current and projected score categories
  const currentCategory = getCreditScoreCategory(currentScore);
  const projectedCategory = getCreditScoreCategory(projectedScore);

  // Prepare data for the chart
  const chartData = factors
    .filter(factor => factor.selected)
    .map(factor => ({
      name: factor.name,
      Impact: Math.abs(factor.impact),
      positive: factor.impact > 0
    }));

  // Sort factors by impact for visual clarity
  const sortedChartData = [...chartData].sort((a, b) => b.Impact - a.Impact);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Input Section */}
      <div className="lg:col-span-1 space-y-6">
        <CalculatorCard 
          title="Credit Score Impact Calculator" 
          description="Estimate how your actions might affect your credit score"
        >
          <div className="space-y-6">
            <CalculatorInput
              id="credit-score"
              label="Current Credit Score"
              value={currentScore}
              onChange={setCurrentScore}
              min={300}
              max={850}
              step={1}
              showSlider={true}
              placeholder="Enter your current credit score"
            />
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Select factors that apply:</h3>
              
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-red-500">Negative Factors</h4>
                {factors.filter(f => f.impact < 0).map(factor => (
                  <div
                    key={factor.id}
                    className={`p-2 rounded-md flex items-center justify-between cursor-pointer border transition-colors ${
                      factor.selected
                        ? 'border-red-400 bg-red-50 dark:bg-red-950 dark:border-red-800'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                    onClick={() => toggleFactor(factor.id)}
                  >
                    <span className="text-sm">{factor.name}</span>
                    <span className={`text-sm font-medium ${factor.selected ? 'text-red-600 dark:text-red-400' : 'text-muted-foreground'}`}>
                      {factor.impact}
                    </span>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-green-500">Positive Factors</h4>
                {factors.filter(f => f.impact > 0).map(factor => (
                  <div
                    key={factor.id}
                    className={`p-2 rounded-md flex items-center justify-between cursor-pointer border transition-colors ${
                      factor.selected
                        ? 'border-green-400 bg-green-50 dark:bg-green-950 dark:border-green-800'
                        : 'border-muted hover:border-muted-foreground'
                    }`}
                    onClick={() => toggleFactor(factor.id)}
                  >
                    <span className="text-sm">{factor.name}</span>
                    <span className={`text-sm font-medium ${factor.selected ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                      +{factor.impact}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-2">
              <Button variant="outline" size="sm" onClick={resetSelections}>
                Reset Selections
              </Button>
            </div>
          </div>
        </CalculatorCard>
      </div>
      
      {/* Results Section */}
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Current Score Card */}
          <CalculatorCard 
            title="Current Score"
            className="relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <Popover>
                <PopoverTrigger>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="text-sm">
                  <p>Credit scores typically range from 300-850. Higher scores indicate better creditworthiness.</p>
                </PopoverContent>
              </Popover>
            </div>
            <h3 className="text-sm font-medium mb-2">Current Score</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-3xl font-bold ${currentCategory.color}`}>{currentScore}</span>
              <span className={`text-sm ${currentCategory.color}`}>{currentCategory.category}</span>
            </div>
          </CalculatorCard>

          {/* Projected Score Card */}
          <CalculatorCard 
            title="Projected Score"
            className="relative overflow-hidden"
          >
            <div className="absolute top-2 right-2">
              <Popover>
                <PopoverTrigger>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </PopoverTrigger>
                <PopoverContent className="text-sm">
                  <p>This is an estimate based on typical impacts. Actual results may vary based on your credit history and other factors.</p>
                </PopoverContent>
              </Popover>
            </div>
            <h3 className="text-sm font-medium mb-2">Projected Score</h3>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-3xl font-bold ${projectedCategory.color}`}>{projectedScore}</span>
              <span className={`text-sm ${projectedCategory.color}`}>{projectedCategory.category}</span>
              
              {projectedScore !== currentScore && (
                <div className={cn(
                  "flex items-center text-sm ml-2 px-2 py-0.5 rounded-full",
                  projectedScore > currentScore 
                    ? "text-green-700 bg-green-100 dark:bg-green-900/30 dark:text-green-400"
                    : "text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {projectedScore > currentScore ? (
                    <>
                      <ArrowUp className="h-3 w-3 mr-1" />
                      +{projectedScore - currentScore}
                    </>
                  ) : (
                    <>
                      <ArrowDown className="h-3 w-3 mr-1" />
                      {projectedScore - currentScore}
                    </>
                  )}
                </div>
              )}
            </div>
          </CalculatorCard>
        </div>
        
        {/* Score Range Visualization */}
        <CalculatorCard 
          title="Credit Score Range"
          className="bg-white dark:bg-card"
        >
          <h3 className="text-sm font-medium mb-4">Credit Score Range</h3>
          <div className="relative h-8 rounded-full bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 mb-2">
            {/* Score indicators */}
            <div 
              className="absolute bottom-full mb-1 transform -translate-x-1/2 text-xs font-medium flex flex-col items-center"
              style={{ left: `${((currentScore - 300) / 550) * 100}%` }}
            >
              <div className="w-0.5 h-2 bg-foreground mb-1"></div>
              <span className="whitespace-nowrap">Current: {currentScore}</span>
            </div>
            
            {projectedScore !== currentScore && (
              <div 
                className="absolute top-full mt-1 transform -translate-x-1/2 text-xs font-medium flex flex-col items-center"
                style={{ left: `${((projectedScore - 300) / 550) * 100}%` }}
              >
                <div className="w-0.5 h-2 bg-foreground mb-1"></div>
                <span className="whitespace-nowrap">Projected: {projectedScore}</span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between text-xs text-muted-foreground mt-6">
            <span>300 Poor</span>
            <span>580 Fair</span>
            <span>670 Good</span>
            <span>740 Very Good</span>
            <span>800 Excellent</span>
          </div>
        </CalculatorCard>
        
        {/* Impact Factors Chart */}
        {sortedChartData.length > 0 && (
          <CalculatorCard 
            title="Score Impact Factors"
          >
            <h3 className="text-sm font-medium mb-4">Score Impact Factors</h3>
            <div className="space-y-3">
              {sortedChartData.map((item) => (
                <div key={item.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>{item.name}</span>
                    <span className={item.positive ? 'text-green-600' : 'text-red-600'}>
                      {item.positive ? '+' : '-'}{item.Impact} points
                    </span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded overflow-hidden">
                    <div 
                      className={`h-full ${item.positive ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${(item.Impact / 150) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CalculatorCard>
        )}
      </div>
    </div>
  );
};

export default CreditScoreImpactCalculator;
