import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Slider } from '@/components/ui/slider';
import { DatePicker } from '@/components/ui/date-picker';
import CalculatorInput from '../ui-elements/CalculatorInput';
import CalculatorCard from '../ui-elements/CalculatorCard';
import ResultDisplay from '../ui-elements/ResultDisplay';
import LineChart from '../charts/LineChart';
import {
  calculatePPF,
  formatCurrency,
  generatePPFChartData,
  ChartDataPoint
} from '@/utils/calculatorUtils';

const PPFCalculator: React.FC = () => {
  const [yearlyDeposit, setYearlyDeposit] = useState(150000);
  const [interestRate, setInterestRate] = useState(7.1);
  const [durationYears, setDurationYears] = useState(15);
  const [investmentDate, setInvestmentDate] = useState<Date>(new Date());

  const [maturityValue, setMaturityValue] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);
  const [maturityDate, setMaturityDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const durationOptions = [15, 20, 25, 30];

  useEffect(() => {
    const calculateResults = () => {
      const ppfValue = calculatePPF(yearlyDeposit, interestRate, durationYears);
      const totalDepositAmount = yearlyDeposit * durationYears;

      setMaturityValue(ppfValue);
      setTotalDeposit(totalDepositAmount);
      setInterestEarned(ppfValue - totalDepositAmount);

      const newMaturityDate = new Date(investmentDate);
      newMaturityDate.setFullYear(newMaturityDate.getFullYear() + durationYears);
      setMaturityDate(newMaturityDate);

      const chartData = generatePPFChartData(yearlyDeposit, interestRate, durationYears);
      setChartData(
        chartData.labels.map((label, index) => ({
          name: label,
          'Deposits': chartData.deposits[index],
          'Interest': chartData.interest[index],
        }))
      );
    };

    calculateResults();
  }, [yearlyDeposit, interestRate, durationYears, investmentDate]);

  const handleReset = () => {
    setYearlyDeposit(150000);
    setInterestRate(7.1);
    setDurationYears(15);
    setInvestmentDate(new Date());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <CalculatorCard title="PPF Calculator" description="Calculate Public Provident Fund maturity amount and interest">
          <div className="space-y-4">
            <CalculatorInput
              id="yearly-deposit"
              label="Deposit Amount"
              value={yearlyDeposit}
              onChange={setYearlyDeposit}
              min={500}
              max={150000}
              step={500}
              prefix="₹"
              showSlider={true}
              placeholder="Enter Deposited Amount"
            />

            <CalculatorInput
              id="interest-rate"
              label="Rate of Interest"
              value={interestRate}
              onChange={setInterestRate}
              min={1}
              max={50}
              step={0.1}
              suffix="%"
              showSlider={true}
              placeholder="Enter Interest Rate"
              description="(max. 50% per annum)"
            />

            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-sm font-medium text-foreground/80">Investment Date</label>
              </div>
              <div className="relative">
                <div className="input-highlight bg-muted/50 border border-border/80 rounded-md flex items-center p-2">
                  <span className="text-gray-500 ml-2">{format(investmentDate, 'dd MMM yyyy')}</span>
                  <DatePicker date={investmentDate} setDate={setInvestmentDate} />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-baseline mb-2">
                <label className="text-sm font-medium text-foreground/80">Duration (Years)</label>
              </div>

              <div className="pt-4 px-2">
                <div className="flex justify-between mb-2">
                  {durationOptions.map((duration) => (
                    <div key={duration} className="text-center">
                      <div
                        className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center cursor-pointer
                          ${durationYears === duration ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}
                        onClick={() => setDurationYears(duration)}
                      >
                        {duration}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                className="w-full bg-blue-500 hover:bg-blue-600"
                onClick={() => {
                  // Calculate is automatic, but added for UX consistency
                }}
              >
                CALCULATE
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="mt-2 flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
        </CalculatorCard>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResultDisplay
            label="Total Investment"
            value={formatCurrency(totalDeposit)}
            highlightColor="bg-blue-500/10"
            className="sm:col-span-1"
          />
          <ResultDisplay
            label="Estimated Returns"
            value={formatCurrency(interestEarned)}
            highlightColor="bg-green-500/10"
            className="sm:col-span-1"
          />
          <ResultDisplay
            label="Maturity Value"
            value={formatCurrency(maturityValue)}
            highlightColor="bg-primary/10"
            className="sm:col-span-1"
            subtitle={`Maturity Date: ${format(maturityDate, 'dd MMM yyyy')}`}
          />
        </div>

        {chartData.length > 0 && (
          <LineChart
            title="Investment Growth"
            data={chartData}
            series={[
              { name: 'Deposits', dataKey: 'Deposits', color: '#1E90FF', stackId: 'a' },
              { name: 'Interest', dataKey: 'Interest', color: '#4CAF50', stackId: 'a' }
            ]}
            type="bar"
            yAxisFormatter={(value) => `₹${Math.round(value / 1000)}K`}
            tooltipFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
          />
        )}
      </div>
    </div>
  );
};

export default PPFCalculator;
