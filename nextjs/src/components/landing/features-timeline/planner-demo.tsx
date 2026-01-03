import { useEffect, useState } from 'react';
import { Calendar, GripVertical } from 'lucide-react';
import { useReducedMotion } from './use-reduced-motion';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

export function PlannerDemo() {
  const reducedMotion = useReducedMotion();
  const [phase, setPhase] = useState<'waiting' | 'floating' | 'dropping' | 'landed' | 'reset'>('waiting');
  const [plannedCount, setPlannedCount] = useState(3);

  useEffect(() => {
    if (reducedMotion) {
      setPhase('landed');
      setPlannedCount(4);
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'waiting') {
      timeout = setTimeout(() => setPhase('floating'), 800);
    } else if (phase === 'floating') {
      timeout = setTimeout(() => setPhase('dropping'), 1200);
    } else if (phase === 'dropping') {
      timeout = setTimeout(() => {
        setPhase('landed');
        setPlannedCount(4);
      }, 400);
    } else if (phase === 'landed') {
      timeout = setTimeout(() => setPhase('reset'), 2000);
    } else if (phase === 'reset') {
      setPlannedCount(3);
      timeout = setTimeout(() => setPhase('waiting'), 300);
    }

    return () => clearTimeout(timeout);
  }, [phase, reducedMotion]);

  const getFloatingCardStyle = () => {
    if (phase === 'waiting') return 'opacity-0 -translate-y-8 translate-x-0';
    if (phase === 'floating') return 'opacity-100 -translate-y-4 translate-x-0';
    if (phase === 'dropping') return 'opacity-100 translate-y-0 translate-x-0';
    return 'opacity-0 translate-y-0';
  };

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <Calendar className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">This Week</span>
      </div>
      <div className="relative grid grid-cols-5 gap-1.5">
        {DAYS.map((day, i) => {
          const isWednesday = i === 2;
          const showRecipeInSlot = isWednesday && (phase === 'landed' || (reducedMotion && plannedCount === 4));

          return (
            <div key={day} className="relative text-center">
              <div className="mb-1 text-[9px] text-gray-400">{day}</div>
              <div className={`
                flex h-12 items-center justify-center rounded-md
                transition-colors duration-200
                ${isWednesday ? 'bg-[#EDE9FE]' : 'bg-gray-50'}
              `}>
                {isWednesday && !showRecipeInSlot && (
                  <GripVertical className="h-3 w-3 text-gray-400" />
                )}
                {showRecipeInSlot && (
                  <div className={`
                    h-full w-full animate-in p-1 duration-200 fade-in zoom-in
                  `}>
                    <div className={`
                      flex h-full w-full items-center justify-center rounded
                      bg-[#D9F99D]
                    `}>
                      <span className="text-[7px] font-medium text-[#1A1A1A]">Stew</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Floating recipe card - only show during animation */}
              {isWednesday && !reducedMotion && phase !== 'landed' && phase !== 'reset' && (
                <div
                  className={`
                    pointer-events-none absolute top-0 right-0 left-0
                    transition-all duration-500 ease-out
                    ${getFloatingCardStyle()}
                  `}
                >
                  <div className={`
                    mx-auto mt-4 flex h-8 w-10 items-center justify-center
                    rounded border border-[#C5E888] bg-[#D9F99D] shadow-md
                  `}>
                    <span className="text-[7px] font-medium text-[#1A1A1A]">Stew</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-[10px]">
        <span className="text-gray-400">Drag recipes to plan</span>
        <span className={`
          font-medium transition-all duration-200
          ${plannedCount === 4 ? 'text-[#1A1A1A]' : 'text-gray-600'}
        `}>
          {plannedCount}/5 planned
        </span>
      </div>
    </div>
  );
}
