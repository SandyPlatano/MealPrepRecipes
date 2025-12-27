/**
 * RETRO UI COMPONENTS v2
 * Neo-brutalist component library
 * 
 * Usage: Import these components to maintain design consistency
 */

import React from 'react';

// ================================
// BUTTONS
// ================================

export function Button({ 
  children, 
  variant = 'primary', 
  icon,
  className = '',
  ...props 
}) {
  const variants = {
    primary: 'bg-primary text-white hover:brightness-110 active:brightness-90',
    secondary: 'bg-secondary text-black hover:bg-yellow-300 active:bg-yellow-500',
    tertiary: 'bg-tertiary text-white hover:brightness-110 active:brightness-90',
    ghost: 'bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700',
  };

  return (
    <button
      className={`
        font-bold py-3 px-6 rounded-lg
        border-2 border-black
        shadow-retro
        hover:shadow-retro-hover hover:translate-x-[2px] hover:translate-y-[2px]
        active:shadow-retro-active active:translate-x-[4px] active:translate-y-[4px]
        transition-all duration-150
        flex items-center gap-2
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
      {icon}
    </button>
  );
}

export function IconButton({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-white dark:bg-gray-700 hover:bg-gray-50',
    primary: 'bg-primary text-white hover:brightness-110',
    tertiary: 'bg-tertiary text-white hover:brightness-110',
  };

  return (
    <button
      className={`
        p-3 rounded-full
        border-2 border-black
        shadow-retro
        hover:shadow-retro-hover hover:translate-x-[1px] hover:translate-y-[1px]
        active:shadow-retro-active active:translate-x-[2px] active:translate-y-[2px]
        transition-all duration-150
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

// ================================
// CARDS
// ================================

export function Card({ children, accent = false, className = '', ...props }) {
  return (
    <div
      className={`
        ${accent ? 'bg-secondary' : 'bg-surface-light dark:bg-surface-dark'}
        border-2 border-black rounded-xl p-6
        shadow-retro
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}

// ================================
// INPUTS
// ================================

export function Input({ label, icon, className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="font-bold text-sm uppercase tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          className={`
            w-full bg-white dark:bg-gray-800
            border-2 border-black rounded-lg py-3 px-4
            shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
            focus:shadow-retro focus:bg-yellow-50 dark:focus:bg-gray-900
            focus:border-primary focus:outline-none
            transition-all duration-150
            placeholder-gray-400
            ${icon ? 'pr-12' : ''}
            ${className}
          `}
          {...props}
        />
        {icon && (
          <span className="absolute right-4 top-3.5 opacity-50 pointer-events-none">
            {icon}
          </span>
        )}
      </div>
    </div>
  );
}

export function SearchInput({ placeholder = 'Search...', onSearch, className = '', ...props }) {
  return (
    <div className={`flex ${className}`}>
      <div className="relative w-full">
        <span className="material-icons absolute left-4 top-3.5 pointer-events-none">search</span>
        <input
          className="w-full bg-white dark:bg-gray-800 border-2 border-black border-r-0 rounded-l-lg py-3 pl-12 pr-4 focus:bg-yellow-50 dark:focus:bg-gray-900 focus:shadow-[inset_2px_2px_0px_rgba(0,0,0,0.05)] focus:outline-none transition-colors"
          placeholder={placeholder}
          {...props}
        />
      </div>
      <button 
        onClick={onSearch}
        className="bg-secondary text-black font-bold px-6 rounded-r-lg border-2 border-black border-l-2 hover:bg-yellow-300 hover:shadow-inner active:bg-yellow-500 transition-all"
      >
        Go
      </button>
    </div>
  );
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="font-bold text-sm uppercase tracking-wide">
          {label}
        </label>
      )}
      <select
        className={`
          w-full bg-white dark:bg-gray-800
          border-2 border-black rounded-lg py-3 px-4
          shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
          focus:shadow-retro focus:bg-yellow-50 dark:focus:bg-gray-900
          focus:border-primary focus:outline-none
          appearance-none cursor-pointer
          transition-all
          ${className}
        `}
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

// ================================
// ICONS
// ================================

export function IconTile({ icon, label, className = '', ...props }) {
  return (
    <div className={`flex flex-col items-center gap-2 group cursor-pointer ${className}`} {...props}>
      <div className="w-12 h-12 flex items-center justify-center bg-white dark:bg-gray-700 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_#000] group-hover:translate-x-[1px] group-hover:translate-y-[1px] group-hover:shadow-[1px_1px_0px_0px_#000] group-active:translate-x-[3px] group-active:translate-y-[3px] group-active:shadow-none transition-all">
        <span className="material-icons">{icon}</span>
      </div>
      {label && (
        <span className="text-[10px] uppercase font-bold tracking-wider opacity-60">{label}</span>
      )}
    </div>
  );
}

// ================================
// BADGES
// ================================

export function Badge({ children, variant = 'default', className = '', ...props }) {
  const variants = {
    default: 'bg-secondary text-black',
    success: 'bg-green-200 text-green-800 dark:bg-green-900 dark:text-green-100',
    info: 'bg-blue-200 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
    warning: 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-200 text-red-800 dark:bg-red-900 dark:text-red-100',
  };

  return (
    <span
      className={`
        inline-block px-2 py-1
        text-xs font-bold
        border-2 border-black rounded
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {children}
    </span>
  );
}

// ================================
// ALERTS
// ================================

export function Alert({ children, variant = 'success', icon, title, className = '', ...props }) {
  const variants = {
    success: 'bg-green-100 text-green-900 shadow-[4px_4px_0px_0px_#064e3b] dark:bg-green-900 dark:text-green-100',
    warning: 'bg-yellow-100 text-yellow-900 shadow-[4px_4px_0px_0px_#78350f] dark:bg-yellow-900 dark:text-yellow-100',
    error: 'bg-red-100 text-red-900 shadow-[4px_4px_0px_0px_#7f1d1d] dark:bg-red-900 dark:text-red-100',
  };

  const defaultIcons = {
    success: 'check_circle',
    warning: 'warning',
    error: 'error',
  };

  return (
    <div
      className={`
        p-4 rounded-lg border-2 border-black
        flex items-start gap-3
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      <span className="material-icons">{icon || defaultIcons[variant]}</span>
      <div>
        {title && <h4 className="font-bold">{title}</h4>}
        <p className="text-sm">{children}</p>
      </div>
    </div>
  );
}

// ================================
// NAVIGATION
// ================================

export function Pill({ children, active = false, className = '', ...props }) {
  if (active) {
    return (
      <button
        className={`
          px-4 py-2 rounded-lg border-2 border-black text-sm font-bold
          bg-primary text-white shadow-retro-hover
          hover:brightness-110
          active:shadow-retro-active active:translate-y-[2px]
          transition-all
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      className={`
        px-4 py-2 rounded-lg border-2 border-black text-sm font-bold
        bg-white dark:bg-gray-800
        hover:bg-gray-100 dark:hover:bg-gray-700 hover:-translate-y-0.5
        transition-all
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}

export function Breadcrumbs({ items, className = '', ...props }) {
  return (
    <nav 
      className={`
        flex items-center text-sm font-mono
        bg-white dark:bg-gray-800 border-2 border-black
        inline-flex px-4 py-2 rounded-full
        shadow-[2px_2px_0px_0px_#000]
        ${className}
      `}
      {...props}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className="mx-2 text-gray-400">/</span>}
          {item.href ? (
            <a href={item.href} className="hover:underline hover:text-primary transition-colors">
              {item.label}
            </a>
          ) : (
            <span className="font-bold text-primary">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}

// ================================
// PROGRESS
// ================================

export function ProgressBar({ value = 0, label, showStripes = true, className = '', ...props }) {
  return (
    <div className={className} {...props}>
      <div className="w-full h-6 bg-gray-200 dark:bg-gray-700 border-2 border-black rounded-full overflow-hidden relative">
        <div 
          className="h-full bg-secondary absolute top-0 left-0 border-r-2 border-black transition-all duration-300"
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
        {showStripes && (
          <div 
            className="w-full h-full absolute top-0 left-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%)',
              backgroundSize: '10px 10px'
            }}
          />
        )}
      </div>
      {label && (
        <div className="flex justify-between mt-2 text-xs font-mono font-bold">
          <span>{label}</span>
          <span>{value}%</span>
        </div>
      )}
    </div>
  );
}

// ================================
// DATA VIZ
// ================================

export function BarChart({ data, className = '', ...props }) {
  const colorClasses = {
    primary: 'bg-primary hover:bg-red-400',
    secondary: 'bg-secondary hover:bg-yellow-300',
    tertiary: 'bg-tertiary hover:bg-blue-300',
    gray: 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400',
  };

  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className={`p-4 bg-white dark:bg-gray-800 border-2 border-black rounded-lg relative ${className}`} {...props}>
      {/* Grid lines */}
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{
        backgroundImage: 'linear-gradient(#00000010 1px, transparent 1px)',
        backgroundSize: '100% 20%'
      }} />
      
      <div className="flex items-end h-32 gap-3 relative">
        {data.map((item, index) => (
          <div 
            key={index}
            className={`
              flex-1 border-2 border-black border-b-0 rounded-t-sm
              relative group transition-all cursor-pointer
              ${colorClasses[item.color || 'primary']}
            `}
            style={{ height: `${(item.value / maxValue) * 100}%` }}
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DonutChart({ value = 0, label, className = '', ...props }) {
  return (
    <div className={`flex flex-col items-center ${className}`} {...props}>
      {label && (
        <h4 className="text-xs font-bold uppercase tracking-wide mb-3 opacity-70">{label}</h4>
      )}
      <div 
        className="relative w-24 h-24 rounded-full border-2 border-black flex items-center justify-center bg-white dark:bg-gray-800 shadow-[2px_2px_0px_0px_#000]"
        style={{
          background: `conic-gradient(#f56565 0% ${value}%, transparent ${value}% 100%)`
        }}
      >
        <div className="w-12 h-12 bg-surface-light dark:bg-surface-dark rounded-full border-2 border-black flex items-center justify-center z-10">
          <span className="text-xs font-bold">{value}%</span>
        </div>
      </div>
    </div>
  );
}
