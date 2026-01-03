interface StepIndicatorProps {
  number: string;
  isVisible: boolean;
}

export function StepIndicator({ number, isVisible }: StepIndicatorProps) {
  return (
    <div className={`
      hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2 z-10
      w-14 h-14 rounded-full bg-white border-2 border-[#D9F99D]
      items-center justify-center shadow-lg
      transition-all duration-700
      ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
    `}>
      <span className="text-lg font-bold text-[#1A1A1A]">{number}</span>
    </div>
  );
}
