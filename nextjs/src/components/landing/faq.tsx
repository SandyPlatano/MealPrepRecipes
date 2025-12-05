"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "Is it really free?",
    answer:
      "Yes! The free plan includes unlimited recipes, weekly meal planning, shopping lists, and AI recipe import. No credit card required. We'll add premium features later for those who want more.",
  },
  {
    question: "How does the AI recipe import work?",
    answer:
      "Just paste a URL from any recipe website. Our AI reads the page and extracts the title, ingredients, instructions, cook times, and more. No more copying and pasting ingredient lists manually.",
  },
  {
    question: "Can my partner and I use it together?",
    answer:
      "Right now, you can share shopping lists via email or text. Full household sharing with synced recipes and meal plans is coming soon with our Pro plan.",
  },
  {
    question: "What happens to my recipes?",
    answer:
      "Your recipes are saved securely in the cloud. You can access them from any device, export them as PDF or Markdown, and they're always backed up.",
  },
  {
    question: "Can I import recipes from any website?",
    answer:
      "Our AI works with most recipe websites. It reads the page content and extracts the recipe details automatically. If a site doesn't work, you can always add recipes manually.",
  },
  {
    question: "How do shopping lists work?",
    answer:
      "When you plan meals for the week, we automatically generate a shopping list from all the ingredients. Items are organized by store aisle so you can shop efficiently.",
  },
  {
    question: "Is there a mobile app?",
    answer:
      "Not yet, but the website works great on mobile! You can add it to your home screen for an app-like experience. A native app is on our roadmap.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "The free plan is free forever. If you upgrade to Pro (coming soon), you can cancel anytime. No long-term contracts or commitments.",
  },
];

export function FAQ() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-mono font-bold mb-4">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground">
              Everything you need to know about meal planning with us.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left text-base font-medium">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
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
