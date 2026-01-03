'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';
import { StarSmall, StarDecoration } from './shared/star-decoration';

// ═══════════════════════════════════════════════════════════════════════════
// TESTIMONIALS SECTION - Premium Carousel with Social Proof
// Larger cards, specific metrics, couple avatars, platform badges
// ═══════════════════════════════════════════════════════════════════════════

interface Testimonial {
  quote: string;
  names: string[];
  location: string;
  familyType: string;
  metric: {
    value: string;
    label: string;
  };
  avatarColors: string[];
}

const TESTIMONIALS: Testimonial[] = [
  {
    quote: "We used to spend $200/week on groceries and still order takeout twice. Now we spend $140 and actually cook everything. Zero waste, huge savings.",
    names: ["Sarah", "Mike"],
    location: "Portland, OR",
    familyType: "Couple",
    metric: { value: "$320", label: "saved/month" },
    avatarColors: ["bg-pink-400", "bg-blue-400"],
  },
  {
    quote: "Sunday prep changed our life. Cook for 2 hours together, portion into containers, done for the week. No more 'what should we make tonight?' debates.",
    names: ["Jess", "Tom"],
    location: "Seattle, WA",
    familyType: "Couple",
    metric: { value: "6hrs", label: "saved weekly" },
    avatarColors: ["bg-purple-400", "bg-green-400"],
  },
  {
    quote: "We threw away so much food—lettuce rotting, leftovers forgotten. Now we only buy what's on the list and our grocery bill dropped 40%.",
    names: ["The Chen Family"],
    location: "San Jose, CA",
    familyType: "Family of 4",
    metric: { value: "60%", label: "less food waste" },
    avatarColors: ["bg-blue-400"],
  },
  {
    quote: "DoorDash 4-5 times a week because we 'had nothing to eat.' Now we batch cook and save almost $500 a month together.",
    names: ["Alex", "Jordan"],
    location: "Chicago, IL",
    familyType: "Couple",
    metric: { value: "$480", label: "saved/month" },
    avatarColors: ["bg-amber-400", "bg-teal-400"],
  },
  {
    quote: "With three kids and crazy schedules, I prep once on Sunday and we eat homemade all week. Game changer for busy families.",
    names: ["The Martinez Family"],
    location: "Austin, TX",
    familyType: "Family of 5",
    metric: { value: "5hrs", label: "saved weekly" },
    avatarColors: ["bg-teal-400"],
  },
  {
    quote: "We finally stopped the nightly 'what do you want?' conversation. Now it's on the plan, ingredients are ready, no debate.",
    names: ["Emily", "Chris"],
    location: "Brooklyn, NY",
    familyType: "Couple",
    metric: { value: "100%", label: "fewer debates" },
    avatarColors: ["bg-rose-400", "bg-indigo-400"],
  },
];

// Platform badges for social proof
const REVIEW_PLATFORMS = [
  { name: 'App Store', rating: '4.9' },
  { name: 'Google Play', rating: '4.8' },
  { name: 'G2', rating: '4.7' },
];

// Couple/Family Avatar component
function CoupleAvatar({ names, colors }: { names: string[]; colors: string[] }) {
  if (names.length === 1) {
    // Single avatar for families
    return (
      <div className={`
        w-14 h-14 rounded-full ${colors[0]}
        flex items-center justify-center text-white font-bold text-sm
        shadow-md
      `}>
        {names[0].charAt(0)}
      </div>
    );
  }

  // Overlapping couple avatars
  return (
    <div className="flex -space-x-3">
      {names.slice(0, 2).map((name, i) => (
        <div
          key={name}
          className={`
            w-12 h-12 rounded-full ${colors[i]}
            flex items-center justify-center text-white font-bold text-sm
            border-2 border-white shadow-md
            ${i === 1 ? 'z-10' : ''}
          `}
        >
          {name.charAt(0)}
        </div>
      ))}
    </div>
  );
}

