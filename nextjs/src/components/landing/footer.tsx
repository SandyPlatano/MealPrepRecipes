import Link from 'next/link';
import { Heart } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════
// FOOTER - Neo-Brutalist/Retro Design
// Bold borders, retro shadows, and vibrant colors
// ═══════════════════════════════════════════════════════════════════════════

export function Footer() {
  return (
    <footer className="bg-card border-t-2 border-black relative">
      {/* Decorative top border accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border-2 border-black shadow-retro">
          <Heart className="w-5 h-5 text-foreground" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 pt-16">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="font-display text-lg font-semibold text-foreground">
              Babe, WFD?
            </span>
            <span className="text-muted-foreground text-sm">
              © {new Date().getFullYear()}
            </span>
          </div>

          {/* Made with love */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-primary fill-current" />
            <span>for home cooks</span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary underline transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary underline transition-colors"
            >
              Terms
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
