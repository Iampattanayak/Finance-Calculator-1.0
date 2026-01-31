// Finance calculation functions

// EMI calculation
export interface ChartDataPoint {
  name: string;
  [key: string]: number | string;
}

export const calculateEMI = (principal: number, rate: number, time: number): number => {
  // Convert interest rate from percentage to decimal and to monthly rate
  const monthlyRate = rate / 12 / 100;
  // Convert time from years to months
  const months = time * 12;

  // Handle edge cases
  if (principal <= 0 || rate <= 0 || time <= 0) return 0;

  // EMI formula: [P x R x (1+R)^N]/[(1+R)^N-1]
  const numerator = principal * monthlyRate * Math.pow(1 + monthlyRate, months);
  const denominator = Math.pow(1 + monthlyRate, months) - 1;

  return numerator / denominator;
};

// Calculate loan amount based on EMI
export const calculateLoanAmount = (emi: number, rate: number, time: number): number => {
  // Convert interest rate from percentage to decimal and to monthly rate
  const monthlyRate = rate / 12 / 100;
  // Convert time from years to months
  const months = time * 12;

  // Handle edge cases
  if (emi <= 0 || rate <= 0 || time <= 0) return 0;

  // Loan Amount formula: [EMI * ((1+R)^N - 1)] / [R * (1+R)^N]
  const numerator = emi * (Math.pow(1 + monthlyRate, months) - 1);
  const denominator = monthlyRate * Math.pow(1 + monthlyRate, months);

  return numerator / denominator;
};

// Calculate interest rate (approximation using binary search)
export const calculateInterestRate = (emi: number, principal: number, time: number): number => {
  // Handle edge cases
  if (emi <= 0 || principal <= 0 || time <= 0) return 0;

  // Binary search to find interest rate
  let low = 0;
  let high = 100;
  let mid;
  let calculatedEMI;

  // Set a limit for iterations and precision
  const maxIterations = 100;
  const precision = 0.01;

  for (let i = 0; i < maxIterations; i++) {
    mid = (low + high) / 2;
    calculatedEMI = calculateEMI(principal, mid, time);

    if (Math.abs(calculatedEMI - emi) < precision) {
      return Number(mid.toFixed(2));
    } else if (calculatedEMI < emi) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Number(mid!.toFixed(2));
};

// Calculate time period (approximation using binary search)
export const calculateTimePeriod = (emi: number, principal: number, rate: number): number => {
  // Handle edge cases
  if (emi <= 0 || principal <= 0 || rate <= 0) return 0;

  // Binary search to find time period
  let low = 0;
  let high = 30; // 30 years as upper limit
  let mid;
  let calculatedEMI;

  // Set a limit for iterations and precision
  const maxIterations = 100;
  const precision = 0.01;

  for (let i = 0; i < maxIterations; i++) {
    mid = (low + high) / 2;
    calculatedEMI = calculateEMI(principal, rate, mid);

    if (Math.abs(calculatedEMI - emi) < precision) {
      return Number(mid.toFixed(2));
    } else if (calculatedEMI > emi) {
      low = mid;
    } else {
      high = mid;
    }
  }

  return Number(mid!.toFixed(2));
};

// Calculate SIP returns
export const calculateSIP = (
  monthlyInvestment: number,
  expectedReturnRate: number,
  timePeriodYears: number
): number => {
  const monthlyRate = expectedReturnRate / 12 / 100;
  const months = timePeriodYears * 12;

  // Handle edge cases
  if (monthlyInvestment <= 0 || expectedReturnRate <= 0 || timePeriodYears <= 0) return 0;

  // SIP Formula: P × ({[1 + r]^n - 1} / r) × (1 + r)
  const amount = monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  return amount;
};

// Calculate GST
export const calculateGST = (amount: number, rate: number): {
  gstAmount: number;
  totalAmount: number;
  amountWithoutGST: number;
} => {
  // Handle edge cases
  if (amount <= 0 || rate < 0) {
    return {
      gstAmount: 0,
      totalAmount: 0,
      amountWithoutGST: 0
    };
  }

  // Calculate GST amount and total
  const gstAmount = amount * (rate / 100);
  const totalAmount = amount + gstAmount;

  return {
    gstAmount,
    totalAmount,
    amountWithoutGST: amount
  };
};

// Format currency for display
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

// Calculate amortization schedule for loan
export const calculateAmortizationSchedule = (
  principal: number,
  rate: number,
  time: number
): Array<{
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}> => {
  const emi = calculateEMI(principal, rate, time);
  const monthlyRate = rate / 12 / 100;
  const totalMonths = time * 12;

  let balance = principal;
  const schedule = [];

  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPaid = emi - interest;
    balance -= principalPaid;

    schedule.push({
      month,
      emi,
      principal: principalPaid,
      interest,
      balance: balance > 0 ? balance : 0
    });

    if (balance <= 0) break;
  }

  return schedule;
};

