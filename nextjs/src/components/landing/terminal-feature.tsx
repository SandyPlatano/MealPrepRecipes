'use client';

import { TerminalLog, DEMO_RECIPE_IMPORT_LINES } from './terminal-log';
import { PixelIcon, PixelDecoration } from './pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// TERMINAL FEATURE SECTION
// Shows the AI recipe import with a retro terminal animation
// ═══════════════════════════════════════════════════════════════════════════

interface FeatureItem {
  text: string;
}

const features: FeatureItem[] = [
  { text: 'Paste any recipe URL' },
  { text: 'AI extracts ingredients & steps' },
  { text: 'Auto-formats for your shopping list' },
  { text: 'Works with any website' },
];

export function TerminalFeature() {
  return (
    <section className="relative bg-[#111111] py-24 overflow-hidden">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: 'radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)',
          backgroundSize: '16px 16px',
        }}
      />

      {/* Corner decorations - pink accent */}
      <div className="absolute top-8 right-8 text-[#ff66c4]/20">
        <PixelDecoration variant="corner" />
      </div>
      <div className="absolute bottom-8 left-8 text-[#ff66c4]/15 rotate-90">
        <PixelDecoration variant="corner" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <div className="text-center mb-16">
          <div className="inline-block badge-pixel border-[#ff66c4] text-[#ff66c4] mb-4">
            Smart Import
          </div>
          <h2 className="font-mono text-3xl md:text-4xl font-bold text-[#FDFBF7] mb-4">
            AI-Powered Recipe Import
          </h2>
          <p className="text-[#FDFBF7]/60 max-w-md mx-auto">
            Just paste a URL. We handle the rest.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          {/* Terminal Animation */}
          <div className="order-2 md:order-1">
            <div className="card-pixel p-1 bg-[#111111] border-[#FDFBF7]">
              <TerminalLog
                lines={DEMO_RECIPE_IMPORT_LINES}
                typingSpeed={25}
                startDelay={800}
                loop={true}
                loopDelay={4000}
              />
            </div>
          </div>

          {/* Feature List */}
          <div className="order-1 md:order-2 space-y-8">
            <div className="flex items-center gap-4">
              <PixelIcon type="import" size={48} animated />
              <h3 className="font-mono text-2xl font-bold text-[#FDFBF7]">
                How It Works
              </h3>
            </div>

            <ul className="space-y-4">
              {features.map((feature, index) => (
                <li
                  key={index}
                  className="flex items-start gap-4 group cursor-default"
                >
                  <span className="mt-1.5 w-4 h-4 bg-[#FF4400] flex-shrink-0 group-hover:scale-110 transition-transform" />
                  <p className="text-[#FDFBF7]/80 text-lg group-hover:text-[#FDFBF7] transition-colors">
                    {feature.text}
                  </p>
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="flex gap-6 pt-4 border-t border-[#FDFBF7]/10">
              <div>
                <div className="font-mono text-2xl font-bold text-[#FF4400]">10K+</div>
                <div className="text-sm text-[#FDFBF7]/50">Recipes Imported</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-[#FF4400]">2 sec</div>
                <div className="text-sm text-[#FDFBF7]/50">Avg Import Time</div>
              </div>
              <div>
                <div className="font-mono text-2xl font-bold text-[#FF4400]">99%</div>
                <div className="text-sm text-[#FDFBF7]/50">Success Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default TerminalFeature;
