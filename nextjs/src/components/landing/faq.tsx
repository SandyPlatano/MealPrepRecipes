'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// FAQ SECTION - Neo-Brutalist/Retro Style
// Bold accordion with thick borders, retro shadows, and primary red accents
// ═══════════════════════════════════════════════════════════════════════════

const faqs = [
  {
    question: 'Is it really free?',
    answer:
      "Yes! The free plan includes 10 recipes, weekly meal planning, shopping lists, and AI recipe import. No credit card required. Upgrade anytime for more features.",
  },
  {
    question: 'How does the AI recipe import work?',
    answer:
      'Just paste a URL from any recipe website. Our AI reads the page and extracts the title, ingredients, instructions, cook times, and more. No more copying and pasting ingredient lists manually.',
  },
  {
    question: 'Can my partner and I use it together?',
    answer:
      'Yes! Pro and Premium plans include household sharing. Multiple people can collaborate on meal plans, shopping lists, and recipes from any device.',
  },
  {
    question: 'What happens to my recipes?',
    answer:
      "Your recipes are saved securely in the cloud. You can access them from any device, export them as PDF, and they're always backed up.",
  },
  {
    question: 'Can I import recipes from any website?',
    answer:
      "Our AI works with most recipe websites. It reads the page content and extracts the recipe details automatically. If a site doesn't work, you can always add recipes manually.",
  },
  {
    question: 'How do shopping lists work?',
    answer:
      'When you plan meals for the week, we automatically generate a shopping list from all the ingredients. Items are organized by store aisle so you can shop efficiently.',
  },
  {
    question: 'Is there a mobile app?',
    answer:
      "Not yet, but the website works great on mobile! You can add it to your home screen for an app-like experience. A native app is on our roadmap.",
  },
  {
    question: 'Can I cancel anytime?',
    answer:
      "The free plan is free forever. If you upgrade, you can cancel anytime. No long-term contracts or commitments.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="py-24 bg-card relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="bg-secondary border-2 border-black text-foreground text-xs font-bold px-3 py-1 rounded inline-flex items-center gap-2 mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
              Questions & Answers
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about meal planning.
            </p>
          </div>

          {/* Accordion with retro styling */}
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-2 border-black bg-card rounded-xl hover: hover:translate-x-[1px] hover:translate-y-[1px] transition-all px-6 data-[state=open]:border-primary data-[state=open]:"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-primary transition-colors py-5 [&[data-state=open]]:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
