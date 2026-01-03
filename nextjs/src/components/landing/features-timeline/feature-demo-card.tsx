import { ImportDemo } from './import-demo';
import { PlannerDemo } from './planner-demo';
import { ShoppingDemo } from './shopping-demo';
import { CookingDemo } from './cooking-demo';

interface FeatureDemoCardProps {
  featureNumber: string;
}

export function FeatureDemoCard({ featureNumber }: FeatureDemoCardProps) {
  switch (featureNumber) {
    case '01':
      return <ImportDemo />;
    case '02':
      return <PlannerDemo />;
    case '03':
      return <ShoppingDemo />;
    case '04':
      return <CookingDemo />;
    default:
      return null;
  }
}
