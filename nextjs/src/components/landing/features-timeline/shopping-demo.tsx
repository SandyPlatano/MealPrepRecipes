import { useEffect, useState } from 'react';
import { ShoppingCart, Check } from 'lucide-react';
import { useReducedMotion } from './use-reduced-motion';

const ITEMS = [
  { name: 'Chicken breast', qty: '2 lbs' },
  { name: 'Olive oil', qty: '1 bottle' },
  { name: 'Garlic', qty: '1 head' },
  { name: 'Lemon', qty: '3' },
];

export function ShoppingDemo() {
  const reducedMotion = useReducedMotion();
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set([0, 1]));
  const [phase, setPhase] = useState<'idle' | 'checking' | 'holding' | 'reset'>('idle');
  const [currentCheckIndex, setCurrentCheckIndex] = useState(2);

  useEffect(() => {
    if (reducedMotion) {
      setCheckedItems(new Set([0, 1, 2, 3]));
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'idle') {
      timeout = setTimeout(() => setPhase('checking'), 1000);
    } else if (phase === 'checking') {
      if (currentCheckIndex < ITEMS.length) {
        timeout = setTimeout(() => {
          setCheckedItems(prev => new Set([...prev, currentCheckIndex]));
          setCurrentCheckIndex(currentCheckIndex + 1);
        }, 600);
      } else {
        timeout = setTimeout(() => setPhase('holding'), 1500);
      }
    } else if (phase === 'holding') {
      timeout = setTimeout(() => setPhase('reset'), 100);
    } else if (phase === 'reset') {
      setCheckedItems(new Set([0, 1]));
      setCurrentCheckIndex(2);
      timeout = setTimeout(() => setPhase('idle'), 400);
    }

    return () => clearTimeout(timeout);
  }, [phase, currentCheckIndex, reducedMotion]);

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <ShoppingCart className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">Shopping List</span>
      </div>
      <div className="space-y-2">
        {ITEMS.map((item, i) => {
          const isChecked = checkedItems.has(i);
          return (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className={`
                  flex h-3.5 w-3.5 items-center justify-center rounded border
                  transition-all duration-200
                  ${isChecked ? 'scale-100 border-[#D9F99D] bg-[#D9F99D]' : 'scale-95 border-gray-300'}
                `}
              >
                {isChecked && (
                  <Check className="h-2 w-2 text-[#1A1A1A]" />
                )}
              </div>
              <span
                className={`
                  flex-1 text-[10px] transition-all duration-300
                  ${isChecked ? 'text-gray-400 line-through' : 'text-gray-600'}
                `}
              >
                {item.name}
              </span>
              <span className="text-[10px] text-gray-400">{item.qty}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
