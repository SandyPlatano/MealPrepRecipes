'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MessageCircle } from 'lucide-react';
import { StarSmall, StarDecoration } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// FAQ SECTION - Premium & Polished Redesign
// Spring animations, generous padding, chat fallback
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
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="py-24 md:py-28 bg-white relative overflow-hidden">
      {/* Decorative stars */}
      <StarDecoration
        size={20}
        className="absolute top-16 right-[12%] text-[#D9F99D]/30"
      />
      <StarSmall
        size={14}
        className="absolute bottom-24 left-[8%] text-[#1A1A1A]/10"
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-14">
            <span className={`
              inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200
              bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
              transition-all duration-700
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              <StarSmall size={12} className="text-[#84CC16]" />
              FAQ
            </span>
            <h2 className={`
              text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4
              transition-all duration-700 delay-100
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              Questions & Answers
            </h2>
            <p className={`
              text-gray-600 text-lg
              transition-all duration-700 delay-200
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
            `}>
              Everything you need to know about meal planning.
            </p>
          </div>

          {/* Accordion with Premium styling */}
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className={`
                  border border-gray-200 bg-white rounded-2xl shadow-sm px-6 md:px-8
                  hover:shadow-md transition-all duration-300
                  data-[state=open]:border-[#D9F99D] data-[state=open]:shadow-lg
                  data-[state=open]:bg-gradient-to-br data-[state=open]:from-white data-[state=open]:to-[#FAFFF8]
                  ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
                `}
                style={{ transitionDelay: `${300 + index * 50}ms` }}
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold text-[#1A1A1A] hover:text-gray-700 transition-colors py-6 [&[data-state=open]]:text-[#1A1A1A]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-gray-600 pb-6 leading-relaxed text-base">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {/* Chat Fallback */}
          <div className={`
            mt-12 text-center
            transition-all duration-700 delay-700
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <div className="inline-flex items-center gap-4 bg-gradient-to-br from-[#FAFFF8] to-[#F0FDF4] rounded-2xl px-6 py-4 border border-[#D9F99D]/30">
              <div className="w-10 h-10 rounded-full bg-[#D9F99D] flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-[#1A1A1A]" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-[#1A1A1A]">Still have questions?</p>
                <p className="text-sm text-gray-600">
                  <a href="mailto:support@babewfd.com" className="text-[#84CC16] hover:underline font-medium">
                    Chat with us
                  </a>
                  {' '}— we&apos;re here to help!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