// Generate chart data for EMI visualization
export const generateEMIChartData = (
  principal: number,
  rate: number,
  time: number
): {
  labels: string[];
  principal: number[];
  interest: number[];
} => {
  const schedule = calculateAmortizationSchedule(principal, rate, time);
  // Take data points at regular intervals to keep chart clean
  const interval = Math.max(1, Math.floor(schedule.length / 12));

  const filteredSchedule = schedule.filter((_, index) => index % interval === 0 || index === schedule.length - 1);

  return {
    labels: filteredSchedule.map(item => `Month ${item.month}`),
    principal: filteredSchedule.map(item => principal - item.balance),
    interest: filteredSchedule.map((item, index, array) => {
      // Calculate cumulative interest paid until this point
      const monthIndex = array.findIndex(a => a.month === item.month);
      return array.slice(0, monthIndex + 1).reduce((total, current) => total + current.interest, 0);
    })
  };
};

// Generate chart data for SIP visualization
export const generateSIPChartData = (
  monthlyInvestment: number,
  expectedReturnRate: number,
  timePeriodYears: number
): {
  labels: string[];
  investedAmount: number[];
  wealthGained: number[];
} => {
  const totalMonths = timePeriodYears * 12;
  const monthlyRate = expectedReturnRate / 12 / 100;

  const yearlyData = [];

  for (let year = 1; year <= timePeriodYears; year++) {
    const months = year * 12;
    const investedAmount = monthlyInvestment * months;
    const futureValue = monthlyInvestment *
      ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
      (1 + monthlyRate);

    yearlyData.push({
      year,
      investedAmount,
      futureValue,
      wealthGained: futureValue - investedAmount
    });
  }

  return {
    labels: yearlyData.map(item => `Year ${item.year}`),
    investedAmount: yearlyData.map(item => item.investedAmount),
    wealthGained: yearlyData.map(item => item.wealthGained)
  };
};

// Calculate Fixed Deposit maturity amount
export const calculateFD = (
  principal: number,
  interestRate: number,
  timePeriodYears: number,
  interestFrequency: 'monthly' | 'quarterly' | 'cumulative' = 'cumulative'
): number => {
  // Handle edge cases
  if (principal <= 0 || interestRate <= 0 || timePeriodYears <= 0) return 0;

  const r = interestRate / 100; // Convert percentage to decimal

  // Calculate based on interest frequency
  switch (interestFrequency) {
    case 'monthly':
      // For monthly interest payout, simple interest for each month
      return principal + (principal * r * timePeriodYears);

    case 'quarterly': {
      // For quarterly compounding
      const quarterlyRate = r / 4;
      const quarters = timePeriodYears * 4;
      return principal * Math.pow(1 + quarterlyRate, quarters);
    }

    case 'cumulative':
    default:
      // For annual compounding (default)
      return principal * Math.pow(1 + r, timePeriodYears);
  }
};

