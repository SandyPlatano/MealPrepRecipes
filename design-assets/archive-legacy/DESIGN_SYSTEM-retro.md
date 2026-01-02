# Retro UI Design System v2

This project uses a **Neo-Brutalist / Retro** design system. All UI components MUST follow these guidelines.

## Core Principles

1. **Bold black borders** (2px solid black) on all interactive elements
2. **Hard drop shadows** that shift on interaction (not soft shadows)
3. **Warm, vibrant colors** against a cream background
4. **Monospace headings** + clean sans-serif body text
5. **Playful micro-interactions** (translate + brightness on hover/active)
6. **Yellow focus states** for form elements

---

## Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `primary` | `#F56565` | CTAs, primary buttons, active states |
| `secondary` | `#FBBF24` | Highlights, badges, accent cards, focus states |
| `tertiary` | `#60A5FA` | Links, icons, secondary actions |
| `background-light` | `#FEF6E4` | Page background (light mode) |
| `background-dark` | `#1F2937` | Page background (dark mode) |
| `surface-light` | `#FFFFFF` | Cards, modals (light mode) |
| `surface-dark` | `#374151` | Cards, modals (dark mode) |
| `text-main` | `#111827` | Primary text, borders |
| `text-muted` | `#6B7280` | Secondary/helper text |

---

## Typography

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Display H1 | Space Mono | Bold | 48px (text-5xl) |
| Section H2 | Space Mono | Bold | 30px (text-3xl) |
| Subsection H3 | Space Mono | Bold | 20px (text-xl) |
| Body | Work Sans | Regular | 16px (text-base) |
| Labels | Work Sans | Bold | 14px uppercase tracking-wide |
| Small/Mono | Space Mono | Regular | 10-12px |

**Font imports:**
```
Space Mono: headings, labels, mono text
Work Sans: body text, paragraphs
Material Icons: iconography
```

---

## Shadows (Critical!)

```css
shadow-retro: 4px 4px 0px 0px #000000        /* Default state */
shadow-retro-hover: 2px 2px 0px 0px #000000  /* Hover state */
shadow-retro-active: 0px 0px 0px 0px #000000 /* Active/pressed */
shadow-retro-sm: 3px 3px 0px 0px #000000     /* Small elements (icons) */
shadow-retro-input: 4px 4px 0px 0px rgba(0,0,0,0.1) /* Input default */
```

**Interaction pattern:** Elements translate toward shadow on hover/active:
- Hover: `translate-x-[2px] translate-y-[2px]` + `brightness-110`
- Active: `translate-x-[4px] translate-y-[4px]` + `brightness-90`

---

## Border Style

ALL interactive elements get this class:
```css
.retro-border {
  border: 2px solid #000;
}
```

In Tailwind: `border-2 border-black`

---

## Custom Scrollbar

```css
::-webkit-scrollbar {
  width: 12px;
}
::-webkit-scrollbar-track {
  background: #fef6e4;
  border-left: 2px solid #000;
}
::-webkit-scrollbar-thumb {
  background: #f56565;
  border: 2px solid #000;
  border-radius: 6px;
}
::-webkit-scrollbar-thumb:hover {
  background: #e53e3e;
}
```

---

## Button Patterns

### Primary Button
```jsx
<button className="bg-primary text-white font-bold py-3 px-6 rounded-lg border-2 border-black shadow-retro hover:shadow-retro-hover hover:translate-x-[2px] hover:translate-y-[2px] hover:brightness-110 active:shadow-retro-active active:translate-x-[4px] active:translate-y-[4px] active:brightness-90 transition-all">
  Get Started
</button>
```

### Secondary Button
```jsx
<button className="bg-secondary text-black font-bold py-3 px-6 rounded-lg border-2 border-black shadow-retro hover:shadow-retro-hover hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow-300 active:shadow-retro-active active:translate-x-[4px] active:translate-y-[4px] active:bg-yellow-500 transition-all">
  Explore More
</button>
```

### Ghost/Outline Button
```jsx
<button className="bg-transparent font-bold py-3 px-6 rounded-lg border-2 border-black shadow-retro hover:bg-gray-100 hover:shadow-retro-hover hover:translate-x-[2px] hover:translate-y-[2px] active:shadow-retro-active active:translate-x-[4px] active:translate-y-[4px] active:bg-gray-200 transition-all">
  Documentation
</button>
```

### Icon Button (Circle)
```jsx
<button className="bg-white p-3 rounded-full border-2 border-black shadow-retro hover:shadow-retro-hover hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-gray-50 active:shadow-retro-active active:translate-x-[2px] active:translate-y-[2px] transition-all">
  <Icon />
</button>
```

---

## Form Elements

