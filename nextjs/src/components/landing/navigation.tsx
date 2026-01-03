'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, ArrowRight } from 'lucide-react';
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

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION - Warm & Cozy Design System (Pass 3 Micro Polish)
// Clean, minimal navigation with smooth scroll, focus states, accessibility
// ═══════════════════════════════════════════════════════════════════════════

const SCROLL_THRESHOLD = 50;

const NAV_LINKS = [
  { label: 'Features', href: '/#features' },
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/#faq' },
];

export function Navigation() {
  const [hasScrolled, setHasScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > SCROLL_THRESHOLD);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        hasScrolled
          ? 'bg-[#FFFCF6]/95 backdrop-blur-md border-b border-gray-200/50 shadow-sm py-3'
          : 'bg-transparent py-4'
      )}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Logo */}
        <Link
          href="/"
          aria-label="Babe, What's for Dinner? - Home"
          className="hover:opacity-80 transition-opacity flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 rounded-lg"
        >
          <div className="w-8 h-8 bg-[#D9F99D] rounded-lg flex items-center justify-center transition-transform duration-150 group-hover:scale-105">
            <span className="text-[#1A1A1A] font-bold text-sm">B</span>
          </div>
          <span className="font-display text-xl font-bold text-[#1A1A1A] hidden sm:inline">
            babewfd<span className="text-[#D9F99D]">.</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink key={link.label} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop Auth */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-gray-600 hover:text-[#1A1A1A] transition-colors px-3 py-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2"
          >
            Log in
          </Link>
          <Link href="/signup">
            <button
              type="button"
              className="bg-[#1A1A1A] text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 group shadow-sm hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2 active:scale-[0.98]"
            >
              Get started
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-150" />
            </button>
          </Link>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <Link href="/signup">
            <button
              type="button"
              className="bg-[#1A1A1A] text-white px-4 py-2 rounded-full font-semibold text-sm shadow-sm"
            >
              Start
            </button>
          </Link>
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Open navigation menu"
                className="text-[#1A1A1A] hover:bg-gray-100 rounded-full focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[300px] bg-[#FFFCF6] border-l border-gray-200"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-[#1A1A1A] font-display flex items-center gap-2">
                  <div className="w-6 h-6 bg-[#D9F99D] rounded-md flex items-center justify-center">
                    <span className="text-[#1A1A1A] font-bold text-xs">B</span>
                  </div>
                  Menu
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-1 mt-8">
                {NAV_LINKS.map((link) => (
                  <MobileNavLink key={link.label} href={link.href}>
                    {link.label}
                  </MobileNavLink>
                ))}
                <div className="h-px bg-gray-200 my-4" />
                <MobileNavLink href="/login">Log in</MobileNavLink>
                <SheetClose asChild>
                  <Link href="/signup" className="mt-4">
                    <button
                      type="button"
                      className="bg-[#1A1A1A] text-white px-6 py-3 rounded-full font-semibold text-sm w-full flex items-center justify-center gap-2 shadow-md"
                    >
                      Get started free
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </Link>
                </SheetClose>
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
      className="text-sm font-medium text-gray-600 hover:text-[#1A1A1A] transition-all duration-150 px-4 py-2 rounded-full hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#D9F99D] focus-visible:ring-offset-2"
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
          className="w-full justify-start text-base text-gray-600 hover:text-[#1A1A1A] hover:bg-gray-100 rounded-xl h-12"
        >
          {children}
        </Button>
      </Link>
    </SheetClose>
  );
}
