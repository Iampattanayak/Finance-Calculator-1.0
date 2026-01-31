
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Calendar, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import CalculatorInput from '../ui-elements/CalculatorInput';
import CalculatorCard from '../ui-elements/CalculatorCard';
import ResultDisplay from '../ui-elements/ResultDisplay';
import LineChart from '../charts/LineChart';
import {
  calculateFD,
  formatCurrency,
  generateFDChartData,
  ChartDataPoint
} from '@/utils/calculatorUtils';

const FDCalculator: React.FC = () => {
  const [principal, setPrincipal] = useState(100000);
  const [interestRate, setInterestRate] = useState(7);
  const [timePeriod, setTimePeriod] = useState(5);
  const [interestFrequency, setInterestFrequency] = useState<'monthly' | 'quarterly' | 'cumulative'>('cumulative');
  const [investmentDate, setInvestmentDate] = useState<Date>(new Date());
  const [timeUnit, setTimeUnit] = useState<'years' | 'months'>('years');

  const [maturityValue, setMaturityValue] = useState(0);
  const [interestEarned, setInterestEarned] = useState(0);
  const [maturityDate, setMaturityDate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Calculate FD results
  useEffect(() => {
    const calculateResults = () => {
      // Convert time period to years if needed
      const timePeriodYears = timeUnit === 'years' ? timePeriod : timePeriod / 12;

      const fdValue = calculateFD(principal, interestRate, timePeriodYears, interestFrequency);

      setMaturityValue(fdValue);
      setInterestEarned(fdValue - principal);

      // Calculate maturity date
      const newMaturityDate = new Date(investmentDate);
      if (timeUnit === 'years') {
        newMaturityDate.setFullYear(newMaturityDate.getFullYear() + timePeriod);
      } else {
        newMaturityDate.setMonth(newMaturityDate.getMonth() + timePeriod);
      }
      setMaturityDate(newMaturityDate);

      // Generate chart data
      const chartData = generateFDChartData(principal, interestRate, timeUnit === 'years' ? timePeriod : timePeriod / 12, interestFrequency);
      setChartData(
        chartData.labels.map((label, index) => ({
          name: label,
          'Principal': chartData.principal[index],
          'Interest': chartData.interest[index],
        }))
      );
    };

    calculateResults();
  }, [principal, interestRate, timePeriod, interestFrequency, investmentDate, timeUnit]);

  const handleReset = () => {
    setPrincipal(100000);
    setInterestRate(7);
    setTimePeriod(5);
    setInterestFrequency('cumulative');
    setInvestmentDate(new Date());
    setTimeUnit('years');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <CalculatorCard title="FD Calculator" description="Calculate Fixed Deposit maturity amount and interest">
          <div className="space-y-4">
            <CalculatorInput
              id="principal"
              label="Deposit Amount"
              value={principal}
              onChange={setPrincipal}
              min={1000}
              max={10000000}
              step={1000}
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
                <label className="text-sm font-medium text-foreground/80">Tenure</label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setTimeUnit('years')}
                    className={`text-xs px-2 py-1 rounded ${timeUnit === 'years' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                  >
                    Years
                  </button>
                  <button
                    onClick={() => setTimeUnit('months')}
                    className={`text-xs px-2 py-1 rounded ${timeUnit === 'months' ? 'bg-blue-500 text-white' : 'text-gray-500'}`}
                  >
                    Months
                  </button>
                </div>
              </div>

              <CalculatorInput
                id="time-period"
                label=""
                value={timePeriod}
                onChange={setTimePeriod}
                min={timeUnit === 'years' ? 1 : 1}
                max={timeUnit === 'years' ? 60 : 720}
                step={timeUnit === 'years' ? 1 : 1}
                suffix={timeUnit === 'years' ? ' Years' : ' Months'}
                showSlider={true}
                placeholder={`Enter Duration ${timeUnit === 'years' ? 'in Years' : 'in Months'}`}
              />
            </div>

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
              <label className="text-sm font-medium text-foreground/80 mb-2 block">Interest Payout</label>
              <Tabs
                defaultValue="cumulative"
                value={interestFrequency}
                onValueChange={(value) => setInterestFrequency(value as 'monthly' | 'quarterly' | 'cumulative')}
                className="w-full"
              >
                <TabsList className="grid grid-cols-3 mb-2 w-full">
                  <TabsTrigger value="cumulative" className="text-xs py-1">Cumulative</TabsTrigger>
                  <TabsTrigger value="quarterly" className="text-xs py-1">Quarterly</TabsTrigger>
                  <TabsTrigger value="monthly" className="text-xs py-1">Monthly</TabsTrigger>
                </TabsList>
              </Tabs>
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
            label="Investment Amount"
            value={formatCurrency(principal)}
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
              { name: 'Principal', dataKey: 'Principal', color: '#1E90FF' },
              { name: 'Interest', dataKey: 'Interest', color: '#4CAF50' }
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

export default FDCalculator;
