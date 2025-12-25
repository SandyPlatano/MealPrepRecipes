'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { PixelDecoration } from './pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// FAQ SECTION
// Accordion-style FAQ with pixel art styling
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
    <section className="py-24 bg-[#FDFBF7] border-t-4 border-b-4 border-[#111111] relative overflow-hidden">
      {/* Background decorations - pink accents */}
      <div className="absolute bottom-8 right-8 text-[#ff66c4]/10">
        <PixelDecoration variant="dots" />
      </div>
      <div className="absolute top-12 left-8 text-[#ff66c4]/8">
        <PixelDecoration variant="corner" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-block badge-pixel-orange mb-4">
              FAQ
            </div>
            <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#111111] mb-4">
              Questions & Answers
            </h2>
            <p className="text-[#666666]">
              Everything you need to know about meal planning.
            </p>
          </div>

          {/* Accordion */}
          <Accordion type="single" collapsible className="w-full space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border-3 border-[#111111] bg-white px-6 transition-all hover:bg-[#FDFBF7] data-[state=open]:shadow-brutal-sm data-[state=open]:bg-white"
              >
                <AccordionTrigger className="text-left text-base font-mono font-bold text-[#111111] hover:text-[#F97316] transition-colors py-5 [&[data-state=open]]:text-[#F97316]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-[#666666] pb-5">
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
