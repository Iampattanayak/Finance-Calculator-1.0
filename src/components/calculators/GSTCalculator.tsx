
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { RotateCcw } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import CalculatorInput from '../ui-elements/CalculatorInput';
import CalculatorCard from '../ui-elements/CalculatorCard';
import ResultDisplay from '../ui-elements/ResultDisplay';
import { calculateGST, formatCurrency } from '@/utils/calculatorUtils';

const GSTCalculator: React.FC = () => {
  const [amount, setAmount] = useState(1000);
  const [gstRate, setGstRate] = useState(18);
  const [calculationType, setCalculationType] = useState<'exclusive' | 'inclusive'>('exclusive');
  
  const [gstAmount, setGstAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  
  // Calculate GST results
  useEffect(() => {
    let result;
    
    if (calculationType === 'exclusive') {
      // GST is calculated on top of the amount
      result = calculateGST(amount, gstRate);
      setGstAmount(result.gstAmount);
      setTotalAmount(result.totalAmount);
      setNetAmount(result.amountWithoutGST);
    } else {
      // GST is included in the amount
      const gstFactor = 1 + (gstRate / 100);
      const netAmount = amount / gstFactor;
      const gstAmount = amount - netAmount;
      
      setGstAmount(gstAmount);
      setTotalAmount(amount);
      setNetAmount(netAmount);
    }
  }, [amount, gstRate, calculationType]);
  
  const handleReset = () => {
    setAmount(1000);
    setGstRate(18);
    setCalculationType('exclusive');
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1 space-y-6">
        <CalculatorCard title="GST Calculator" description="Calculate GST amount and total value">
          <div className="space-y-4">
            <Tabs 
              defaultValue="exclusive" 
              value={calculationType}
              onValueChange={(value) => setCalculationType(value as 'exclusive' | 'inclusive')}
              className="w-full mb-4"
            >
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="exclusive">GST Extra</TabsTrigger>
                <TabsTrigger value="inclusive">GST Inclusive</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <CalculatorInput
              id="amount"
              label={calculationType === 'exclusive' ? "Amount (Excluding GST)" : "Amount (Including GST)"}
              value={amount}
              onChange={setAmount}
              min={100}
              max={100000}
              step={100}
              prefix="₹"
              showSlider={true}
              placeholder="Enter amount"
            />
            
            <CalculatorInput
              id="gst-rate"
              label="GST Rate"
              value={gstRate}
              onChange={setGstRate}
              min={0}
              max={28}
              step={0.5}
              suffix="%"
              showSlider={true}
              placeholder="Enter GST rate"
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
        </CalculatorCard>
      </div>
      
      <div className="lg:col-span-2 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResultDisplay
            label={calculationType === 'exclusive' ? "Original Amount" : "Net Amount"}
            value={formatCurrency(netAmount)}
            highlightColor="bg-blue-500/10"
            className="sm:col-span-1"
          />
          <ResultDisplay
            label="GST Amount"
            value={formatCurrency(gstAmount)}
            subtitle={`(${gstRate}%)`}
            highlightColor="bg-amber-500/10"
            className="sm:col-span-1"
          />
          <ResultDisplay
            label="Total Amount"
            value={formatCurrency(totalAmount)}
            highlightColor="bg-primary/10"
            className="sm:col-span-1"
          />
        </div>
        
        <CalculatorCard title="GST Breakdown" className="w-full">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount (without GST)</span>
              <span className="font-medium">{formatCurrency(netAmount)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">CGST ({gstRate/2}%)</span>
              <span className="font-medium">{formatCurrency(gstAmount/2)}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">SGST ({gstRate/2}%)</span>
              <span className="font-medium">{formatCurrency(gstAmount/2)}</span>
            </div>
            
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-medium">Total Amount</span>
              <span className="font-semibold">{formatCurrency(totalAmount)}</span>
            </div>
          </div>
        </CalculatorCard>
      </div>
    </div>
  );
};

export default GSTCalculator;
