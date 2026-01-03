import {
  Download,
  Calendar,
  ShoppingCart,
  ChefHat,
  Link2,
  Upload,
  Copy,
  type LucideIcon,
} from 'lucide-react';

export type AccentColor = 'yellow' | 'purple' | 'orange' | 'lime';

export interface Feature {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  details: string[];
  accentColor: AccentColor;
}

export const FEATURES: Feature[] = [
  {
    number: '01',
    icon: Download,
    title: 'Plan your week',
    description: 'Pick meals in 5 minutes. Know exactly what you\'re making each night — no more staring at the fridge wondering what to cook.',
    details: [
      '5 minutes of planning saves hours',
      'Drag and drop recipes to any day',
      'Repeat weeks that worked great',
    ],
    accentColor: 'yellow',
  },
  {
    number: '02',
    icon: Calendar,
    title: 'Get your shopping list',
    description: 'Only what you need. No wandering the aisles. No impulse buys. Every ingredient combined and organized by store section.',
    details: [
      'Buy exactly what you\'ll cook',
      'Auto-combines duplicate items',
      'No more "forgot the garlic" runs',
    ],
    accentColor: 'purple',
  },
  {
    number: '03',
    icon: ShoppingCart,
    title: 'Actually eat what you bought',
    description: 'No more wilted lettuce. No more "I forgot we had that." When you have a plan, every dollar you spend on groceries gets used.',
    details: [
      'Nothing rots in the back of the fridge',
      'Save $100+ per month on wasted food',
      'Feel good about every grocery trip',
    ],
    accentColor: 'orange',
  },
  {
    number: '04',
    icon: ChefHat,
    title: 'Cook with confidence',
    description: 'Step-by-step instructions with built-in timers. Scale any recipe from 1 serving to 10+. No more recipe tab chaos.',
    details: [
      'Scale recipes for any household',
      'Built-in timers keep you on track',
      'All your recipes in one place',
    ],
    accentColor: 'lime',
  },
];

export const ACCENT_COLORS: Record<AccentColor, string> = {
  yellow: 'bg-[#FFF6D8]',
  purple: 'bg-[#EDE9FE]',
  orange: 'bg-[#FFF0E6]',
  lime: 'bg-[#E4F8C9]',
};

export interface ImportMethod {
  icon: LucideIcon;
  label: string;
}

export const IMPORT_METHODS: ImportMethod[] = [
  { icon: Link2, label: 'Paste URL' },
  { icon: Upload, label: 'Upload Photo' },
  { icon: Copy, label: 'Copy Text' },
];
