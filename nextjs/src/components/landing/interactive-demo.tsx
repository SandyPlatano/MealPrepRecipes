'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, Loader2, Sparkles, Clock, Users, Flame, ArrowRight, Globe } from 'lucide-react';
import Link from 'next/link';
import { StarSmall } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// INTERACTIVE DEMO - Premium Product Showcase
// Glassmorphism container, site logos, spring animations, polished result
// ═══════════════════════════════════════════════════════════════════════════

// Simulated extracted recipe
const DEMO_RECIPE = {
  title: 'One-Pot Creamy Tuscan Chicken',
  source: 'seriouseats.com',
  prepTime: '15 min',
  cookTime: '25 min',
  servings: 4,
  calories: 420,
  ingredients: [
    { name: 'Chicken thighs', emoji: '🍗' },
    { name: 'Spinach', emoji: '🥬' },
    { name: 'Sun-dried tomatoes', emoji: '🍅' },
    { name: 'Heavy cream', emoji: '🥛' },
    { name: 'Garlic', emoji: '🧄' },
    { name: 'Parmesan', emoji: '🧀' },
  ],
};

const SUPPORTED_SITES = [
  'AllRecipes',
  'NYT Cooking',
  'Bon Appétit',
  'Serious Eats',
  'Epicurious',
];

type DemoPhase = 'idle' | 'typing' | 'extracting' | 'complete';

const EXTRACTION_STEPS = [
  { text: 'Reading page content...', icon: '📄' },
  { text: 'Extracting ingredients...', icon: '🥬' },
  { text: 'Parsing instructions...', icon: '📝' },
  { text: 'Calculating nutrition...', icon: '⚡' },
];

