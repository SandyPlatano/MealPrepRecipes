import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe,
  Users,
  Upload,
  Settings,
  LineChart,
  type LucideIcon,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════════════════════
// HERO SECTION DATA
// ═══════════════════════════════════════════════════════════════════════════════

export const HERO_DATA = {
  headline: "Turn retail data into actionable intelligence",
  subheadline:
    "The analytics platform trusted by leading CPG brands to track chargebacks, optimize inventory, and maximize retail revenue.",
  ctaText: "Get Started Free",
  inputPlaceholder: "Enter your work email",
};

// ═══════════════════════════════════════════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════════════════════════════════════════

export const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it Works", href: "#process" },
  { label: "Dashboard", href: "#dashboard" },
  { label: "Pricing", href: "#pricing" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// SOCIAL PROOF LOGOS
// ═══════════════════════════════════════════════════════════════════════════════

export const SOCIAL_PROOF_LOGOS = [
  { name: "Unilever", initials: "UL" },
  { name: "P&G", initials: "P&G" },
  { name: "Nestlé", initials: "N" },
  { name: "PepsiCo", initials: "PC" },
  { name: "Kraft Heinz", initials: "KH" },
  { name: "General Mills", initials: "GM" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FEATURES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: Feature[] = [
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Monitor retail performance across all channels with live dashboards and instant alerts.",
  },
  {
    icon: TrendingUp,
    title: "Chargeback Recovery",
    description:
      "Automatically identify, dispute, and recover lost revenue from retail chargebacks.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance Tracking",
    description:
      "Stay on top of retailer requirements with automated compliance monitoring.",
  },
  {
    icon: Zap,
    title: "Instant Insights",
    description:
      "AI-powered recommendations to optimize pricing, promotions, and inventory.",
  },
  {
    icon: Globe,
    title: "Multi-Retailer View",
    description:
      "Unified dashboard connecting Walmart, Target, Kroger, and 50+ retailers.",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    description:
      "Share insights, assign tasks, and collaborate with your entire team in real-time.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PROCESS STEPS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ProcessStep {
  step: number;
  icon: LucideIcon;
  title: string;
  description: string;
}

export const PROCESS_STEPS: ProcessStep[] = [
  {
    step: 1,
    icon: Upload,
    title: "Connect Your Data",
    description:
      "Integrate with your retailer portals and EDI feeds in minutes, not months.",
  },
  {
    step: 2,
    icon: Settings,
    title: "Configure Alerts",
    description:
      "Set up custom rules for chargebacks, inventory levels, and compliance issues.",
  },
  {
    step: 3,
    icon: LineChart,
    title: "Take Action",
    description:
      "Use AI-powered insights to recover revenue and optimize your retail operations.",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// DASHBOARD PREVIEW DATA
// ═══════════════════════════════════════════════════════════════════════════════

export interface StatCard {
  value: string;
  label: string;
  trend: string;
  trendUp: boolean;
  borderColor: "coral" | "sage" | "blue" | "yellow";
}

export interface DashboardTab {
  id: string;
  label: string;
  cards: StatCard[];
}

export const DASHBOARD_TABS: DashboardTab[] = [
  {
    id: "month",
    label: "Month",
    cards: [
      {
        value: "$2.4M",
        label: "Total Revenue",
        trend: "+12.5%",
        trendUp: true,
        borderColor: "coral",
      },
      {
        value: "12,450",
        label: "Units Sold",
        trend: "+8.3%",
        trendUp: true,
        borderColor: "sage",
      },
      {
        value: "$84K",
        label: "Recovered",
        trend: "+24.1%",
        trendUp: true,
        borderColor: "blue",
      },
      {
        value: "98.2%",
        label: "Fill Rate",
        trend: "+2.1%",
        trendUp: true,
        borderColor: "yellow",
      },
    ],
  },
  {
    id: "quarter",
    label: "Quarter",
    cards: [
      {
        value: "$7.2M",
        label: "Total Revenue",
        trend: "+15.2%",
        trendUp: true,
        borderColor: "coral",
      },
      {
        value: "38,420",
        label: "Units Sold",
        trend: "+11.7%",
        trendUp: true,
        borderColor: "sage",
      },
      {
        value: "$256K",
        label: "Recovered",
        trend: "+31.4%",
        trendUp: true,
        borderColor: "blue",
      },
      {
        value: "97.8%",
        label: "Fill Rate",
        trend: "+1.8%",
        trendUp: true,
        borderColor: "yellow",
      },
    ],
  },
  {
    id: "year",
    label: "Year",
    cards: [
      {
        value: "$28.6M",
        label: "Total Revenue",
        trend: "+22.4%",
        trendUp: true,
        borderColor: "coral",
      },
      {
        value: "142,800",
        label: "Units Sold",
        trend: "+18.9%",
        trendUp: true,
        borderColor: "sage",
      },
      {
        value: "$1.2M",
        label: "Recovered",
        trend: "+45.2%",
        trendUp: true,
        borderColor: "blue",
      },
      {
        value: "98.5%",
        label: "Fill Rate",
        trend: "+3.2%",
        trendUp: true,
        borderColor: "yellow",
      },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// RETAILERS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Retailer {
  name: string;
  color: "blue" | "red" | "yellow" | "green";
  initials: string;
}

export const RETAILERS: Retailer[] = [
  { name: "Walmart", color: "blue", initials: "W" },
  { name: "Target", color: "red", initials: "T" },
  { name: "Kroger", color: "yellow", initials: "K" },
  { name: "Costco", color: "green", initials: "C" },
];

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATIONS
// ═══════════════════════════════════════════════════════════════════════════════

export interface Integration {
  name: string;
  initials: string;
  ring: 1 | 2 | 3;
  angle: number; // in degrees
}

export const INTEGRATIONS: Integration[] = [
  { name: "SAP", initials: "SAP", ring: 1, angle: 0 },
  { name: "Oracle", initials: "OR", ring: 1, angle: 120 },
  { name: "Salesforce", initials: "SF", ring: 1, angle: 240 },
  { name: "NetSuite", initials: "NS", ring: 2, angle: 45 },
  { name: "Shopify", initials: "SH", ring: 2, angle: 135 },
  { name: "BigCommerce", initials: "BC", ring: 2, angle: 225 },
  { name: "EDI", initials: "EDI", ring: 2, angle: 315 },
  { name: "AWS", initials: "AWS", ring: 3, angle: 30 },
  { name: "Snowflake", initials: "SF", ring: 3, angle: 90 },
  { name: "Databricks", initials: "DB", ring: 3, angle: 150 },
  { name: "Tableau", initials: "TB", ring: 3, angle: 210 },
  { name: "Power BI", initials: "PB", ring: 3, angle: 270 },
  { name: "Looker", initials: "LK", ring: 3, angle: 330 },
];

// ═══════════════════════════════════════════════════════════════════════════════
// TESTIMONIAL
// ═══════════════════════════════════════════════════════════════════════════════

export const TESTIMONIAL = {
  quote:
    "This platform transformed how we understand our retail data. We recovered over $1.2M in chargebacks in our first year alone.",
  author: "Sarah Chen",
  title: "VP of Retail Operations",
  company: "Leading CPG Brand",
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROI STATS
// ═══════════════════════════════════════════════════════════════════════════════

export interface RoiStat {
  value: number;
  max: number;
  label: string;
  displayValue: string;
  color: "coral" | "sage" | "blue";
}

export const ROI_STATS: RoiStat[] = [
  {
    value: 85,
    max: 100,
    label: "Chargeback Recovery Rate",
    displayValue: "85%",
    color: "coral",
  },
  {
    value: 72,
    max: 100,
    label: "Time Saved on Disputes",
    displayValue: "72%",
    color: "sage",
  },
  {
    value: 94,
    max: 100,
    label: "Data Accuracy",
    displayValue: "94%",
    color: "blue",
  },
];

export const ROI_HIGHLIGHT_STATS = [
  { value: "$700K", label: "Avg. Annual Recovery" },
  { value: "200h", label: "Hours Saved Monthly" },
];

export const ROI_STATUS_CARDS = [
  { label: "Recovered", value: "$1.2M", color: "sage" as const },
  { label: "Pending", value: "$340K", color: "yellow" as const },
  { label: "In Review", value: "$89K", color: "coral" as const },
];

// ═══════════════════════════════════════════════════════════════════════════════
// PRICING
// ═══════════════════════════════════════════════════════════════════════════════

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  highlighted: boolean;
  inverted: boolean;
  ctaText: string;
}

export const PRICING_TIERS: PricingTier[] = [
  {
    name: "Starter",
    price: "$299",
    period: "/month",
    description: "Perfect for small brands getting started with retail analytics.",
    features: [
      "Up to 3 retailer connections",
      "Basic chargeback tracking",
      "Weekly reports",
      "Email support",
      "1 team member",
    ],
    highlighted: false,
    inverted: false,
    ctaText: "Start Free Trial",
  },
  {
    name: "Professional",
    price: "$799",
    period: "/month",
    description: "For growing brands that need advanced insights.",
    features: [
      "Up to 10 retailer connections",
      "Automated dispute filing",
      "Real-time dashboards",
      "Priority support",
      "5 team members",
      "API access",
    ],
    highlighted: true,
    inverted: false,
    ctaText: "Start Free Trial",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with complex needs.",
    features: [
      "Unlimited retailer connections",
      "Custom integrations",
      "Dedicated success manager",
      "SLA guarantees",
      "Unlimited team members",
      "On-premise deployment",
      "Custom reporting",
    ],
    highlighted: false,
    inverted: true,
    ctaText: "Contact Sales",
  },
];

// ═══════════════════════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

export const FOOTER_LINKS = {
  product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Integrations", href: "#integrations" },
    { label: "API", href: "#" },
  ],
  company: [
    { label: "About", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#" },
  ],
  resources: [
    { label: "Documentation", href: "#" },
    { label: "Help Center", href: "#" },
    { label: "Status", href: "#" },
    { label: "Changelog", href: "#" },
  ],
  legal: [
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export const FOOTER_DESCRIPTION =
  "RetailIQ helps CPG brands recover lost revenue and optimize retail operations with AI-powered analytics.";
