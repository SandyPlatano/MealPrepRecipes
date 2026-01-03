'use client';

import { useState } from 'react';
import { ArrowRight, Check, Sparkles, ShoppingCart, Users, Clock, Leaf, Star } from 'lucide-react';

// Star SVG component - the brand signature
function StarIcon({ className, size = 40, style }: { className?: string; size?: number; style?: React.CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      className={className}
      style={style}
    >
      <path
        d="M20 0L24.49 15.51L40 20L24.49 24.49L20 40L15.51 24.49L0 20L15.51 15.51L20 0Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Animated star burst effect
function StarBurst({ isActive }: { isActive: boolean }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <StarIcon
          key={i}
          size={12}
          className={`
            absolute text-[#D9F99D] transition-all duration-500
            ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}
          `}
          style={{
            top: '50%',
            left: '50%',
            transform: isActive
              ? `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-30px)`
              : 'translate(-50%, -50%)',
            transitionDelay: `${i * 50}ms`,
          }}
        />
      ))}
    </div>
  );
}

export default function StarBrandingDemo() {
  const [activeOption, setActiveOption] = useState<'A' | 'B' | 'C' | 'D'>('D');
  const [ctaHover, setCtaHover] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Option Selector */}
      <div className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-bold text-gray-900">Star Branding Options</h1>
            <div className="flex gap-2">
              {(['A', 'B', 'C', 'D'] as const).map((option) => (
                <button
                  key={option}
                  onClick={() => setActiveOption(option)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all
                    ${activeOption === option
                      ? 'bg-[#1A1A1A] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                  `}
                >
                  Option {option}
                  {option === 'D' && <span className="ml-1 text-xs">(Rec)</span>}
                </button>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            {activeOption === 'A' && 'Subtle Accents - Stars as refined decorative touches'}
            {activeOption === 'B' && 'Bold Signature - Stars as prominent visual anchors'}
            {activeOption === 'C' && 'Logo Integration - Star becomes part of brand identity'}
            {activeOption === 'D' && 'Hybrid Approach - Best of all three combined'}
          </p>
        </div>
      </div>

      {/* Live Preview */}
      <div className="bg-[#FFFCF6]">
        {/* Navigation */}
        <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo variations by option */}
          <div className="flex items-center gap-2">
            {activeOption === 'A' && (
              <>
                <div className="w-8 h-8 bg-[#D9F99D] rounded-lg flex items-center justify-center">
                  <span className="text-[#1A1A1A] font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[#1A1A1A]">
                  babewfd<span className="text-[#D9F99D]">.</span>
                </span>
              </>
            )}
            {activeOption === 'B' && (
              <>
                <div className="w-8 h-8 bg-[#D9F99D] rounded-lg flex items-center justify-center">
                  <span className="text-[#1A1A1A] font-bold text-sm">B</span>
                </div>
                <span className="font-bold text-xl text-[#1A1A1A]">
                  babewfd<span className="text-[#D9F99D]">.</span>
                </span>
              </>
            )}
            {activeOption === 'C' && (
              <>
                <div className="w-8 h-8 bg-[#D9F99D] rounded-lg flex items-center justify-center relative">
                  <span className="text-[#1A1A1A] font-bold text-sm">B</span>
                  <StarIcon size={10} className="absolute -top-1 -right-1 text-[#1A1A1A]" />
                </div>
                <span className="font-bold text-xl text-[#1A1A1A]">
                  babewfd<StarIcon size={8} className="inline text-[#D9F99D] ml-0.5" />
                </span>
              </>
            )}
            {activeOption === 'D' && (
              <>
                <div className="w-8 h-8 bg-[#D9F99D] rounded-lg flex items-center justify-center relative overflow-hidden">
                  <span className="text-[#1A1A1A] font-bold text-sm">B</span>
                  <StarIcon size={8} className="absolute top-0.5 right-0.5 text-[#1A1A1A]/30" />
                </div>
                <span className="font-bold text-xl text-[#1A1A1A]">
                  babewfd<span className="text-[#D9F99D]">.</span>
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-6">
            <span className="text-sm text-gray-600">Features</span>
            <span className="text-sm text-gray-600">Pricing</span>
            <span className="text-sm text-gray-600">FAQ</span>
            <button className="bg-[#1A1A1A] text-white px-4 py-2 rounded-full text-sm font-medium">
              Get started
            </button>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 text-center relative">
          {/* Decorative stars based on option */}
          {(activeOption === 'B' || activeOption === 'D') && (
            <>
              <StarIcon size={24} className="absolute top-8 left-[15%] text-[#1A1A1A]/10 animate-pulse" />
              <StarIcon size={16} className="absolute top-24 right-[20%] text-[#D9F99D] animate-pulse" style={{ animationDelay: '0.5s' }} />
              <StarIcon size={20} className="absolute bottom-32 left-[10%] text-[#1A1A1A]/10 animate-pulse" style={{ animationDelay: '1s' }} />
              <StarIcon size={14} className="absolute top-40 left-[25%] text-[#D9F99D]/50 animate-pulse" style={{ animationDelay: '0.3s' }} />
              <StarIcon size={18} className="absolute bottom-48 right-[15%] text-[#1A1A1A]/10 animate-pulse" style={{ animationDelay: '0.7s' }} />
            </>
          )}

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 py-2 shadow-sm">
            {activeOption === 'A' && <Sparkles className="w-4 h-4 text-[#84CC16]" />}
            {activeOption === 'B' && <StarIcon size={16} className="text-[#84CC16]" />}
            {activeOption === 'C' && <StarIcon size={16} className="text-[#84CC16]" />}
            {activeOption === 'D' && <StarIcon size={16} className="text-[#84CC16]" />}
            <span className="text-sm font-medium text-[#1A1A1A]">AI-Powered Meal Planning</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#1A1A1A] mb-6 leading-tight">
            Meal Planning That Works
            <br />
            for Real Life
          </h1>

          {/* Subheadline */}
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Import any recipe. Plan your week. Generate shopping lists.
            Cook step-by-step. All in one place.
          </p>

          {/* CTA Button */}
          <div className="relative inline-block">
            <button
              onMouseEnter={() => setCtaHover(true)}
              onMouseLeave={() => setCtaHover(false)}
              className="bg-[#1A1A1A] text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-gray-800 transition-all flex items-center gap-2 group shadow-lg hover:shadow-xl relative z-10"
            >
              Get started free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            {(activeOption === 'B' || activeOption === 'D') && (
              <StarBurst isActive={ctaHover} />
            )}
          </div>

          {/* Feature checks */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-10">
            {['AI Recipe Import', 'Smart Shopping Lists', 'No Credit Card'].map((feature) => (
              <div key={feature} className="flex items-center gap-2 text-sm">
                {activeOption === 'C' ? (
                  <StarIcon size={16} className="text-[#D9F99D]" />
                ) : (
                  <span className="w-5 h-5 bg-[#D9F99D] flex items-center justify-center rounded-full">
                    {(activeOption === 'A') ? (
                      <Check className="w-3 h-3 text-[#1A1A1A]" strokeWidth={3} />
                    ) : (
                      <StarIcon size={10} className="text-[#1A1A1A]" />
                    )}
                  </span>
                )}
                <span className="text-gray-600">{feature}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Trust Strip */}
        <section className={`
          py-6 border-y
          ${activeOption === 'B' ? 'bg-[#EFFFE3] border-[#D9F99D]/50' : 'bg-[#EFFFE3] border-[#D9F99D]/50'}
        `}>
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-8">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                Trusted by families
              </p>
              {[
                { icon: Users, value: '10K+', label: 'Home cooks' },
                { icon: Clock, value: '5hrs', label: 'Saved weekly' },
                { icon: Leaf, value: '47%', label: 'Less waste' },
                { icon: Star, value: '4.9', label: 'Rating' },
              ].map((stat) => (
                <div key={stat.label} className="flex items-center gap-2">
                  {(activeOption === 'B' || activeOption === 'D') ? (
                    <StarIcon size={14} className="text-[#1A1A1A]" />
                  ) : (
                    <stat.icon className="w-4 h-4 text-gray-600" />
                  )}
                  <span className="font-bold text-[#1A1A1A] text-sm">{stat.value}</span>
                  <span className="text-xs text-gray-500">{stat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section Preview */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            {/* Section Header */}
            <div className="text-center mb-16">
              {activeOption === 'B' && (
                <div className="flex items-center justify-center gap-3 mb-4">
                  <StarIcon size={20} className="text-[#D9F99D]" />
                  <StarIcon size={16} className="text-[#1A1A1A]/20" />
                  <StarIcon size={20} className="text-[#D9F99D]" />
                </div>
              )}
              <span className="inline-block mb-4 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm">
                {(activeOption === 'A') && 'How It Works'}
                {(activeOption === 'B' || activeOption === 'D') && (
                  <span className="flex items-center gap-2">
                    <StarIcon size={12} className="text-[#84CC16]" />
                    How It Works
                  </span>
                )}
                {activeOption === 'C' && (
                  <span className="flex items-center gap-2">
                    <StarIcon size={12} className="text-[#84CC16]" />
                    How It Works
                  </span>
                )}
              </span>
              <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
                From URL to table in 4 steps
              </h2>
              <p className="text-lg text-gray-600 max-w-xl mx-auto">
                See exactly how easy meal planning becomes.
              </p>
            </div>

            {/* Feature Card Example */}
            <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-10 items-center">
              {/* Demo Card */}
              <div className="bg-[#FFF6D8] rounded-2xl p-6">
                <div className="bg-white rounded-xl p-4 shadow-lg">
                  <div className="flex items-center gap-2 mb-3">
                    <ShoppingCart className="w-4 h-4 text-gray-500" />
                    <span className="text-xs font-medium text-gray-600">Paste any URL</span>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-3 mb-3">
                    <div className="text-[10px] text-gray-400 mb-1">Recipe URL</div>
                    <div className="text-xs text-gray-600">https://seriouseats.com/beef-stew</div>
                  </div>
                  <div className="space-y-2">
                    {['Ingredients extracted', 'Steps formatted', 'Nutrition added'].map((item) => (
                      <div key={item} className="flex items-center gap-2">
                        {activeOption === 'C' ? (
                          <StarIcon size={12} className="text-[#D9F99D]" />
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-[#D9F99D] flex items-center justify-center">
                            {(activeOption === 'B' || activeOption === 'D') ? (
                              <StarIcon size={6} className="text-[#1A1A1A]" />
                            ) : (
                              <Check className="w-2 h-2 text-[#1A1A1A]" />
                            )}
                          </div>
                        )}
                        <span className="text-[10px] text-gray-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div>
                <div className="flex items-center gap-4 mb-5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm">
                    <span className="text-xs font-bold text-gray-400">01</span>
                  </div>
                  <div className="h-px flex-1 bg-gray-200" />
                </div>
                <h3 className="text-2xl font-bold text-[#1A1A1A] mb-3">
                  Import recipes from anywhere
                </h3>
                <p className="text-gray-600 mb-5">
                  Paste any URL from your favorite food blog. Our AI extracts everything.
                </p>
                <ul className="space-y-2.5 mb-6">
                  {['Works with any recipe website', 'AI cleans up formatting', 'Extracts ingredients & quantities'].map((detail) => (
                    <li key={detail} className="flex items-center gap-2.5 text-sm text-gray-600">
                      {activeOption === 'C' ? (
                        <StarIcon size={14} className="text-[#D9F99D]" />
                      ) : (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#D9F99D]">
                          {(activeOption === 'B' || activeOption === 'D') ? (
                            <StarIcon size={8} className="text-[#1A1A1A]" />
                          ) : (
                            <Check className="h-2.5 w-2.5 text-[#1A1A1A]" strokeWidth={3} />
                          )}
                        </span>
                      )}
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#E4F8C9] py-20 relative overflow-hidden">
          {/* Decorative stars */}
          {(activeOption === 'B' || activeOption === 'D') && (
            <>
              <StarIcon size={32} className="absolute top-8 left-[10%] text-[#1A1A1A]/10" />
              <StarIcon size={24} className="absolute top-12 right-[15%] text-[#1A1A1A]/10" />
              <StarIcon size={40} className="absolute bottom-8 left-[20%] text-[#1A1A1A]/5" />
              <StarIcon size={28} className="absolute bottom-16 right-[10%] text-[#1A1A1A]/10" />
            </>
          )}

          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl font-bold text-[#1A1A1A] mb-4">
              Ready to answer
              <br />
              &ldquo;What&apos;s for dinner?&rdquo;
            </h2>
            <p className="text-gray-700 max-w-xl mx-auto mb-8">
              Join thousands of home cooks who plan smarter, shop faster, and cook better.
            </p>
            <div className="relative inline-block">
              <button
                onMouseEnter={() => setCtaHover(true)}
                onMouseLeave={() => setCtaHover(false)}
                className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition-all flex items-center gap-2 group shadow-md hover:shadow-lg relative z-10"
              >
                Get started free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-4">
              No credit card required. Free forever plan available.
            </p>
          </div>
        </section>

        {/* Comparison Summary */}
        <section className="bg-white py-16 border-t">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl font-bold text-center mb-8">What you're seeing</h2>
            <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { option: 'A', title: 'Subtle Accents', desc: 'Minimal stars, checkmarks remain, refined feel' },
                { option: 'B', title: 'Bold Signature', desc: 'Constellation pattern, stars everywhere, statement design' },
                { option: 'C', title: 'Logo Integration', desc: 'Star in logo, stars replace all checkmarks' },
                { option: 'D', title: 'Hybrid (Rec)', desc: 'Best of all: logo accent, decorative stars, star bullets' },
              ].map((item) => (
                <button
                  key={item.option}
                  onClick={() => setActiveOption(item.option as 'A' | 'B' | 'C' | 'D')}
                  className={`
                    p-4 rounded-xl border-2 text-left transition-all
                    ${activeOption === item.option
                      ? 'border-[#D9F99D] bg-[#EFFFE3]'
                      : 'border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`
                      w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${activeOption === item.option ? 'bg-[#1A1A1A] text-white' : 'bg-gray-100 text-gray-600'}
                    `}>
                      {item.option}
                    </span>
                    <span className="font-semibold text-[#1A1A1A]">{item.title}</span>
                  </div>
                  <p className="text-sm text-gray-600">{item.desc}</p>
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
