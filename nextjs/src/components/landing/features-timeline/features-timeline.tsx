'use client';

import { useEffect, useRef, useState } from 'react';
import { StarSmall, StarDecoration } from '../shared/star-decoration';
import { FEATURES } from '../features-data';
import { SectionHeader } from './section-header';
import { StepIndicator } from './step-indicator';
import { FeatureRow } from './feature-row';

export function FeaturesTimeline() {
  const [visibleFeatures, setVisibleFeatures] = useState<Set<number>>(new Set());
  const [headerVisible, setHeaderVisible] = useState(false);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLElement>(null);

  // Header visibility
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setHeaderVisible(true);
      },
      { threshold: 0.2 }
    );

    const currentRef = sectionRef.current;
    if (currentRef) observer.observe(currentRef);
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  // Feature visibility
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-10% 0px -10% 0px',
      threshold: 0.2,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const index = featureRefs.current.indexOf(entry.target as HTMLDivElement);
        if (index !== -1 && entry.isIntersecting) {
          setVisibleFeatures((prev) => new Set(prev).add(index));
        }
      });
    }, observerOptions);

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="features"
      className="bg-[#FFFCF6] py-24 md:py-32 relative overflow-hidden"
    >
      {/* Decorative stars */}
      <StarDecoration
        size={24}
        className="absolute top-20 right-[8%] text-[#D9F99D]/30"
      />
      <StarSmall
        size={16}
        className="absolute bottom-32 left-[5%] text-[#1A1A1A]/10"
      />

      <div className="container mx-auto px-4">
        {/* Section Header */}
        <SectionHeader isVisible={headerVisible} />

        {/* Features with Connecting Line */}
        <div className="mx-auto max-w-6xl relative">
          {/* Vertical connecting line - hidden on mobile */}
          <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2">
            <div
              className={`
                w-full h-full bg-gradient-to-b from-transparent via-[#D9F99D]/40 to-transparent
                transition-all duration-1000
                ${visibleFeatures.size > 0 ? 'opacity-100' : 'opacity-0'}
              `}
            />
          </div>

          <div className="space-y-20 md:space-y-28">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.number}
                ref={(el) => { featureRefs.current[index] = el; }}
                className="relative"
              >
                {/* Center step indicator - hidden on mobile */}
                <StepIndicator
                  number={feature.number}
                  isVisible={visibleFeatures.has(index)}
                />

                <FeatureRow
                  feature={feature}
                  isReversed={index % 2 === 1}
                  isVisible={visibleFeatures.has(index)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
