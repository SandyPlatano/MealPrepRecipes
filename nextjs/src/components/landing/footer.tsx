import Link from 'next/link';
import { PixelBrandLogoCompact } from '@/components/landing/pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER
// Simple, dark footer with essential links
// ═══════════════════════════════════════════════════════════════════════════

export function Footer() {
  return (
    <footer className="bg-[#111111] border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <PixelBrandLogoCompact />
            <span className="font-mono text-white/60 text-sm">
              © {new Date().getFullYear()} MealPrepRecipes
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-white/60 hover:text-white transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-white/60 hover:text-white transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
