import { ACCENT_COLORS, type Feature } from '../features-data';
import { FeatureDemoCard } from './feature-demo-card';
import { FeatureContent } from './feature-content';

interface FeatureRowProps {
  feature: Feature;
  isReversed: boolean;
  isVisible: boolean;
}

export function FeatureRow({ feature, isReversed, isVisible }: FeatureRowProps) {
  return (
    <div
      className={`
        grid items-center gap-10 transition-all duration-700 ease-out
        lg:grid-cols-2 lg:gap-20
        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}
      `}
    >
      {/* Accent Card Side */}
      <div className={`
        ${isReversed ? 'lg:order-2' : 'lg:order-1'}
      `}>
        <div
          className={`
            ${ACCENT_COLORS[feature.accentColor]}
            relative overflow-hidden rounded-2xl p-6 md:p-8 transition-all
            duration-300 shadow-sm
            hover:-translate-y-1 hover:shadow-md
          `}
        >
          <FeatureDemoCard featureNumber={feature.number} />
        </div>
      </div>

      {/* Content Side */}
      <FeatureContent feature={feature} isReversed={isReversed} />
    </div>
  );
}