### Input with Focus State
```jsx
<input 
  className="w-full bg-white border-2 border-black rounded-lg py-3 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-retro focus:bg-yellow-50 focus:border-primary focus:outline-none transition-all placeholder-gray-400"
  placeholder="Enter text..."
/>
```

### Select
```jsx
<select className="w-full bg-white border-2 border-black rounded-lg py-3 px-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] focus:shadow-retro focus:bg-yellow-50 focus:border-primary focus:outline-none appearance-none cursor-pointer transition-all">
  <option>Option 1</option>
</select>
```

### Search Input with Button
```jsx
<div className="flex">
  <input className="w-full bg-white border-2 border-black border-r-0 rounded-l-lg py-3 pl-12 pr-4 focus:bg-yellow-50 focus:outline-none transition-colors" />
  <button className="bg-secondary text-black font-bold px-6 rounded-r-lg border-2 border-black border-l-2 hover:bg-yellow-300 hover:shadow-inner active:bg-yellow-500 transition-all">
    Go
  </button>
</div>
```

---

## Card Pattern

```jsx
<div className="bg-white border-2 border-black rounded-xl p-6 shadow-retro">
  {/* Card content */}
</div>
```

### Accent Card (Yellow Background)
```jsx
<div className="bg-secondary border-2 border-black rounded-xl p-6 shadow-retro">
  {/* Highlighted content */}
</div>
```

---

## Icon Pattern

```jsx
<div className="w-12 h-12 flex items-center justify-center bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_0px_#000] group-active:translate-x-[3px] group-active:translate-y-[3px] group-active:shadow-none transition-all">
  <span className="material-icons">bolt</span>
</div>
```

---

## Badge/Tag Pattern

```jsx
<span className="px-2 py-1 bg-secondary text-black text-xs font-bold border-2 border-black rounded">
  NEW
</span>
```

### Status Badges
```jsx
// Success
<span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-bold border-2 border-black rounded">Full-time</span>

// Info
<span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs font-bold border-2 border-black rounded">Remote</span>
```

---

## Alert Patterns

### Success
```jsx
<div className="bg-green-100 text-green-900 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#064e3b] flex items-start gap-3">
  <span className="material-icons">check_circle</span>
  <div>
    <h4 className="font-bold">Success!</h4>
    <p className="text-sm">Message here</p>
  </div>
</div>
```

### Warning
```jsx
<div className="bg-yellow-100 text-yellow-900 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#78350f] flex items-start gap-3">
```

### Error
```jsx
<div className="bg-red-100 text-red-900 p-4 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_#7f1d1d] flex items-start gap-3">
```

---

## Data Visualization

### Bar Chart
- Use primary/secondary/tertiary colors for bars
- Add `border-2 border-black border-b-0 rounded-t-sm` to each bar
- Hover tooltip with black background, white text

### Donut/Pie Chart
- Use `conic-gradient()` with primary color
- Center hole with surface color
- Retro border on outer edge

### Progress Bar
```jsx
<div className="w-full h-6 bg-gray-200 border-2 border-black rounded-full overflow-hidden relative">
  <div className="h-full bg-secondary absolute top-0 left-0 border-r-2 border-black" style={{width: '66%'}} />
  {/* Optional stripe overlay */}
</div>
```

---

## Navigation

### Pills/Tabs
```jsx
// Active
<button className="bg-primary text-white px-4 py-2 rounded-lg border-2 border-black shadow-retro-hover hover:brightness-110 active:shadow-retro-active active:translate-y-[2px] transition-all text-sm font-bold">
  All
</button>

// Inactive
<button className="bg-white px-4 py-2 rounded-lg border-2 border-black text-sm font-bold hover:bg-gray-100 hover:-translate-y-0.5 transition-transform">
  Design
</button>
```

### Breadcrumbs
```jsx
<nav className="flex items-center text-sm font-mono bg-white border-2 border-black inline-flex px-4 py-2 rounded-full shadow-[2px_2px_0px_0px_#000]">
  <a className="hover:underline hover:text-primary transition-colors" href="#">Home</a>
  <span className="mx-2 text-gray-400">/</span>
  <span className="font-bold text-primary">Current</span>
</nav>
```

---

## DO's and DON'Ts

✅ **DO:**
- Use 2px black borders on all interactive elements
- Use hard drop shadows (no blur)
- Animate shadow + translate + brightness together on hover
- Use Space Mono for headings
- Use Work Sans for body text
- Use the warm cream background (#FEF6E4)
- Add yellow background (#FEF6E4 → yellow-50) on input focus
- Use Material Icons for iconography

❌ **DON'T:**
- Use soft/blurred shadows
- Use thin or colored borders
- Use generic sans-serif for headings
- Use cold white (#FFFFFF) as page background
- Forget the translate animation on buttons
- Skip the focus states on form elements
- Use different icon libraries (stick to Material Icons)
