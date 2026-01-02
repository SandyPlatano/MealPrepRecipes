'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// FAQ SECTION - Warm & Cozy Design System
// Clean accordion with soft shadows and rounded corners
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
    <section className="py-24 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <span className="bg-[#D9F99D] text-[#1A1A1A] text-sm font-semibold px-4 py-2 rounded-full inline-flex items-center gap-2 mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQ
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] mb-4">
              Questions & Answers
            </h2>
            <p className="text-gray-600">
              Everything you need to know about meal planning.
            </p>
          </div>

          {/* Accordion with Warm & Cozy styling */}
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border border-gray-200 bg-white rounded-xl shadow-sm px-6 hover:shadow-md transition-shadow data-[state=open]:border-[#D9F99D] data-[state=open]:shadow-md"
              >
                <AccordionTrigger className="text-left text-base font-semibold text-[#1A1A1A] hover:text-gray-700 transition-colors py-5 [&[data-state=open]]:text-[#1A1A1A]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-5 leading-relaxed">
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
