"use client";

import {
  Heart,
  Star,
  Zap,
  ChefHat,
  UtensilsCrossed,
  ShoppingCart,
  Calendar,
  Bell,
  Settings,
  Search,
  Plus,
  Check,
  X,
  AlertTriangle,
  Info
} from "lucide-react";

export default function BrandPage() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* Header */}
        <header className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold">
            Brand Style Guide
          </h1>
          <p className="text-xl text-muted-foreground font-body">
            "Babe, What's for Dinner?" — Retro Design System v2
          </p>
          <div className="inline-flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Neo-Brutalist Theme
          </div>
        </header>

        {/* Typography Section */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <span className="text-xl font-bold">Aa</span>
            </div>
            <h2 className="text-2xl font-display font-bold">Typography</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Display Font */}
            <div className="space-y-4">
              <h3 className="label-retro text-muted-foreground">Display Font — Space Mono</h3>
              <div className="space-y-2 font-display">
                <p className="text-4xl font-bold">Aa Bb Cc Dd Ee</p>
                <p className="text-2xl font-bold">The quick brown fox</p>
                <p className="text-lg">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="text-base">abcdefghijklmnopqrstuvwxyz</p>
                <p className="text-sm">1234567890!@#$%^&*()</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="badge-retro bg-gray-100">Headings</span>
                <span className="badge-retro bg-gray-100">Labels</span>
                <span className="badge-retro bg-gray-100">Monospace</span>
              </div>
            </div>

            {/* Body Font */}
            <div className="space-y-4">
              <h3 className="label-retro text-muted-foreground">Body Font — Work Sans</h3>
              <div className="space-y-2 font-body">
                <p className="text-4xl font-bold">Aa Bb Cc Dd Ee</p>
                <p className="text-2xl font-semibold">The quick brown fox</p>
                <p className="text-lg font-medium">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
                <p className="text-base">abcdefghijklmnopqrstuvwxyz</p>
                <p className="text-sm font-light">1234567890!@#$%^&*()</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <span className="badge-retro bg-gray-100">400 Regular</span>
                <span className="badge-retro bg-gray-100">500 Medium</span>
                <span className="badge-retro bg-gray-100">600 Semibold</span>
                <span className="badge-retro bg-gray-100">700 Bold</span>
              </div>
            </div>
          </div>

          {/* Type Scale */}
          <div className="space-y-3 pt-4 border-t-2 border-black">
            <h3 className="label-retro text-muted-foreground">Type Scale</h3>
            <div className="space-y-2">
              <p className="text-5xl font-display font-bold">Display — 3rem/48px</p>
              <p className="text-4xl font-display font-bold">H1 — 2.25rem/36px</p>
              <p className="text-3xl font-display font-bold">H2 — 1.875rem/30px</p>
              <p className="text-2xl font-display font-bold">H3 — 1.5rem/24px</p>
              <p className="text-xl font-display font-bold">H4 — 1.25rem/20px</p>
              <p className="text-lg font-body">Body Large — 1.125rem/18px</p>
              <p className="text-base font-body">Body — 1rem/16px</p>
              <p className="text-sm font-body text-muted-foreground">Small — 0.875rem/14px</p>
              <p className="text-xs font-body text-muted-foreground">Extra Small — 0.75rem/12px</p>
            </div>
          </div>
        </section>

        {/* Color Palette */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary via-secondary to-accent" />
            </div>
            <h2 className="text-2xl font-display font-bold">Color Palette</h2>
          </div>

          {/* Primary Colors - 2-Color Palette */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Brand Colors (2-Color Palette)</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Primary"
                hex="#1E3A5F"
                hsl="214 52% 25%"
                className="bg-primary"
                textLight
              />
              <ColorSwatch
                name="Secondary"
                hex="#FBBF24"
                hsl="45 97% 56%"
                className="bg-secondary"
              />
              <ColorSwatch
                name="Background"
                hex="#FEF6E4"
                hsl="47 77% 95%"
                className="bg-background"
              />
              <ColorSwatch
                name="Surface"
                hex="#FFFFFF"
                hsl="0 0% 100%"
                className="bg-card"
              />
            </div>
          </div>

          {/* Text & Border Colors */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Text & Borders</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Text Main"
                hex="#111827"
                hsl="221 39% 11%"
                className="bg-foreground"
                textLight
              />
              <ColorSwatch
                name="Text Muted"
                hex="#6B7280"
                hsl="220 9% 46%"
                className="bg-muted-foreground"
                textLight
              />
              <ColorSwatch
                name="Border"
                hex="#000000"
                hsl="0 0% 0%"
                className="bg-black"
                textLight
              />
              <ColorSwatch
                name="Muted BG"
                hex="#F3F4F6"
                hsl="220 14% 96%"
                className="bg-muted"
              />
            </div>
          </div>

          {/* State Colors */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">State Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch
                name="Success"
                hex="#BBF7D0"
                hsl="142 76% 36%"
                className="bg-green-200"
              />
              <ColorSwatch
                name="Warning"
                hex="#FDE68A"
                hsl="48 96% 77%"
                className="bg-yellow-200"
              />
              <ColorSwatch
                name="Error"
                hex="#FECACA"
                hsl="0 93% 89%"
                className="bg-red-200"
              />
              <ColorSwatch
                name="Destructive"
                hex="#EF4444"
                hsl="0 84% 60%"
                className="bg-destructive"
                textLight
              />
            </div>
          </div>

          {/* Chart Colors */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Chart Colors</h3>
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-lg border-2 border-black bg-chart-1" title="Chart 1" />
              <div className="w-12 h-12 rounded-lg border-2 border-black bg-chart-2" title="Chart 2" />
              <div className="w-12 h-12 rounded-lg border-2 border-black bg-chart-3" title="Chart 3" />
              <div className="w-12 h-12 rounded-lg border-2 border-black bg-chart-4" title="Chart 4" />
              <div className="w-12 h-12 rounded-lg border-2 border-black bg-chart-5" title="Chart 5" />
            </div>
          </div>
        </section>

        {/* Shadows & Borders */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <div className="w-4 h-4 bg-black rounded-sm" style={{ boxShadow: '2px 2px 0 0 #1E3A5F' }} />
            </div>
            <h2 className="text-2xl font-display font-bold">Shadows & Borders</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Shadows */}
            <div className="space-y-4">
              <h3 className="label-retro text-muted-foreground">Hard Shadows (No Blur)</h3>
              <div className="space-y-4">
                <div className="p-4 bg-white border-2 border-black rounded-lg" style={{ boxShadow: '2px 2px 0 0 #000' }}>
                  <p className="font-mono text-sm">--: 2px 2px 0px 0px #000</p>
                  <p className="text-sm text-muted-foreground">Default state</p>
                </div>
                <div className="p-4 bg-white border-2 border-black rounded-lg" style={{ boxShadow: '1px 1px 0 0 #000' }}>
                  <p className="font-mono text-sm">--: 1px 1px 0px 0px #000</p>
                  <p className="text-sm text-muted-foreground">Hover state</p>
                </div>
                <div className="p-4 bg-white border-2 border-black rounded-lg" style={{ boxShadow: '0px 0px 0 0 #000' }}>
                  <p className="font-mono text-sm">---active: 0px 0px 0px 0px #000</p>
                  <p className="text-sm text-muted-foreground">Active/pressed state</p>
                </div>
              </div>
            </div>

            {/* Border Radius */}
            <div className="space-y-4">
              <h3 className="label-retro text-muted-foreground">Border Radius</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-secondary border-2 border-black rounded-sm" />
                  <span className="font-mono text-xs">--radius-sm</span>
                  <span className="text-xs text-muted-foreground">4px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-secondary border-2 border-black rounded-md" />
                  <span className="font-mono text-xs">--radius-md</span>
                  <span className="text-xs text-muted-foreground">6px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-secondary border-2 border-black rounded-lg" />
                  <span className="font-mono text-xs">--radius</span>
                  <span className="text-xs text-muted-foreground">8px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-secondary border-2 border-black rounded-xl" />
                  <span className="font-mono text-xs">--radius-lg</span>
                  <span className="text-xs text-muted-foreground">16px</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 bg-secondary border-2 border-black rounded-full" />
                  <span className="font-mono text-xs">full</span>
                  <span className="text-xs text-muted-foreground">50%</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Buttons */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Buttons</h2>
          </div>

          <div className="space-y-6">
            {/* Button Variants - 2 Color Palette */}
            <div className="space-y-3">
              <h3 className="label-retro text-muted-foreground">Variants (2-Color)</h3>
              <div className="flex flex-wrap gap-4">
                <button className="btn-primary">
                  <span className="flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    Primary
                  </span>
                </button>
                <button className="btn-secondary">
                  <span className="flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Secondary
                  </span>
                </button>
                <button className="btn-ghost">
                  <span className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Ghost
                  </span>
                </button>
              </div>
            </div>

            {/* Icon Buttons */}
            <div className="space-y-3">
              <h3 className="label-retro text-muted-foreground">Icon Buttons</h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn-icon">
                  <Plus className="w-5 h-5" />
                </button>
                <button className="btn-icon">
                  <Search className="w-5 h-5" />
                </button>
                <button className="btn-icon">
                  <Bell className="w-5 h-5" />
                </button>
                <button className="btn-icon">
                  <Heart className="w-5 h-5 text-primary" />
                </button>
                <button className="btn-icon">
                  <ChefHat className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Button States */}
            <div className="space-y-3">
              <h3 className="label-retro text-muted-foreground">Interactive States</h3>
              <div className="p-4 bg-muted rounded-lg border-2 border-black">
                <p className="font-mono text-sm mb-2">Hover → translate(1px, 1px) + shadow: 1px 1px</p>
                <p className="font-mono text-sm">Active → translate(2px, 2px) + shadow: 0px 0px</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <UtensilsCrossed className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Cards</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card-retro">
              <h3 className="font-display font-bold text-lg mb-2">Standard Card</h3>
              <p className="text-muted-foreground text-sm mb-4">
                White background with 2px black border and hard shadow offset.
              </p>
              <div className="flex gap-2">
                <span className="badge-retro bg-primary text-white">bg-card</span>
                <span className="badge-retro bg-gray-100"></span>
              </div>
            </div>
            <div className="card-accent">
              <h3 className="font-display font-bold text-lg mb-2">Accent Card</h3>
              <p className="text-sm mb-4">
                Yellow background for highlighting important content.
              </p>
              <div className="flex gap-2">
                <span className="badge-retro bg-white">bg-secondary</span>
                <span className="badge-retro bg-white"></span>
              </div>
            </div>
          </div>
        </section>

        {/* Badges */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <Star className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Badges & Tags</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <span className="badge-retro bg-white">Default</span>
            <span className="badge-new">New</span>
            <span className="badge-success">Success</span>
            <span className="badge-info">Info</span>
            <span className="badge-warning">Warning</span>
            <span className="badge-error">Error</span>
            <span className="badge-retro bg-primary text-white">Primary</span>
            <span className="badge-retro bg-secondary text-black">Secondary</span>
          </div>
        </section>

        {/* Alerts */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <Bell className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Alerts</h2>
          </div>

          <div className="space-y-4">
            <div className="alert-success">
              <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Success!</p>
                <p className="text-sm">Your recipe has been saved successfully.</p>
              </div>
            </div>
            <div className="alert-warning">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Warning</p>
                <p className="text-sm">You have unsaved changes in your meal plan.</p>
              </div>
            </div>
            <div className="alert-error">
              <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Error</p>
                <p className="text-sm">Failed to import recipe. Please try again.</p>
              </div>
            </div>
            <div className="alert-retro bg-accent/20">
              <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent" />
              <div>
                <p className="font-bold">Information</p>
                <p className="text-sm">Pro tip: You can drag recipes between days!</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Elements */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <Settings className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Form Elements</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Text Input */}
            <div className="space-y-2">
              <label className="label-retro">Text Input</label>
              <input
                type="text"
                placeholder="Enter recipe name..."
                className="input-retro"
              />
            </div>

            {/* Select */}
            <div className="space-y-2">
              <label className="label-retro">Select</label>
              <select className="select-retro">
                <option>Choose a category</option>
                <option>Breakfast</option>
                <option>Lunch</option>
                <option>Dinner</option>
              </select>
            </div>

            {/* Search Combo */}
            <div className="space-y-2 md:col-span-2">
              <label className="label-retro">Search Combo</label>
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search recipes..."
                  className="input-search-left flex-1"
                />
                <button className="btn-search-right">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Navigation Elements */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Navigation</h2>
          </div>

          {/* Pills */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Pills / Tabs</h3>
            <div className="flex flex-wrap gap-2">
              <button className="pill-active">All Recipes</button>
              <button className="pill-retro">Favorites</button>
              <button className="pill-retro">Recent</button>
              <button className="pill-retro">Shared</button>
            </div>
          </div>

          {/* Breadcrumb */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Breadcrumb</h3>
            <nav className="breadcrumb-retro">
              <a href="#" className="breadcrumb-link">Home</a>
              <span className="mx-2">/</span>
              <a href="#" className="breadcrumb-link">Recipes</a>
              <span className="mx-2">/</span>
              <span className="breadcrumb-current">Pasta Carbonara</span>
            </nav>
          </div>
        </section>

        {/* Icons */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Icons</h2>
          </div>

          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Retro Icon Style</h3>
            <div className="flex flex-wrap gap-4">
              <div className="group">
                <div className="icon-retro">
                  <ChefHat className="w-6 h-6" />
                </div>
              </div>
              <div className="group">
                <div className="icon-retro">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
              </div>
              <div className="group">
                <div className="icon-retro">
                  <Calendar className="w-6 h-6" />
                </div>
              </div>
              <div className="group">
                <div className="icon-retro">
                  <ShoppingCart className="w-6 h-6" />
                </div>
              </div>
              <div className="group">
                <div className="icon-retro">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
              </div>
              <div className="group">
                <div className="icon-retro">
                  <Star className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Using Lucide React icons with retro container styling
            </p>
          </div>
        </section>

        {/* Progress & Data Viz */}
        <section className="card-retro space-y-6">
          <div className="flex items-center gap-3">
            <div className="icon-retro">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-2xl font-display font-bold">Progress & Charts</h2>
          </div>

          {/* Progress Bar */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Progress Bar</h3>
            <div className="progress-retro">
              <div className="progress-retro-bar bg-primary" style={{ width: '65%' }} />
            </div>
            <div className="progress-retro">
              <div className="progress-retro-bar bg-secondary" style={{ width: '40%' }} />
            </div>
            <div className="progress-retro">
              <div className="progress-retro-bar bg-accent" style={{ width: '85%' }} />
            </div>
          </div>

          {/* Mini Bar Chart - 2 Color Palette */}
          <div className="space-y-3">
            <h3 className="label-retro text-muted-foreground">Bar Chart Style (2-Color)</h3>
            <div className="flex items-end gap-2 h-32 p-4 bg-muted rounded-lg border-2 border-black">
              <div className="bar-primary w-8" style={{ height: '60%' }} />
              <div className="bar-secondary w-8" style={{ height: '80%' }} />
              <div className="bar-primary w-8" style={{ height: '45%' }} />
              <div className="bar-secondary w-8" style={{ height: '90%' }} />
              <div className="bar-primary w-8" style={{ height: '55%' }} />
              <div className="bar-secondary w-8" style={{ height: '70%' }} />
              <div className="bar-primary w-8" style={{ height: '35%' }} />
            </div>
          </div>
        </section>

        {/* Design Philosophy */}
        <section className="card-accent space-y-4">
          <h2 className="text-2xl font-display font-bold">Design Philosophy</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border-2 border-black">
              <h3 className="font-bold mb-2">Neo-Brutalist</h3>
              <p className="text-sm">Bold 2px black borders, hard offset shadows, no blur effects.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-black">
              <h3 className="font-bold mb-2">2-Color Simplicity</h3>
              <p className="text-sm">Navy + Yellow palette on warm cream. Bold and memorable.</p>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-black">
              <h3 className="font-bold mb-2">Press-In Interactions</h3>
              <p className="text-sm">Buttons translate inward on hover/active with shadow reduction.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center py-8 border-t-2 border-black">
          <p className="font-display text-sm text-muted-foreground">
            RETRO DESIGN SYSTEM v2 — "Babe, What's for Dinner?"
          </p>
        </footer>

      </div>
    </div>
  );
}

interface ColorSwatchProps {
  name: string;
  hex: string;
  hsl: string;
  className: string;
  textLight?: boolean;
}

function ColorSwatch({ name, hex, hsl, className, textLight }: ColorSwatchProps) {
  return (
    <div className="space-y-2">
      <div
        className={`h-24 rounded-lg border-2 border-black flex items-end p-2 ${className}`}
        style={{ boxShadow: '2px 2px 0 0 #000' }}
      >
        <span className={`font-mono text-xs ${textLight ? 'text-white' : 'text-black'}`}>
          {hex}
        </span>
      </div>
      <div>
        <p className="font-bold text-sm">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{hsl}</p>
      </div>
    </div>
  );
}
