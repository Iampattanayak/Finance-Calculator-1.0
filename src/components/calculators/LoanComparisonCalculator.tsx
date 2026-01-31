import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, RotateCcw, Info } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import CalculatorInput from '../ui-elements/CalculatorInput';
import CalculatorCard from '../ui-elements/CalculatorCard';
import ResultDisplay from '../ui-elements/ResultDisplay';
import LineChart from '../charts/LineChart';
import { formatCurrency, ChartDataPoint } from '@/utils/calculatorUtils';

interface LoanData {
  id: string;
  name: string;
  principal: number;
  interestRate: number;
  tenure: number;
  timeUnit: 'years' | 'months';
  emi: number;
  totalInterest: number;
  totalAmount: number;
  color: string;
}

// Predefined colors for different loans
const loanColors = [
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F97316', // Orange
];

const calculateEMI = (principal: number, rate: number, tenure: number): number => {
  const monthlyRate = rate / 12 / 100;
  const months = tenure * 12;
  return principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1);
};

const LoanComparisonCalculator: React.FC = () => {
  const [loans, setLoans] = useState<LoanData[]>([
    {
      id: '1',
      name: 'Loan 1',
      principal: 500000,
      interestRate: 8.5,
      tenure: 20,
      timeUnit: 'years',
      emi: 0,
      totalInterest: 0,
      totalAmount: 0,
      color: loanColors[0],
    },
    {
      id: '2',
      name: 'Loan 2',
      principal: 500000,
      interestRate: 10,
      tenure: 15,
      timeUnit: 'years',
      emi: 0,
      totalInterest: 0,
      totalAmount: 0,
      color: loanColors[1],
    }
  ]);

  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [comparisonData, setComparisonData] = useState<ChartDataPoint[]>([]);

  // Create a stable dependency key based only on input fields to avoid infinite loops
  const loansInputKey = JSON.stringify(loans.map(l => ({
    p: l.principal,
    r: l.interestRate,
    t: l.tenure,
    u: l.timeUnit
  })));

  useEffect(() => {
    // Calculate loan metrics for each loan
    const updatedLoans = loans.map(loan => {
      // Convert tenure to years for calculation if needed
      const tenureInYears = loan.timeUnit === 'years' ? loan.tenure : loan.tenure / 12;

      const emi = calculateEMI(loan.principal, loan.interestRate, tenureInYears);
      const totalAmount = emi * tenureInYears * 12;
      const totalInterest = totalAmount - loan.principal;

      return {
        ...loan,
        emi,
        totalInterest,
        totalAmount
      };
    });

    setLoans(updatedLoans);

    // Generate data for amortization chart
    generateChartData(updatedLoans);

    // Generate comparison chart data
    generateComparisonData(updatedLoans);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loansInputKey]);

  const generateChartData = (loansData: LoanData[]) => {
    if (loansData.length === 0) return;

    const maxMonths = Math.max(...loansData.map(loan => {
      const tenureMonths = loan.timeUnit === 'years' ? loan.tenure * 12 : loan.tenure;
      return tenureMonths;
    }));

    const data: ChartDataPoint[] = [];

    for (let month = 0; month <= maxMonths; month += 6) { // Plot every 6 months for clarity
      const dataPoint: ChartDataPoint = { name: month === 0 ? 'Start' : `${month} mo` };

      loansData.forEach(loan => {
        const loanTenureMonths = loan.timeUnit === 'years' ? loan.tenure * 12 : loan.tenure;

        if (month <= loanTenureMonths) {
          const monthlyRate = loan.interestRate / 12 / 100;
          const emi = loan.emi;
          const remainingMonths = loanTenureMonths - month;
          const outstandingPrincipal = month === 0
            ? loan.principal
            : (emi / monthlyRate) * (1 - 1 / Math.pow(1 + monthlyRate, remainingMonths));

          dataPoint[loan.name] = Math.max(0, Math.round(outstandingPrincipal));
        } else {
          dataPoint[loan.name] = 0;
        }
      });

      data.push(dataPoint);
    }

    setChartData(data);
  };

  const generateComparisonData = (loansData: LoanData[]) => {
    if (loansData.length === 0) return;

    const comparisonMetrics = [
      { name: 'EMI', key: 'emi' },
      { name: 'Total Interest', key: 'totalInterest' },
      { name: 'Total Payment', key: 'totalAmount' }
    ];

    const data = comparisonMetrics.map(metric => {
      const dataPoint: ChartDataPoint = { name: metric.name };

      loansData.forEach(loan => {
        dataPoint[loan.name] = loan[metric.key as keyof LoanData] as number;
      });

      return dataPoint;
    });

    setComparisonData(data);
  };

  const handleAddLoan = () => {
    if (loans.length >= 4) return; // Maximum 4 loans

    const newId = (Math.max(...loans.map(loan => parseInt(loan.id))) + 1).toString();
    const newLoan: LoanData = {
      id: newId,
      name: `Loan ${newId}`,
      principal: 500000,
      interestRate: 9,
      tenure: 10,
      timeUnit: 'years',
      emi: 0,
      totalInterest: 0,
      totalAmount: 0,
      color: loanColors[loans.length % loanColors.length],
    };

    setLoans([...loans, newLoan]);
  };

  const handleRemoveLoan = (id: string) => {
    if (loans.length <= 2) return; // Minimum 2 loans
    setLoans(loans.filter(loan => loan.id !== id));
  };

  const handleReset = () => {
    setLoans([
      {
        id: '1',
        name: 'Loan 1',
        principal: 500000,
        interestRate: 8.5,
        tenure: 20,
        timeUnit: 'years',
        emi: 0,
        totalInterest: 0,
        totalAmount: 0,
        color: loanColors[0],
      },
      {
        id: '2',
        name: 'Loan 2',
        principal: 500000,
        interestRate: 10,
        tenure: 15,
        timeUnit: 'years',
        emi: 0,
        totalInterest: 0,
        totalAmount: 0,
        color: loanColors[1],
      }
    ]);
  };

  const handleLoanChange = (id: string, field: keyof LoanData, value: number | string) => {
    setLoans(loans.map(loan => {
      if (loan.id === id) {
        if (field === 'name' && typeof value === 'string') {
          return { ...loan, [field]: value };
        } else if (field !== 'name' && typeof value === 'number') {
          return { ...loan, [field]: value };
        } else if (field === 'timeUnit' && (value === 'years' || value === 'months')) {
          // Handle timeUnit change
          let newTenure = loan.tenure;

          if (value === 'years' && loan.timeUnit === 'months') {
            // Convert months to years (round to nearest 0.5)
            newTenure = Math.round(loan.tenure / 12 * 2) / 2;
          } else if (value === 'months' && loan.timeUnit === 'years') {
            // Convert years to months
            newTenure = Math.round(loan.tenure * 12);
          }

          return { ...loan, timeUnit: value, tenure: newTenure };
        }
      }
      return loan;
    }));
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Input Cards */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Loan Details</h2>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleAddLoan}
                        size="sm"
                        disabled={loans.length >= 4}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Loan
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Compare up to 4 loans</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto pr-1">
              {loans.map((loan) => (
                <CalculatorCard
                  key={loan.id}
                  title={loan.name}
                  className="border-l-4"
                  highlight={false}
                >
                  <div
                    className="absolute left-0 top-0 bottom-0 w-1"
                    style={{ backgroundColor: loan.color }}
                  />
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <input
                        className="bg-transparent border-b border-b-gray-200 focus:border-primary outline-none px-1 py-0.5 text-sm font-medium"
                        value={loan.name}
                        onChange={(e) => handleLoanChange(loan.id, 'name', e.target.value)}
                        maxLength={20}
                      />

                      {loans.length > 2 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLoan(loan.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>

                    <CalculatorInput
                      id={`principal-${loan.id}`}
                      label="Loan Amount"
                      value={loan.principal}
                      onChange={(value) => handleLoanChange(loan.id, 'principal', value)}
                      min={10000}
                      max={10000000}
                      step={10000}
                      prefix="₹"
                      showSlider={true}
                    />

                    <CalculatorInput
                      id={`interest-${loan.id}`}
                      label="Interest Rate"
                      value={loan.interestRate}
                      onChange={(value) => handleLoanChange(loan.id, 'interestRate', value)}
                      min={4}
                      max={24}
                      step={0.1}
                      suffix="%"
                      showSlider={true}
                    />

                    <CalculatorInput
                      id={`tenure-${loan.id}`}
                      label="Loan Tenure"
                      value={loan.tenure}
                      onChange={(value) => handleLoanChange(loan.id, 'tenure', value)}
                      min={loan.timeUnit === 'years' ? 1 : 1}
                      max={loan.timeUnit === 'years' ? 30 : 360}
                      step={loan.timeUnit === 'years' ? 1 : 1}
                      suffix={loan.timeUnit === 'years' ? " Years" : " Months"}
                      showSlider={true}
                      timeUnitOptions={{
                        enabled: true,
                        currentUnit: loan.timeUnit,
                        onUnitChange: (unit) => handleLoanChange(loan.id, 'timeUnit', unit)
                      }}
                    />

                    <div className="pt-2 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Monthly EMI:</span>
                        <span className="font-medium">₹{formatCurrency(loan.emi)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Interest:</span>
                        <span className="font-medium">₹{formatCurrency(loan.totalInterest)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Total Amount:</span>
                        <span className="font-medium">₹{formatCurrency(loan.totalAmount)}</span>
                      </div>
                    </div>
                  </div>
                </CalculatorCard>
              ))}
            </div>
          </div>

          {/* Comparison Results */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {loans.map(loan => (
                <ResultDisplay
                  key={loan.id}
                  label={loan.name}
                  value={`₹${formatCurrency(loan.emi)}/month`}
                  highlightColor={`bg-${loan.color.replace('#', '')}/10`}
                  className={`relative border-l-4 transition-all duration-300`}
                  subtitle={`Total: ₹${formatCurrency(loan.totalAmount)}`}
                >
                  <div
                    className="absolute left-0 top-0 h-full w-1 rounded-l-lg"
                    style={{ backgroundColor: loan.color }}
                  />
                </ResultDisplay>
              ))}
            </div>

            {/* Comparison Chart */}
            {comparisonData.length > 0 && (
              <LineChart
                title="Loan Cost Comparison"
                data={comparisonData}
                series={loans.map(loan => ({
                  name: loan.name,
                  dataKey: loan.name,
                  color: loan.color
                }))}
                type="bar"
                yAxisFormatter={(value) => `₹${Math.round(value / 1000)}K`}
                tooltipFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
            )}

            {/* Amortization Chart */}
            {chartData.length > 0 && (
              <LineChart
                title="Outstanding Principal Over Time"
                data={chartData}
                series={loans.map(loan => ({
                  name: loan.name,
                  dataKey: loan.name,
                  color: loan.color
                }))}
                type="area"
                yAxisFormatter={(value) => `₹${Math.round(value / 100000)}L`}
                tooltipFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanComparisonCalculator;
