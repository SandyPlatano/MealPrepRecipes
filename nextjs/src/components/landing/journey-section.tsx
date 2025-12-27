"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Calendar, ShoppingCart, ChefHat, ArrowDown, Utensils, Clock } from "lucide-react";
import { RecipeCardDemo, MealPlanDemo, ShoppingListDemo, CookModeDemo } from "./animated-demos";
import Link from "next/link";

// ═══════════════════════════════════════════════════════════════════════════
// JOURNEY SECTION - Neo-Brutalist/Retro Style
// Bold design with thick borders, hard shadows, and retro colors
// Red primary, yellow secondary, Space Mono headings
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
// Floating Stat - Retro style with hard borders and shadows
// ─────────────────────────────────────────────────────────────────────────────

function FloatingStat({
  value,
  label,
  icon: Icon,
  position,
  delay = 0,
  rotation = -2,
}: {
  value: string;
  label: string;
  icon: React.ElementType;
  position: string;
  delay?: number;
  rotation?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300 + delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      className={`
        absolute ${position}
        bg-card border-2 border-black px-3 py-2 rounded-lg shadow-retro
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}
        hidden xl:block
        z-20
      `}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-primary" />
        <span className="text-lg font-display font-bold text-foreground">{value}</span>
      </div>
      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Step Component - Retro style with thick borders
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
      {/* Demo Side - Retro card */}
      <div className={`${isReversed ? "lg:order-2" : "lg:order-1"}`}>
        <div className={`
          bg-card border-2 border-black shadow-retro rounded-xl p-6 lg:p-8
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
          inline-flex items-center gap-3 mb-4
          transition-all duration-500 delay-100
          ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
        `}>
          {/* Retro step number */}
          <span className="w-8 h-8 bg-secondary border-2 border-black rounded-full flex items-center justify-center font-display font-bold">
            {step.number}
          </span>
          <div className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            <span className="text-sm font-semibold text-foreground uppercase tracking-wide">
              {step.title}
            </span>
          </div>
        </div>

        {/* Tagline - Display font */}
        <h3 className={`
          font-display text-2xl md:text-3xl font-semibold text-foreground mb-4
          transition-all duration-500 delay-200
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        `}>
          {step.tagline}
        </h3>

        {/* Narrative */}
        <p className={`
          text-muted-foreground leading-relaxed mb-6
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
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-muted-foreground text-sm">{detail}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Connector - Retro line between steps
// ─────────────────────────────────────────────────────────────────────────────

function JourneyConnector({ isVisible }: { isVisible: boolean }) {
  return (
    <div className="flex justify-center py-12 relative">
      {/* Vertical dotted line */}
      <div className="relative h-16 w-px">
        {/* Background track */}
        <div className="absolute inset-0 border-l border-dashed border-border" />

        {/* Animated fill */}
        <div
          className="absolute top-0 left-0 w-px transition-all duration-1000 ease-out bg-primary"
          style={{
            height: isVisible ? "100%" : "0%",
          }}
        />
      </div>

      {/* Arrow at bottom */}
      <div className={`
        absolute bottom-0 left-1/2 -translate-x-1/2
        transition-all duration-500 delay-500
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}>
        <ArrowDown className="w-4 h-4 text-primary" />
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
      {/* Celebration icon */}
      <div className={`
        inline-flex items-center justify-center w-20 h-20 rounded-full
        bg-secondary border-2 border-black shadow-retro
        mb-6
        transition-all duration-700 delay-200
        ${isVisible ? "rotate-0" : "rotate-12"}
      `}>
        <Utensils className="w-10 h-10 text-foreground" />
      </div>

      {/* Text */}
      <h3 className={`
        font-display text-3xl md:text-4xl font-semibold text-foreground mb-4
        transition-all duration-500 delay-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
      `}>
        Dinner is served!
      </h3>
      <p className={`
        text-muted-foreground max-w-md mx-auto mb-8
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
          className="bg-primary hover:bg-primary/90 text-white font-display font-bold border-2 border-black shadow-retro hover:shadow-retro-lg transition-all rounded-lg text-lg px-8 py-4 inline-flex items-center gap-2"
        >
          Start Your Journey
        </Link>
        <p className="text-xs text-muted-foreground mt-4">
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
    <section id="features" className="py-24 bg-background relative overflow-hidden">
      {/* Floating stats */}
      <FloatingStat
        value="4 steps"
        label="From chaos to calm"
        icon={Clock}
        position="top-32 right-16"
        delay={200}
        rotation={2}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 relative">
          <span className="bg-secondary border-2 border-black text-foreground text-xs font-bold px-3 py-1 rounded mb-4 inline-block">
            Your Dinner Journey
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground mb-4">
            From URL to Table
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            See exactly how easy meal planning becomes. No signup required to explore.
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
                <JourneyConnector isVisible={visibleConnectors.has(index)} />
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
