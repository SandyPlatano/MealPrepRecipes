import { useEffect, useRef, useState } from 'react';
import { Download, Check } from 'lucide-react';
import { useReducedMotion } from './use-reduced-motion';

const CHECK_ITEMS = [
  'Ingredients extracted',
  'Steps formatted',
  'Nutrition added',
];

const FULL_URL = 'https://seriouseats.com/perfect-beef-stew';

export function ImportDemo() {
  const reducedMotion = useReducedMotion();
  const [typedLength, setTypedLength] = useState(0);
  const [checkedItems, setCheckedItems] = useState<number[]>([]);
  const [phase, setPhase] = useState<'typing' | 'checking' | 'holding' | 'reset'>('typing');

  // Track checked items count separately to avoid array reference in deps
  const checkedCountRef = useRef(0);
  checkedCountRef.current = checkedItems.length;

  useEffect(() => {
    if (reducedMotion) {
      // Show completed state for reduced motion
      setTypedLength(FULL_URL.length);
      setCheckedItems([0, 1, 2]);
      return;
    }

    let timeout: NodeJS.Timeout;

    if (phase === 'typing') {
      if (typedLength < FULL_URL.length) {
        timeout = setTimeout(() => setTypedLength(prev => prev + 1), 50);
      } else {
        timeout = setTimeout(() => setPhase('checking'), 300);
      }
    } else if (phase === 'checking') {
      if (checkedCountRef.current < 3) {
        timeout = setTimeout(() => {
          setCheckedItems(prev => [...prev, prev.length]);
        }, 400);
      } else {
        timeout = setTimeout(() => setPhase('holding'), 1500);
      }
    } else if (phase === 'holding') {
      timeout = setTimeout(() => setPhase('reset'), 100);
    } else if (phase === 'reset') {
      setTypedLength(0);
      setCheckedItems([]);
      timeout = setTimeout(() => setPhase('typing'), 500);
    }

    return () => clearTimeout(timeout);
  }, [phase, typedLength, reducedMotion]);

  const displayUrl = FULL_URL.slice(0, typedLength);
  const showCursor = phase === 'typing' && !reducedMotion;

  return (
    <div className="relative z-10 rounded-xl bg-white p-4 shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <Download className="h-4 w-4 text-gray-500" />
        <span className="text-xs font-medium text-gray-600">Paste any URL</span>
      </div>
      <div className="mb-3 rounded-lg bg-gray-50 p-3">
        <div className="mb-1 text-[10px] text-gray-400">Recipe URL</div>
        <div className="flex h-4 items-center truncate text-xs text-gray-600">
          {displayUrl}
          {showCursor && (
            <span className={`
              ml-0.5 inline-block h-3 w-0.5 animate-pulse bg-gray-400
            `} />
          )}
        </div>
      </div>
      <div className="space-y-2">
        {CHECK_ITEMS.map((item, i) => {
          const isChecked = checkedItems.includes(i);
          return (
            <div key={item} className="flex items-center gap-2">
              <div
                className={`
                  flex h-3 w-3 items-center justify-center rounded-full
                  transition-all duration-200
                  ${isChecked ? 'scale-100 bg-[#D9F99D]' : 'scale-90 bg-gray-200'}
                `}
              >
                {isChecked && (
                  <Check className={`
                    h-2 w-2 animate-in text-[#1A1A1A] duration-200 fade-in zoom-in
                  `} />
                )}
              </div>
              <span className={`
                text-[10px] transition-colors duration-200
                ${isChecked ? 'text-gray-600' : 'text-gray-400'}
              `}>
                {item}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
