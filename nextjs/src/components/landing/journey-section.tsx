"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Calendar, ShoppingCart, ChefHat, ArrowDown, Utensils } from "lucide-react";
import { RecipeCardDemo, MealPlanDemo, ShoppingListDemo, CookModeDemo } from "./animated-demos";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY SECTION
// Progressive, scroll-triggered showcase of the user journey:
// Import → Plan → Shop → Cook → Dinner is served!
// ═══════════════════════════════════════════════════════════════════════════

interface JourneyStep {
  number: number;
  id: string;
  icon: React.ElementType;
  title: string;
  tagline: string;
  narrative: string;
  details: string[];
  demo: React.ReactNode;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    number: 1,
    id: "import",
    icon: Download,
    title: "Import",
    tagline: "Found a recipe you love?",
    narrative: "Paste any URL from your favorite food blog. Our AI extracts everything — ingredients, quantities, steps, and even nutrition info. No more copying and pasting into spreadsheets.",
    details: [
      "Works with any recipe website",
      "AI cleans up formatting automatically",
      "Extracts ingredients & quantities",
    ],
    demo: <RecipeCardDemo />,
  },
  {
    number: 2,
    id: "plan",
    icon: Calendar,
    title: "Plan",
    tagline: "Now plan your week...",
    narrative: "Drag recipes onto your calendar. Assign who's cooking each night. Build a meal plan that actually works for your household.",
    details: [
      "Visual weekly calendar",
      "Assign cooks to each meal",
      "Repeat your favorite weeks",
    ],
    demo: <MealPlanDemo />,
  },
  {
    number: 3,
    id: "shop",
    icon: ShoppingCart,
    title: "Shop",
    tagline: "Your list generates automatically...",
    narrative: "Every ingredient from your planned meals, combined and organized by store aisle. Check items off as you shop — it syncs everywhere.",
    details: [
      "Auto-combines duplicate items",
      "Organized by store section",
      "Works offline in the store",
    ],
    demo: <ShoppingListDemo />,
  },
  {
    number: 4,
    id: "cook",
    icon: ChefHat,
    title: "Cook",
    tagline: "Time to cook!",
    narrative: "Follow along step-by-step with large, easy-to-read instructions. Timers built right in. Scale servings on the fly for extra guests.",
    details: [
      "Step-by-step instructions",
      "Built-in timers",
      "Scale servings anytime",
    ],
    demo: <CookModeDemo />,
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Step Component - Animates in when visible
// ─────────────────────────────────────────────────────────────────────────────

function JourneyStepComponent({ step, isReversed, isVisible }: {
  step: JourneyStep;
  isReversed: boolean;
  isVisible: boolean;
}) {
  const Icon = step.icon;

  return (
    <div className={`
      grid lg:grid-cols-2 gap-8 lg:gap-16 items-center
      transition-all duration-700 ease-out
      ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}
    `}>
      {/* Demo Side */}
      <div className={`${isReversed ? "lg:order-2" : "lg:order-1"}`}>
        <div className={`
          transition-all duration-700 delay-200
          ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
        `}>
          {step.demo}
        </div>
      </div>

      {/* Content Side */}
      <div className={`${isReversed ? "lg:order-1" : "lg:order-2"}`}>
        {/* Step Badge */}
        <div className={`
          inline-flex items-center gap-2 mb-4
          transition-all duration-500 delay-100
          ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        `}>
          <div className="flex items-center gap-2 bg-[#FF4400]/10 border border-[#FF4400]/30 px-3 py-1 rounded-full">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-[#FF4400] text-white text-xs font-mono font-bold">
              {step.number}
            </span>
            <Icon className="w-4 h-4 text-[#FF4400]" />
            <span className="text-xs font-mono font-bold text-[#FF4400] uppercase tracking-wide">
              {step.title}
            </span>
          </div>
        </div>

        {/* Tagline */}
        <h3 className={`
          font-mono text-2xl md:text-3xl font-bold text-white mb-4
          transition-all duration-500 delay-200
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}>
          {step.tagline}
        </h3>

        {/* Narrative */}
        <p className={`
          text-[#999] leading-relaxed mb-6
          transition-all duration-500 delay-300
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}>
          {step.narrative}
        </p>

        {/* Details */}
        <ul className="space-y-2">
          {step.details.map((detail, i) => (
            <li
              key={detail}
              className={`
                flex items-center gap-3
                transition-all duration-500
                ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
              `}
              style={{ transitionDelay: `${400 + i * 100}ms` }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4400]" />
              <span className="text-[#ccc] text-sm font-mono">{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Connector - Animated line between steps
// ─────────────────────────────────────────────────────────────────────────────

function JourneyConnector({ isVisible, index }: { isVisible: boolean; index: number }) {
  // Alternate between orange and pink for visual variety
  const isPink = index % 2 === 1;
  const accentColor = isPink ? "#ff66c4" : "#FF4400";

  return (
    <div className="flex justify-center py-12 relative">
      {/* Vertical dotted line */}
      <div className="relative h-24 w-px">
        {/* Background track */}
        <div className="absolute inset-0 border-l-2 border-dashed border-[#333]" />

        {/* Animated fill */}
        <div
          className="absolute top-0 left-0 w-full transition-all duration-1000 ease-out"
          style={{
            height: isVisible ? "100%" : "0%",
            backgroundColor: accentColor,
          }}
        />

        {/* Data packet animation */}
        <div
          className={`
            absolute left-1/2 -translate-x-1/2 w-3 h-3 rounded-full
            transition-all duration-700
            ${isVisible ? "opacity-100" : "opacity-0"}
          `}
          style={{
            backgroundColor: accentColor,
            boxShadow: `0 0 10px ${accentColor}`,
            animation: isVisible ? "dataPacketDown 2s ease-in-out infinite" : "none",
          }}
        />
      </div>

      {/* Arrow at bottom */}
      <div className={`
        absolute bottom-0 left-1/2 -translate-x-1/2
        transition-all duration-500 delay-500
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}>
        <ArrowDown className="w-5 h-5" style={{ color: accentColor }} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Completion Celebration
// ─────────────────────────────────────────────────────────────────────────────

function JourneyCompletion({ isVisible }: { isVisible: boolean }) {
  return (
    <div className={`
      text-center py-16
      transition-all duration-700
      ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}
    `}>
      {/* Celebration icon - pink glow accent */}
      <div className={`
        inline-flex items-center justify-center w-20 h-20 rounded-full
        bg-gradient-to-br from-[#FF4400] to-[#ff66c4]
        mb-6 shadow-[0_0_30px_rgba(255,102,196,0.3)]
        transition-all duration-700 delay-200
        ${isVisible ? "rotate-0" : "rotate-12"}
      `}>
        <Utensils className="w-10 h-10 text-white" />
      </div>

      {/* Text */}
      <h3 className={`
        font-mono text-3xl md:text-4xl font-bold text-white mb-4
        transition-all duration-500 delay-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}>
        Dinner is served!
      </h3>
      <p className={`
        text-[#888] max-w-md mx-auto mb-8
        transition-all duration-500 delay-400
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}>
        From &ldquo;what should I eat?&rdquo; to a delicious meal on the table.
        That&apos;s the power of a system that works.
      </p>

      {/* CTA */}
      <div className={`
        transition-all duration-500 delay-500
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}>
        <Link
          href="/signup"
          className="inline-flex items-center gap-2 btn-pixel btn-pixel-primary text-lg px-8 py-4"
        >
          Start Your Journey
        </Link>
        <p className="text-xs text-[#666] font-mono mt-4">
          Free plan includes 10 recipes. No credit card required.
        </p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Journey Section
// ─────────────────────────────────────────────────────────────────────────────

export function JourneySection() {
  const [visibleSteps, setVisibleSteps] = useState<Set<number>>(new Set());
  const [visibleConnectors, setVisibleConnectors] = useState<Set<number>>(new Set());
  const [completionVisible, setCompletionVisible] = useState(false);

  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);
  const connectorRefs = useRef<(HTMLDivElement | null)[]>([]);
  const completionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-10% 0px -10% 0px",
      threshold: 0.2,
    };

    const stepObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = stepRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1) {
          setVisibleSteps((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) {
              next.add(index);
            }
            return next;
          });
        }
      });
    }, observerOptions);

    const connectorObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = connectorRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1) {
          setVisibleConnectors((prev) => {
            const next = new Set(prev);
            if (entry.isIntersecting) {
              next.add(index);
            }
            return next;
          });
        }
      });
    }, { ...observerOptions, threshold: 0.5 });

    const completionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setCompletionVisible(true);
        }
      });
    }, { ...observerOptions, threshold: 0.3 });

    // Observe steps
    stepRefs.current.forEach((ref) => {
      if (ref) stepObserver.observe(ref);
    });

    // Observe connectors
    connectorRefs.current.forEach((ref) => {
      if (ref) connectorObserver.observe(ref);
    });

    // Observe completion
    if (completionRef.current) {
      completionObserver.observe(completionRef.current);
    }

    return () => {
      stepObserver.disconnect();
      connectorObserver.disconnect();
      completionObserver.disconnect();
    };
  }, []);

  return (
    <section className="py-24 bg-[#111]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <span className="inline-block font-mono text-xs font-bold text-[#ff66c4] bg-[#ff66c4]/10 border border-[#ff66c4]/30 px-3 py-1 rounded-full mb-4">
            Your Dinner Journey
          </span>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-white mb-4">
            From URL to Table
          </h2>
          <p className="text-[#888] max-w-xl mx-auto">
            See exactly what using Meal Prep OS feels like. No signup required to explore.
          </p>
        </div>

        {/* Journey Steps */}
        {JOURNEY_STEPS.map((step, index) => (
          <div key={step.id}>
            {/* Step */}
            <div
              ref={(el) => { stepRefs.current[index] = el; }}
            >
              <JourneyStepComponent
                step={step}
                isReversed={index % 2 === 1}
                isVisible={visibleSteps.has(index)}
              />
            </div>

            {/* Connector (except after last step) */}
            {index < JOURNEY_STEPS.length - 1 && (
              <div
                ref={(el) => { connectorRefs.current[index] = el; }}
              >
                <JourneyConnector isVisible={visibleConnectors.has(index)} index={index} />
              </div>
            )}
          </div>
        ))}

        {/* Completion */}
        <div ref={completionRef}>
          <JourneyCompletion isVisible={completionVisible} />
        </div>
      </div>
    </section>
  );
}
