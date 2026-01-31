import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';
import CalculatorInput from '../ui-elements/CalculatorInput';
import CalculatorCard from '../ui-elements/CalculatorCard';
import ResultDisplay from '../ui-elements/ResultDisplay';
import LineChart from '../charts/LineChart';
import {
  calculateEMI,
  calculateLoanAmount,
  calculateInterestRate,
  calculateTimePeriod,
  formatCurrency,
  generateEMIChartData,
  calculateAmortizationSchedule,
  ChartDataPoint
} from '@/utils/calculatorUtils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';

const EMICalculator: React.FC = () => {
  // Common state for all calculators
  const [loanAmount, setLoanAmount] = useState(1000000);
  const [interestRate, setInterestRate] = useState(8.5);
  const [loanTenure, setLoanTenure] = useState(5);
  const [emiAmount, setEmiAmount] = useState(0);
  const [activeTab, setActiveTab] = useState('emi');

  // Additional state for chart
  const [totalInterest, setTotalInterest] = useState(0);
  const [totalPayment, setTotalPayment] = useState(0);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  // Payment schedule state
  const [showPaymentSchedule, setShowPaymentSchedule] = useState(false);
  const [paymentSchedule, setPaymentSchedule] = useState<Array<{
    month: number;
    emi: number;
    principal: number;
    interest: number;
    balance: number;
  }>>([]);

  // Pagination state for payment schedule
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Time unit state
  const [timeUnit, setTimeUnit] = useState<'years' | 'months'>('years');

  // Calculate results based on the active tab
  // Calculate results based on the active tab
  useEffect(() => {
    const calculateResults = () => {
      let result = 0;
      let totalInt = 0;
      let totalPay = 0;

      // Convert tenure to years for calculations if needed
      const tenureInYears = timeUnit === 'years' ? loanTenure : loanTenure / 12;

      switch (activeTab) {
        case 'emi': {
          result = calculateEMI(loanAmount, interestRate, tenureInYears);
          setEmiAmount(result);
          totalInt = (result * tenureInYears * 12) - loanAmount;
          totalPay = result * tenureInYears * 12;

          // Generate chart data - fixed to ensure proper data formatting
          const emiChartData = generateEMIChartData(loanAmount, interestRate, tenureInYears);
          if (emiChartData && emiChartData.labels && emiChartData.principal && emiChartData.interest) {
            const formattedChartData = emiChartData.labels.map((label, index) => ({
              name: label,
              'Principal Paid': emiChartData.principal[index],
              'Interest Paid': emiChartData.interest[index],
            }));

            setChartData(formattedChartData);
          }

          // Generate payment schedule
          const schedule = calculateAmortizationSchedule(loanAmount, interestRate, tenureInYears);
          setPaymentSchedule(schedule);
          break;
        }

        case 'loan': {
          result = calculateLoanAmount(emiAmount, interestRate, tenureInYears);
          setLoanAmount(result);
          totalInt = (emiAmount * tenureInYears * 12) - result;
          totalPay = emiAmount * tenureInYears * 12;
          break;
        }

        case 'interest': {
          result = calculateInterestRate(emiAmount, loanAmount, tenureInYears);
          setInterestRate(result);
          totalInt = (emiAmount * tenureInYears * 12) - loanAmount;
          totalPay = emiAmount * tenureInYears * 12;
          break;
        }

        case 'tenure': {
          result = calculateTimePeriod(emiAmount, loanAmount, interestRate);

          // Convert the result to the current time unit
          let adjustedResult = result;
          if (timeUnit === 'months') {
            adjustedResult = result * 12;
          }

          setLoanTenure(adjustedResult);

          // For total calculations, convert back to years
          const calculationTenure = timeUnit === 'years' ? result : result / 12;
          totalInt = (emiAmount * calculationTenure * 12) - loanAmount;
          totalPay = emiAmount * calculationTenure * 12;
          break;
        }
      }

      setTotalInterest(totalInt);
      setTotalPayment(totalPay);
    };

    calculateResults();
  }, [loanAmount, interestRate, loanTenure, emiAmount, activeTab, timeUnit]);

  const handleReset = () => {
    setLoanAmount(1000000);
    setInterestRate(8.5);
    setLoanTenure(timeUnit === 'years' ? 5 : 60);
    setEmiAmount(20000);
    setShowPaymentSchedule(false);
  };

  // Content for EMI Calculator Tab
  const EMICalculatorContent = (
    <div className="space-y-4">
      <CalculatorInput
        id="loan-amount"
        label="Loan Amount"
        value={loanAmount}
        onChange={setLoanAmount}
        min={10000}
        max={10000000}
        step={10000}
        prefix="₹"
        showSlider={true}
        placeholder="Enter loan amount"
      />

      <CalculatorInput
        id="interest-rate"
        label="Interest Rate"
        value={interestRate}
        onChange={setInterestRate}
        min={1}
        max={20}
        step={0.1}
        suffix="%"
        showSlider={true}
        placeholder="Enter interest rate"
      />

      <CalculatorInput
        id="loan-tenure"
        label="Loan Tenure"
        value={loanTenure}
        onChange={setLoanTenure}
        min={timeUnit === 'years' ? 1 : 1}
        max={timeUnit === 'years' ? 30 : 360}
        step={timeUnit === 'years' ? 1 : 1}
        suffix={timeUnit === 'years' ? " Years" : " Months"}
        showSlider={true}
        placeholder="Enter loan tenure"
        timeUnitOptions={{
          enabled: true,
          currentUnit: timeUnit,
          onUnitChange: (unit) => {
            if (unit === 'years' && timeUnit === 'months') {
              // Convert months to years (round to nearest 0.5)
              setLoanTenure(Math.round(loanTenure / 12 * 2) / 2);
            } else if (unit === 'months' && timeUnit === 'years') {
              // Convert years to months
              setLoanTenure(Math.round(loanTenure * 12));
            }
            setTimeUnit(unit);
          }
        }}
      />

      <div className="flex space-x-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );

  // Content for Loan Amount Calculator Tab
  const LoanAmountCalculatorContent = (
    <div className="space-y-4">
      <CalculatorInput
        id="emi-amount"
        label="EMI Amount"
        value={emiAmount}
        onChange={setEmiAmount}
        min={1000}
        max={1000000}
        step={1000}
        prefix="₹"
        showSlider={true}
        placeholder="Enter EMI amount"
      />

      <CalculatorInput
        id="interest-rate-loan"
        label="Interest Rate"
        value={interestRate}
        onChange={setInterestRate}
        min={1}
        max={20}
        step={0.1}
        suffix="%"
        showSlider={true}
        placeholder="Enter interest rate"
      />

      <CalculatorInput
        id="loan-tenure-loan"
        label="Loan Tenure"
        value={loanTenure}
        onChange={setLoanTenure}
        min={timeUnit === 'years' ? 1 : 1}
        max={timeUnit === 'years' ? 30 : 360}
        step={timeUnit === 'years' ? 1 : 1}
        suffix={timeUnit === 'years' ? " Years" : " Months"}
        showSlider={true}
        placeholder="Enter loan tenure"
        timeUnitOptions={{
          enabled: true,
          currentUnit: timeUnit,
          onUnitChange: (unit) => {
            if (unit === 'years' && timeUnit === 'months') {
              // Convert months to years (round to nearest 0.5)
              setLoanTenure(Math.round(loanTenure / 12 * 2) / 2);
            } else if (unit === 'months' && timeUnit === 'years') {
              // Convert years to months
              setLoanTenure(Math.round(loanTenure * 12));
            }
            setTimeUnit(unit);
          }
        }}
      />

      <div className="flex space-x-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );

  // Content for Interest Rate Calculator Tab
  const InterestRateCalculatorContent = (
    <div className="space-y-4">
      <CalculatorInput
        id="emi-amount-interest"
        label="EMI Amount"
        value={emiAmount}
        onChange={setEmiAmount}
        min={1000}
        max={1000000}
        step={1000}
        prefix="₹"
        showSlider={true}
        placeholder="Enter EMI amount"
      />

      <CalculatorInput
        id="loan-amount-interest"
        label="Loan Amount"
        value={loanAmount}
        onChange={setLoanAmount}
        min={10000}
        max={10000000}
        step={10000}
        prefix="₹"
        showSlider={true}
        placeholder="Enter loan amount"
      />

      <CalculatorInput
        id="loan-tenure-interest"
        label="Loan Tenure"
        value={loanTenure}
        onChange={setLoanTenure}
        min={timeUnit === 'years' ? 1 : 1}
        max={timeUnit === 'years' ? 30 : 360}
        step={timeUnit === 'years' ? 1 : 1}
        suffix={timeUnit === 'years' ? " Years" : " Months"}
        showSlider={true}
        placeholder="Enter loan tenure"
        timeUnitOptions={{
          enabled: true,
          currentUnit: timeUnit,
          onUnitChange: (unit) => {
            if (unit === 'years' && timeUnit === 'months') {
              // Convert months to years (round to nearest 0.5)
              setLoanTenure(Math.round(loanTenure / 12 * 2) / 2);
            } else if (unit === 'months' && timeUnit === 'years') {
              // Convert years to months
              setLoanTenure(Math.round(loanTenure * 12));
            }
            setTimeUnit(unit);
          }
        }}
      />

      <div className="flex space-x-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );

  // Content for Time Period Calculator Tab
  const TimePeriodCalculatorContent = (
    <div className="space-y-4">
      <CalculatorInput
        id="loan-amount-tenure"
        label="Loan Amount"
        value={loanAmount}
        onChange={setLoanAmount}
        min={10000}
        max={10000000}
        step={10000}
        prefix="₹"
        showSlider={true}
        placeholder="Enter loan amount"
      />

      <CalculatorInput
        id="emi-amount-tenure"
        label="EMI Amount"
        value={emiAmount}
        onChange={setEmiAmount}
        min={1000}
        max={1000000}
        step={1000}
        prefix="₹"
        showSlider={true}
        placeholder="Enter EMI amount"
      />

      <CalculatorInput
        id="interest-rate-tenure"
        label="Interest Rate"
        value={interestRate}
        onChange={setInterestRate}
        min={1}
        max={20}
        step={0.1}
        suffix="%"
        showSlider={true}
        placeholder="Enter interest rate"
      />

      <div className="flex space-x-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleReset}
          className="flex items-center gap-1"
        >
          <RotateCcw className="h-3 w-3" />
          Reset
        </Button>
      </div>
    </div>
  );

  // Define the 2x2 grid layout for calculator tabs
  const calculatorOptions = [
    { id: 'emi', label: 'EMI', content: EMICalculatorContent },
    { id: 'loan', label: 'Loan Amount', content: LoanAmountCalculatorContent },
    { id: 'interest', label: 'Interest Rate', content: InterestRateCalculatorContent },
    { id: 'tenure', label: 'Time Period', content: TimePeriodCalculatorContent },
  ];

  // Get appropriate result value based on active tab
  const getResultValue = () => {
    switch (activeTab) {
      case 'emi':
        return formatCurrency(emiAmount);
      case 'loan':
        return formatCurrency(loanAmount);
      case 'interest':
        return `${interestRate.toFixed(2)}%`;
      case 'tenure':
        if (timeUnit === 'years') {
          const years = Math.floor(loanTenure);
          const months = Math.round((loanTenure - years) * 12);
          return `${years} Years${months > 0 ? ` ${months} Months` : ''}`;
        } else {
          const years = Math.floor(loanTenure / 12);
          const months = Math.round(loanTenure % 12);
          return `${years > 0 ? `${years} Years ` : ''}${months} Months`;
        }
    }
  };

  // Get appropriate result label based on active tab
  const getResultLabel = () => {
    switch (activeTab) {
      case 'emi':
        return 'Monthly EMI';
      case 'loan':
        return 'Loan Amount';
      case 'interest':
        return 'Interest Rate';
      case 'tenure':
        return 'Loan Tenure';
    }
  };

  // Payment Schedule Table Component with pagination
  const PaymentSchedule = () => {
    const totalPages = Math.ceil(paymentSchedule.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, paymentSchedule.length);
    const currentItems = paymentSchedule.slice(startIndex, endIndex);

    return (
      <div className="mt-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Payment Schedule</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowPaymentSchedule(false)}
          >
            Hide Schedule
          </Button>
        </div>
        <div className="border rounded-md overflow-auto max-h-[500px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Payment No.</TableHead>
                <TableHead>EMI Amount</TableHead>
                <TableHead>Principal</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Balance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.map((payment) => (
                <TableRow key={payment.month}>
                  <TableCell>{payment.month}</TableCell>
                  <TableCell>{formatCurrency(payment.emi)}</TableCell>
                  <TableCell>{formatCurrency(payment.principal)}</TableCell>
                  <TableCell>{formatCurrency(payment.interest)}</TableCell>
                  <TableCell>{formatCurrency(payment.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === 1}
                  />
                </PaginationItem>

                <PaginationItem>
                  <div className="flex items-center px-4">
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                  </div>
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                    aria-disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <p className="text-sm text-muted-foreground mt-2">
          Showing monthly payment details {startIndex + 1}-{endIndex} of {paymentSchedule.length}
        </p>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <CalculatorCard title="EMI Calculator" description="Calculate loan EMI, amount, interest or tenure">
          {/* 2x2 Grid Layout for Calculator Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {calculatorOptions.map(option => (
              <div
                key={option.id}
                onClick={() => setActiveTab(option.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-200 flex flex-col items-center justify-center text-center ${activeTab === option.id
                    ? 'bg-primary/10 text-primary border border-primary/30'
                    : 'bg-muted hover:bg-muted/80 border border-transparent'
                  }`}
              >
                <span className={`text-sm font-medium ${activeTab === option.id ? 'text-primary' : 'text-foreground/80'}`}>
                  {option.label}
                </span>
              </div>
            ))}
          </div>

          {/* Display the content for the active tab */}
          {calculatorOptions.find(option => option.id === activeTab)?.content}
        </CalculatorCard>
      </div>

      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResultDisplay
            label={getResultLabel()}
            value={getResultValue()}
            highlightColor="bg-primary/10"
            className="sm:col-span-1"
          />
          <ResultDisplay
            label="Total Interest"
            value={formatCurrency(totalInterest)}
            highlightColor="bg-red-500/10"
            className="sm:col-span-1"
          />
          <ResultDisplay
            label="Total Payment"
            value={formatCurrency(totalPayment)}
            highlightColor="bg-green-500/10"
            className="sm:col-span-1"
          />
        </div>

        {activeTab === 'emi' && (
          <>
            {chartData.length > 0 && (
              <LineChart
                title="Loan Amortization"
                data={chartData}
                series={[
                  { name: 'Principal Paid', dataKey: 'Principal Paid', color: '#1E90FF' },
                  { name: 'Interest Paid', dataKey: 'Interest Paid', color: '#FF6347' }
                ]}
                type="bar"
                yAxisFormatter={(value) => `₹${Math.round(value / 1000)}K`}
                tooltipFormatter={(value) => `₹${value.toLocaleString('en-IN')}`}
              />
            )}

            {!showPaymentSchedule && (
              <div className="text-center mt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentSchedule(true)}
                >
                  View Payment Schedule
                </Button>
              </div>
            )}

            {showPaymentSchedule && <PaymentSchedule />}
          </>
        )}
      </div>
    </div>
  );
};

export default EMICalculator;
