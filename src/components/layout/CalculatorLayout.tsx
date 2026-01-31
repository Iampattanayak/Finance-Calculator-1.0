
import React, { ReactNode } from 'react';
import BlogSection from '../ui-elements/BlogSection';
import { getBlogContent } from '@/utils/blogContent';
import { Separator } from '@/components/ui/separator';

interface CalculatorLayoutProps {
  children: ReactNode;
  calculatorType?: string;
}

const CalculatorLayout: React.FC<CalculatorLayoutProps> = ({ children, calculatorType = '' }) => {
  const blogContent = getBlogContent(calculatorType);

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 py-6">
        {children}
        
        <Separator className="my-10" />
        
        <BlogSection content={blogContent} />
      </div>
      <footer className="py-4 px-4 sm:px-6 border-t border-border/60 text-center text-sm text-muted-foreground">
        <p>Finance Calculator &copy; {new Date().getFullYear()}</p>
      </footer>
    </main>
  );
};

export default CalculatorLayout;
