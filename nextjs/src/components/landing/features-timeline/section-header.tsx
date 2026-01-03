import { StarSmall } from '../shared/star-decoration';

interface SectionHeaderProps {
  isVisible: boolean;
}

export function SectionHeader({ isVisible }: SectionHeaderProps) {
  return (
    <div className="mb-20 md:mb-24 text-center">
      <span className={`
        inline-flex items-center gap-2 mb-4 rounded-full border border-gray-200 bg-white px-4
        py-2 text-xs font-semibold text-[#1A1A1A] shadow-sm
        transition-all duration-700
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        <StarSmall size={12} className="text-[#84CC16]" />
        How Planning Saves You Money
      </span>
      <h2 className={`
        mb-4 font-display text-3xl font-bold text-[#1A1A1A]
        md:text-4xl lg:text-5xl
        transition-all duration-700 delay-100
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        5 minutes now. Savings all week.
      </h2>
      <p className={`
        mx-auto max-w-xl text-lg text-gray-600
        transition-all duration-700 delay-200
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}>
        The average household throws away 338 lbs of food per year. A simple plan changes that.
      </p>
    </div>
  );
}
