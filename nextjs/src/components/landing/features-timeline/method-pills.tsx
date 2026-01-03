import { IMPORT_METHODS } from '../features-data';

interface MethodPillsProps {
  isReversed: boolean;
}

export function MethodPills({ isReversed }: MethodPillsProps) {
  return (
    <div className={`
      flex flex-wrap gap-2 mb-6
      ${isReversed ? 'lg:justify-end' : ''}
    `}>
      {IMPORT_METHODS.map((method) => {
        const Icon = method.icon;
        return (
          <div
            key={method.label}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1.5 border border-gray-200 shadow-sm"
          >
            <Icon className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs font-medium text-gray-600">{method.label}</span>
          </div>
        );
      })}
    </div>
  );
}
