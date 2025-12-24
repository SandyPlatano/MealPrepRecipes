"use client";

import {
  // Official Brand Logo System
  PixelBrandIcon,
  PixelBrandLogoMini,
  PixelBrandLogoCompact,
  PixelBrandLogo,
  PixelBrandLogoHero,
  PixelBrandLogoStacked,
} from '@/components/landing/pixel-art';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════════════════════════
// PIXEL LOGO DEMO PAGE - Official Brand System
// ═══════════════════════════════════════════════════════════════════════════

export default function PixelDemoPage() {
  return (
    <div className="min-h-screen bg-[#111111] py-12 px-4">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <Link href="/" className="text-[#FDFBF7]/50 hover:text-[#FF4400] font-mono text-sm mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="font-mono text-4xl font-bold text-[#FDFBF7] mb-4">
            Brand Logo <span className="text-[#FF4400]">System</span>
          </h1>
          <p className="text-[#FDFBF7]/60 font-mono">
            Official logo components for different contexts
          </p>
        </div>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* ⭐ THE CHOSEN ONE - #8 Speech Bubble Style                          */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="mb-20 p-8 bg-gradient-to-b from-[#FF4400]/20 to-transparent rounded-2xl border-2 border-[#FF4400]/50">
          <h2 className="font-mono text-2xl font-bold text-[#FF4400] mb-2 text-center">
            Official Brand Logo
          </h2>
          <p className="text-[#FDFBF7]/50 font-mono text-sm mb-8 text-center">
            #8 Speech Bubble Style - The chosen logo
          </p>

          {/* Hero Size */}
          <div className="bg-[#1a1a1a] p-12 rounded-lg border-2 border-[#FF4400]/30 mb-8">
            <div className="flex justify-center mb-4">
              <PixelBrandLogoHero showTagline />
            </div>
            <p className="text-center text-[#FDFBF7]/30 font-mono text-xs mt-4">
              PixelBrandLogoHero - For landing pages and marketing
            </p>
          </div>

          {/* Standard Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <div className="min-h-[80px] flex items-center justify-center mb-4">
                <PixelBrandLogo size="sm" />
              </div>
              <p className="text-[#FDFBF7]/40 text-xs font-mono">size="sm"</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <div className="min-h-[80px] flex items-center justify-center mb-4">
                <PixelBrandLogo size="md" />
              </div>
              <p className="text-[#FDFBF7]/40 text-xs font-mono">size="md" (default)</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <div className="min-h-[80px] flex items-center justify-center mb-4">
                <PixelBrandLogo size="lg" />
              </div>
              <p className="text-[#FDFBF7]/40 text-xs font-mono">size="lg"</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <div className="min-h-[80px] flex items-center justify-center mb-4">
                <PixelBrandLogo size="xl" />
              </div>
              <p className="text-[#FDFBF7]/40 text-xs font-mono">size="xl"</p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 🧭 NAVIGATION VARIANTS                                              */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="mb-20 p-8 bg-gradient-to-b from-[#8b5cf6]/20 to-transparent rounded-2xl border-2 border-[#8b5cf6]/50">
          <h2 className="font-mono text-2xl font-bold text-[#8b5cf6] mb-2 text-center">
            Navigation Variants
          </h2>
          <p className="text-[#FDFBF7]/50 font-mono text-sm mb-8 text-center">
            Compact logos for headers and nav bars
          </p>

          {/* Compact - Speech Bubble (default) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Dark background */}
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10">
              <p className="text-[#FDFBF7]/30 font-mono text-xs mb-4">Dark Background (colorMode="dark")</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <PixelBrandLogoCompact variant="speech" colorMode="dark" />
                  <span className="text-[#FDFBF7]/40 text-xs font-mono">variant="speech"</span>
                </div>
                <div className="flex items-center gap-4">
                  <PixelBrandLogoCompact variant="inline" colorMode="dark" />
                  <span className="text-[#FDFBF7]/40 text-xs font-mono">variant="inline"</span>
                </div>
                <div className="flex items-center gap-4">
                  <PixelBrandLogoCompact variant="icon-only" colorMode="dark" />
                  <span className="text-[#FDFBF7]/40 text-xs font-mono">variant="icon-only"</span>
                </div>
              </div>
            </div>

            {/* Light background */}
            <div className="bg-[#FDFBF7] p-6 rounded-lg border border-[#111111]/10">
              <p className="text-[#111111]/50 font-mono text-xs mb-4">Light Background (colorMode="light")</p>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <PixelBrandLogoCompact variant="speech" colorMode="light" />
                  <span className="text-[#111111]/40 text-xs font-mono">variant="speech"</span>
                </div>
                <div className="flex items-center gap-4">
                  <PixelBrandLogoCompact variant="inline" colorMode="light" />
                  <span className="text-[#111111]/40 text-xs font-mono">variant="inline"</span>
                </div>
                <div className="flex items-center gap-4">
                  <PixelBrandLogoCompact variant="icon-only" colorMode="light" />
                  <span className="text-[#111111]/40 text-xs font-mono">variant="icon-only"</span>
                </div>
              </div>
            </div>
          </div>

          {/* Mini for mobile */}
          <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10">
            <p className="text-[#FDFBF7]/30 font-mono text-xs mb-4">Mini (for mobile nav)</p>
            <div className="flex items-center gap-6">
              <PixelBrandLogoMini />
              <span className="text-[#FDFBF7]/40 text-xs font-mono">PixelBrandLogoMini</span>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 🎯 ICON ONLY                                                        */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="mb-20 p-8 bg-gradient-to-b from-[#22c55e]/20 to-transparent rounded-2xl border-2 border-[#22c55e]/50">
          <h2 className="font-mono text-2xl font-bold text-[#22c55e] mb-2 text-center">
            Icon Only
          </h2>
          <p className="text-[#FDFBF7]/50 font-mono text-sm mb-8 text-center">
            For favicons, app icons, and tight spaces
          </p>

          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <PixelBrandIcon size={24} />
              <p className="text-[#FDFBF7]/40 text-xs font-mono mt-4">24px</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <PixelBrandIcon size={32} />
              <p className="text-[#FDFBF7]/40 text-xs font-mono mt-4">32px (default)</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <PixelBrandIcon size={48} />
              <p className="text-[#FDFBF7]/40 text-xs font-mono mt-4">48px</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <PixelBrandIcon size={64} />
              <p className="text-[#FDFBF7]/40 text-xs font-mono mt-4">64px</p>
            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════════════════════════════ */}
        {/* 📐 STACKED LAYOUT                                                   */}
        {/* ════════════════════════════════════════════════════════════════════ */}
        <section className="mb-20 p-8 bg-gradient-to-b from-[#f97316]/20 to-transparent rounded-2xl border-2 border-[#f97316]/50">
          <h2 className="font-mono text-2xl font-bold text-[#f97316] mb-2 text-center">
            Stacked Layout
          </h2>
          <p className="text-[#FDFBF7]/50 font-mono text-sm mb-8 text-center">
            For square spaces and app store icons
          </p>

          <div className="flex justify-center gap-8 flex-wrap">
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <PixelBrandLogoStacked size="sm" />
              <p className="text-[#FDFBF7]/40 text-xs font-mono mt-4">size="sm"</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <PixelBrandLogoStacked size="md" />
              <p className="text-[#FDFBF7]/40 text-xs font-mono mt-4">size="md"</p>
            </div>
            <div className="bg-[#1a1a1a] p-6 rounded-lg border border-[#FDFBF7]/10 text-center">
              <PixelBrandLogoStacked size="lg" />
              <p className="text-[#FDFBF7]/40 text-xs font-mono mt-4">size="lg"</p>
            </div>
          </div>
        </section>

        {/* Usage Guide */}
        <section className="mb-12 p-8 bg-[#1a1a1a] rounded-2xl border border-[#FDFBF7]/10">
          <h2 className="font-mono text-xl font-bold text-[#FDFBF7] mb-6">
            Usage Guide
          </h2>
          <div className="space-y-4 font-mono text-sm text-[#FDFBF7]/70">
            <p><span className="text-[#FF4400]">PixelBrandIcon</span> - Favicons, loading states, tight spaces</p>
            <p><span className="text-[#FF4400]">PixelBrandLogoMini</span> - Mobile navigation bars</p>
            <p><span className="text-[#FF4400]">PixelBrandLogoCompact</span> - Desktop navigation headers</p>
            <p><span className="text-[#FF4400]">PixelBrandLogo</span> - General branding, auth pages</p>
            <p><span className="text-[#FF4400]">PixelBrandLogoHero</span> - Landing pages, marketing</p>
            <p><span className="text-[#FF4400]">PixelBrandLogoStacked</span> - Square spaces, app store</p>
          </div>
        </section>

      </div>
    </div>
  );
}
