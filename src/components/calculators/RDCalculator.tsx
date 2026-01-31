
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { DatePicker } from '@/components/ui/date-picker';
import CalculatorInput from '../ui-elements/CalculatorInput';
import CalculatorCard from '../ui-elements/CalculatorCard';
import ResultDisplay from '../ui-elements/ResultDisplay';
import LineChart from '../charts/LineChart';
import {
  calculateRD,
  formatCurrency,
  generateRDChartData,
  ChartDataPoint
} from '@/utils/calculatorUtils';

const RDCalculator: React.FC = () => {
  const [monthlyDeposit, setMonthlyDeposit] = useState(10000);
  const [interestRate, setInterestRate] = useState(7);
  const [timePeriodMonths, setTimePeriodMonths] = useState(36);
  const [investmentDate, setInvestmentDate] = useState<Date>(new Date());

  const [maturityValue, setMaturityValue] = useState(0);
  const [totalDeposit, setTotalDeposit] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);
  const [maturityDate, setMaturityDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Calculate RD results
  useEffect(() => {
    const calculateResults = () => {
      const rdValue = calculateRD(monthlyDeposit, interestRate, timePeriodMonths);
      const totalDepositAmount = monthlyDeposit * timePeriodMonths;

      setMaturityValue(rdValue);
      setTotalDeposit(totalDepositAmount);
      setInterestEarned(rdValue - totalDepositAmount);

      // Calculate maturity date
      const newMaturityDate = new Date(investmentDate);
      newMaturityDate.setMonth(newMaturityDate.getMonth() + timePeriodMonths);
      setMaturityDate(newMaturityDate);

      // Generate chart data
      const chartData = generateRDChartData(monthlyDeposit, interestRate, timePeriodMonths);
      setChartData(
        chartData.labels.map((label, index) => ({
          name: label,
          'Deposits': chartData.deposits[index],
          'Interest': chartData.interest[index],
        }))
      );
    };

    calculateResults();
  }, [monthlyDeposit, interestRate, timePeriodMonths, investmentDate]);

  const handleReset = () => {
    setMonthlyDeposit(10000);
    setInterestRate(7);
    setTimePeriodMonths(36);
    setInvestmentDate(new Date());
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <CalculatorCard title="RD Calculator" description="Calculate Recurring Deposit maturity amount and interest">
          <div className="space-y-4">
            <CalculatorInput
              id="monthly-deposit"
              label="Monthly Deposit"
              value={monthlyDeposit}
              onChange={setMonthlyDeposit}
              min={500}
              max={200000}
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

            <CalculatorInput
              id="time-period"
              label="Saving Term"
              value={timePeriodMonths}
              onChange={setTimePeriodMonths}
              min={3}
              max={120}
              step={3}
              suffix=" Months"
              showSlider={true}
              placeholder="Months"
              description="Multiples of 3 months"
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
            label="Total Deposit"
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

export default RDCalculator;
