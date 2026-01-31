
import React from 'react';
import { BlogContent } from '@/utils/blogContent';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface BlogSectionProps {
  content: BlogContent;
}

const BlogSection: React.FC<BlogSectionProps> = ({ content }) => {
  return (
    <section className="my-12" aria-labelledby="calculator-guide">
      <h2 id="calculator-guide" className="text-3xl font-bold mb-6 text-foreground/90">{content.title}</h2>
      <p className="text-lg text-muted-foreground mb-8">{content.description}</p>
      
      <div className="space-y-8">
        {content.sections.map((section, index) => (
          <div key={index}>
            <h3 className="text-xl font-semibold mb-4 text-foreground/90">{section.heading}</h3>
            <div className="prose prose-gray max-w-none">
              <p className="text-muted-foreground leading-relaxed">{section.content}</p>
            </div>
            {index < content.sections.length - 1 && <Separator className="my-6" />}
          </div>
        ))}
      </div>
      
      {content.faqs && content.faqs.length > 0 && (
        <>
          <h3 className="text-2xl font-bold mt-12 mb-6 text-foreground/90">Frequently Asked Questions</h3>
          <div className="space-y-6">
            {content.faqs.map((faq, index) => (
              <Card key={index} className="border border-border/60">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
      
      {content.relatedTools && (
        <div className="mt-12">
          <h3 className="text-xl font-semibold mb-4 text-foreground/90">Related Financial Tools</h3>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            {content.relatedTools.map((tool, index) => (
              <li key={index}>{tool}</li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
};

export default BlogSection;