function TestimonialCard({ testimonial, isActive }: { testimonial: Testimonial; isActive: boolean }) {
  return (
    <div
      className={`
        relative bg-white rounded-3xl border border-gray-100 p-8 md:p-10 shadow-lg
        transition-all duration-500 ease-out
        ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute pointer-events-none'}
      `}
    >
      {/* Large quote icon */}
      <div className="absolute top-6 right-8 opacity-10">
        <Quote className="w-20 h-20 text-[#1A1A1A]" />
      </div>

      {/* Quote text */}
      <blockquote className="relative text-gray-700 text-lg md:text-xl leading-relaxed mb-8 max-w-2xl">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Author info with metric */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
        {/* Avatar(s) */}
        <CoupleAvatar names={testimonial.names} colors={testimonial.avatarColors} />

        {/* Details */}
        <div className="flex-1">
          <div className="font-bold text-[#1A1A1A] text-lg">
            {testimonial.names.length > 1
              ? `${testimonial.names[0]} & ${testimonial.names[1]}`
              : testimonial.names[0]
            }
          </div>
          <div className="text-sm text-gray-500">
            {testimonial.location} · {testimonial.familyType}
          </div>
        </div>

        {/* Metric highlight */}
        <div className="flex items-center gap-3 bg-gradient-to-br from-[#D9F99D]/20 to-[#D9F99D]/5 rounded-2xl px-5 py-3 border border-[#D9F99D]/30">
          <div className="text-2xl md:text-3xl font-bold text-[#1A1A1A]">
            {testimonial.metric.value}
          </div>
          <div className="text-xs text-gray-600 leading-tight">
            {testimonial.metric.label}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection observer for visibility
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

  // Auto-rotate testimonials
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  }, []);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-gradient-to-b from-white via-[#FAFFF8] to-white relative overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Decorative stars */}
      <StarDecoration
        size={24}
        className="absolute top-12 left-[8%] text-[#D9F99D]/30"
      />
      <StarSmall
        size={16}
        className="absolute bottom-16 right-[12%] text-[#1A1A1A]/10"
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <span className={`
            inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200
            bg-white px-4 py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
            transition-all duration-700
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            <StarSmall size={12} className="text-[#84CC16]" />
            Real Families, Real Results
          </span>
          <h2 className={`
            text-3xl md:text-4xl lg:text-5xl font-bold text-[#1A1A1A] mb-4
            transition-all duration-700 delay-100
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            Loved by 10,000+ households
          </h2>
          <p className={`
            text-gray-600 text-lg max-w-2xl mx-auto
            transition-all duration-700 delay-200
            ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
          `}>
            See what families are saying about finally solving dinner.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto relative">
          {/* Cards */}
          <div className="relative min-h-[320px] md:min-h-[280px]">
            {TESTIMONIALS.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.names.join('-')}
                testimonial={testimonial}
                isActive={index === currentIndex}
              />
            ))}
          </div>

          {/* Navigation - Pills style */}
          <div className="flex items-center justify-center gap-6 mt-10">
            {/* Previous button */}
            <button
              onClick={goToPrevious}
              className="p-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#D9F99D] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D]"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>

            {/* Pill indicators */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-full p-1.5">
              {TESTIMONIALS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${index === currentIndex
                      ? 'bg-[#1A1A1A] w-8'
                      : 'bg-gray-300 w-2 hover:bg-gray-400'
                    }
                  `}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={goToNext}
              className="p-3 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-[#D9F99D] transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D]"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Platform Badges */}
        <div className={`
          mt-14 text-center
          transition-all duration-700 delay-400
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        `}>
          <p className="text-sm text-gray-500 mb-4">Featured reviews from</p>
          <div className="flex items-center justify-center gap-6 md:gap-10">
            {REVIEW_PLATFORMS.map((platform) => (
              <div key={platform.name} className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="w-3.5 h-3.5 text-amber-400 fill-amber-400"
                    />
                  ))}
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {platform.rating} {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
