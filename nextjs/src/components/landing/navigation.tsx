'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { PixelBrandLogoCompact } from '@/components/landing/pixel-art';

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION
// Dark, scroll-aware navigation with transparent → backdrop transition
// ═══════════════════════════════════════════════════════════════════════════

const SCROLL_THRESHOLD = 50;

export function Navigation() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        hasScrolled
          ? 'bg-[#111111]/90 backdrop-blur-sm border-b border-[#FDFBF7]/10'
          : 'bg-transparent border-b border-transparent'
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity">
          <PixelBrandLogoCompact variant="inline" colorMode="dark" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="#features">Features</NavLink>
          <NavLink href="#pricing">Pricing</NavLink>
          <NavLink href="#faq">FAQ</NavLink>
          <NavLink href="/about">About</NavLink>
          <Link
            href="/login"
            className="text-sm font-mono font-medium text-[#FDFBF7]/70 hover:text-[#F97316] transition-colors"
          >
            Log in
          </Link>
          <Link href="/signup">
            <button type="button" className="btn-pixel btn-pixel-primary text-sm py-2 px-4">
              Sign up free
            </button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/login">
            <Button
              size="sm"
              variant="ghost"
              className="text-[#FDFBF7]/70 hover:text-[#F97316] font-mono"
            >
              Log in
            </Button>
          </Link>
          <Link href="/signup">
            <button type="button" className="btn-pixel btn-pixel-primary text-sm py-2.5 px-4 min-h-[44px]">
              Sign Up
            </button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-[#FDFBF7]/70 hover:text-[#FDFBF7] hover:bg-[#FDFBF7]/10"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[280px] bg-[#111111] border-l border-[#FDFBF7]/10"
            >
              <SheetHeader>
                <SheetTitle className="font-mono text-left text-[#FDFBF7]">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-2 mt-6">
                <MobileNavLink href="#features">Features</MobileNavLink>
                <MobileNavLink href="#pricing">Pricing</MobileNavLink>
                <MobileNavLink href="#faq">FAQ</MobileNavLink>
                <MobileNavLink href="/about">About</MobileNavLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="text-sm font-mono font-medium text-[#FDFBF7]/70 hover:text-[#F97316] focus-visible:text-[#F97316] focus-visible:outline-none focus-visible:underline underline-offset-4 transition-colors"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <SheetClose asChild>
      <Link href={href}>
        <Button
          variant="ghost"
          className="w-full justify-start text-base font-mono text-[#FDFBF7]/70 hover:text-[#F97316] hover:bg-[#FDFBF7]/5"
        >
          {children}
        </Button>
      </Link>
    </SheetClose>
  );
}