// Calculate Recurring Deposit maturity amount
export const calculateRD = (
  monthlyDeposit: number,
  interestRate: number,
  timePeriodMonths: number
): number => {
  // Handle edge cases
  if (monthlyDeposit <= 0 || interestRate <= 0 || timePeriodMonths <= 0) return 0;

  const r = interestRate / 100 / 4; // Quarterly rate in decimal
  const n = timePeriodMonths;

  // Formula for RD: P * (1 + r)^n
  // where P is monthly deposit, r is rate per quarter, n is number of months

  // Calculate the maturity amount using the formula:
  // M = R × {(1 + r)^n - 1} / r
  const maturityAmount = monthlyDeposit * ((Math.pow(1 + r, n) - 1) / r);

  return maturityAmount;
};

// Calculate PPF (Public Provident Fund) maturity amount
export const calculatePPF = (
  yearlyDeposit: number,
  interestRate: number,
  durationYears: number
): number => {
  // Handle edge cases
  if (yearlyDeposit <= 0 || interestRate <= 0 || durationYears <= 0) return 0;

  const r = interestRate / 100; // Convert interest rate to decimal
  let balance = 0;

  // PPF calculation is done year by year with compound interest
  for (let year = 1; year <= durationYears; year++) {
    // Add this year's deposit
    balance += yearlyDeposit;

    // Add interest for the year
    balance += balance * r;
  }

  return balance;
};

// Generate chart data for FD visualization
export const generateFDChartData = (
  principal: number,
  interestRate: number,
  timePeriodYears: number,
  interestFrequency: 'monthly' | 'quarterly' | 'cumulative' = 'cumulative'
): {
  labels: string[];
  principal: number[];
  interest: number[];
} => {
  const labels = [];
  const principalData = [];
  const interestData = [];

  for (let year = 1; year <= timePeriodYears; year++) {
    const maturityAmount = calculateFD(principal, interestRate, year, interestFrequency);
    const interestEarned = maturityAmount - principal;

    labels.push(`Year ${year}`);
    principalData.push(principal);
    interestData.push(interestEarned);
  }

  return {
    labels,
    principal: principalData,
    interest: interestData
  };
};

// Generate chart data for RD visualization
export const generateRDChartData = (
  monthlyDeposit: number,
  interestRate: number,
  timePeriodMonths: number
): {
  labels: string[];
  deposits: number[];
  interest: number[];
} => {
  const labels = [];
  const depositsData = [];
  const interestData = [];

  // Take quarters as data points to keep chart clean
  const interval = Math.max(3, Math.floor(timePeriodMonths / 12));

  for (let month = interval; month <= timePeriodMonths; month += interval) {
    const maturityAmount = calculateRD(monthlyDeposit, interestRate, month);
    const totalDeposited = monthlyDeposit * month;
    const interestEarned = maturityAmount - totalDeposited;

    labels.push(`Month ${month}`);
    depositsData.push(totalDeposited);
    interestData.push(interestEarned);
  }

  return {
    labels,
    deposits: depositsData,
    interest: interestData
  };
};

// Generate chart data for PPF visualization
export const generatePPFChartData = (
  yearlyDeposit: number,
  interestRate: number,
  durationYears: number
): {
  labels: string[];
  deposits: number[];
  interest: number[];
} => {
  const labels = [];
  const depositsData = [];
  const interestData = [];

  let balance = 0;
  let totalDeposited = 0;

  for (let year = 1; year <= durationYears; year++) {
    // Add this year's deposit
    totalDeposited += yearlyDeposit;
    balance += yearlyDeposit;

    // Add interest for the year
    const interestForYear = balance * (interestRate / 100);
    balance += interestForYear;

    labels.push(`Year ${year}`);
    depositsData.push(totalDeposited);
    interestData.push(balance - totalDeposited);
  }

  return {
    labels,
    deposits: depositsData,
    interest: interestData
  };
};
