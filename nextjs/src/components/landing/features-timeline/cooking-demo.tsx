import { useEffect, useState } from 'react';
import { ChefHat, Clock } from 'lucide-react';
import { useReducedMotion } from './use-reduced-motion';

const STEPS = [
  'Heat oil in a large pan over medium-high heat. Season chicken with salt and pepper.',
  'Sear chicken for 3-4 minutes per side until golden brown. Remove and set aside.',
  'Add garlic and onions to the pan. Sauté until softened and fragrant.',
];

export function CookingDemo() {
  const reducedMotion = useReducedMotion();
  const [currentStep, setCurrentStep] = useState(0);
  const [timer, setTimer] = useState(300); // 5:00 in seconds
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [buttonPulse, setButtonPulse] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;

    // Timer countdown
    const timerInterval = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) return 300;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [reducedMotion]);

  useEffect(() => {
    if (reducedMotion) return;

    // Step transitions
    const stepInterval = setInterval(() => {
      setButtonPulse(true);
      setTimeout(() => {
        setIsTransitioning(true);
        setTimeout(() => {
          setCurrentStep(prev => (prev + 1) % STEPS.length);
          setTimer(300);
          setIsTransitioning(false);
          setButtonPulse(false);
        }, 300);
      }, 500);
    }, 4000);

    return () => clearInterval(stepInterval);
  }, [reducedMotion]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-4 w-4 text-gray-500" />
          <span className="text-xs font-medium text-gray-600">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <div className={`
          flex items-center gap-1 text-[10px] transition-colors duration-200
          ${timer < 60 ? 'text-orange-500' : 'text-gray-400'}
        `}>
          <Clock className="h-3 w-3" />
          <span className="tabular-nums">{formatTime(timer)}</span>
        </div>
      </div>
      <div className="mb-3 min-h-[50px] rounded-lg bg-gray-50 p-3">
        <p className={`
          text-xs leading-relaxed text-gray-600 transition-opacity duration-300
          ${isTransitioning ? 'opacity-0' : 'opacity-100'}
        `}>
          {STEPS[currentStep]}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <button type="button" className="text-[10px] text-gray-400">Previous</button>
        <button
          type="button"
          className={`
            rounded-full bg-[#1A1A1A] px-3 py-1 text-[10px] text-white
            transition-all duration-200
            ${buttonPulse ? 'scale-105 shadow-md' : 'scale-100'}
          `}
        >
          Next Step
        </button>
      </div>
    </div>
  );
}