export function InteractiveDemo() {
  const [phase, setPhase] = useState<DemoPhase>('idle');
  const [inputValue, setInputValue] = useState('');
  const [extractionStep, setExtractionStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
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

  const handleTryExample = () => {
    setPhase('typing');
    setInputValue('');

    const exampleUrl = 'https://seriouseats.com/tuscan-chicken';
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < exampleUrl.length) {
        setInputValue(exampleUrl.slice(0, charIndex + 1));
        charIndex++;
      } else {
        clearInterval(typeInterval);
        setTimeout(() => {
          setPhase('extracting');
          runExtraction();
        }, 400);
      }
    }, 35);
  };

  const runExtraction = () => {
    setExtractionStep(0);

    let step = 0;
    const stepInterval = setInterval(() => {
      step++;
      if (step < EXTRACTION_STEPS.length) {
        setExtractionStep(step);
      } else {
        clearInterval(stepInterval);
        setTimeout(() => setPhase('complete'), 400);
      }
    }, 700);
  };

  const handleReset = () => {
    setPhase('idle');
    setInputValue('');
    setExtractionStep(0);
  };

  return (
    <section
      ref={sectionRef}
      id="demo"
      className="py-20 md:py-28 bg-gradient-to-b from-white via-[#FAFFF8] to-white relative overflow-hidden"
    >
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className={`
            inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200
            bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
            transition-all duration-700
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <Sparkles className="w-4 h-4 text-[#84CC16]" />
            Try It Yourself
          </span>
          <h2 className={`
            text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4
            transition-all duration-700 delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            See the magic in 30 seconds
          </h2>
          <p className={`
            text-gray-600 text-lg max-w-xl mx-auto
            transition-all duration-700 delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Paste any recipe URL and watch our AI extract everything automatically.
          </p>
        </div>

        {/* Demo Card - Glassmorphism Container */}
        <div className={`
          max-w-2xl mx-auto
          transition-all duration-700 delay-300
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
        `}>
          <div className="relative">
            {/* Glow effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-[#D9F99D]/30 via-[#D9F99D]/20 to-[#D9F99D]/30 blur-2xl rounded-3xl opacity-60" />

            {/* Main card */}
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200/60 shadow-premium-lg overflow-hidden">
              {/* Input Section */}
              <div className="p-6 border-b border-gray-100/80">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Recipe URL
                </label>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={inputValue}
                      readOnly
                      placeholder="https://your-favorite-recipe.com/..."
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 bg-white/80 text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-[#D9F99D] transition-all"
                    />
                  </div>
                  {phase === 'idle' && (
                    <button
                      onClick={handleTryExample}
                      className="px-6 py-3.5 bg-[#1A1A1A] text-white rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 group shadow-lg hover:shadow-xl active:scale-[0.98]"
                    >
                      <Sparkles className="w-4 h-4" />
                      Try Example
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  )}
                  {phase === 'complete' && (
                    <button
                      onClick={handleReset}
                      className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-medium text-sm hover:bg-gray-200 transition-all active:scale-[0.98]"
                    >
                      Try Again
                    </button>
                  )}
                </div>
              </div>

              {/* Extraction Progress */}
              {(phase === 'extracting' || phase === 'typing') && (
                <div className="p-6 bg-gradient-to-br from-gray-50/80 to-[#FAFFF8]/80">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-8 h-8 rounded-full bg-[#D9F99D] flex items-center justify-center">
                      <Loader2 className="w-4 h-4 text-[#1A1A1A] animate-spin" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {phase === 'typing' ? 'Preparing...' : EXTRACTION_STEPS[extractionStep].text}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {EXTRACTION_STEPS.map((step, index) => (
                      <div
                        key={step.text}
                        className={`
                          flex items-center gap-3 text-sm p-3 rounded-lg transition-all duration-500
                          ${index <= extractionStep && phase === 'extracting'
                            ? 'bg-white shadow-sm border border-gray-100'
                            : 'bg-transparent'
                          }
                        `}
                        style={{
                          transitionDelay: `${index * 100}ms`,
                        }}
                      >
                        <span className="text-lg">{step.icon}</span>
                        <span className={`flex-1 ${
                          index <= extractionStep && phase === 'extracting'
                            ? 'text-gray-700'
                            : 'text-gray-400'
                        }`}>
                          {step.text}
                        </span>
                        {index < extractionStep && phase === 'extracting' ? (
                          <div className="w-5 h-5 rounded-full bg-[#D9F99D] flex items-center justify-center">
                            <Check className="w-3 h-3 text-[#1A1A1A]" />
                          </div>
                        ) : index === extractionStep && phase === 'extracting' ? (
                          <Loader2 className="w-4 h-4 text-[#84CC16] animate-spin" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-200" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Extracted Recipe - Enhanced Result */}
              {phase === 'complete' && (
                <div className="p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-start justify-between mb-5">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-[#1A1A1A]">
                          {DEMO_RECIPE.title}
                        </h3>
                        <div className="bg-[#D9F99D] rounded-full p-1">
                          <Check className="w-3 h-3 text-[#1A1A1A]" />
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {DEMO_RECIPE.source}
                      </p>
                    </div>
                  </div>

                  {/* Recipe Stats Pills */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-600">Prep: {DEMO_RECIPE.prepTime}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                      <Flame className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-600">Cook: {DEMO_RECIPE.cookTime}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-xs text-gray-600">Serves: {DEMO_RECIPE.servings}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-[#D9F99D]/30 rounded-full px-3 py-1.5">
                      <span className="text-xs text-gray-700 font-medium">{DEMO_RECIPE.calories} cal</span>
                    </div>
                  </div>

                  {/* Ingredients Preview with Emojis */}
                  <div className="mb-6">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">
                      Ingredients ({DEMO_RECIPE.ingredients.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {DEMO_RECIPE.ingredients.map((ing, index) => (
                        <span
                          key={ing.name}
                          className="inline-flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-3 py-1.5 text-xs text-gray-600 shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <span>{ing.emoji}</span>
                          {ing.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <Link href="/signup">
                    <button className="w-full bg-[#1A1A1A] text-white py-4 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all duration-200 flex items-center justify-center gap-2 group shadow-lg hover:shadow-xl active:scale-[0.99]">
                      <StarSmall size={14} className="text-[#D9F99D]" />
                      Add to Meal Plan
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  </Link>
                </div>
              )}

              {/* Idle State */}
              {phase === 'idle' && (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#D9F99D]/30 to-[#D9F99D]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-[#84CC16]" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Click &quot;Try Example&quot; to see the AI extraction in action
                  </p>
                  <p className="text-xs text-gray-400">
                    No sign up required
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Supported Sites */}
        <div className={`
          mt-10 text-center
          transition-all duration-700 delay-500
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <p className="text-sm text-gray-500 mb-4">Works with 500+ recipe sites including</p>
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8">
            {SUPPORTED_SITES.map((site) => (
              <span key={site} className="text-sm font-medium text-gray-400 hover:text-gray-600 transition-colors">
                {site}
              </span>
            ))}
            <span className="text-sm text-gray-400">& more</span>
          </div>
        </div>
      </div>
    </section>
  );
}
