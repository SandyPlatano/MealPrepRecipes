'use client';

import Link from 'next/link';
import { AppNav, type NavItem } from './app-nav';
import { MobileMenu } from './mobile-menu';
import { SettingsButton } from './settings-button';
import { SearchButton } from './search-button';
import { ScrollHeader } from './scroll-header';

interface AppHeaderProps {
  navItems: NavItem[];
  settingsItem: NavItem;
  logoutAction: () => Promise<void>;
}

/**
 * Client-side app header.
 * Separates client-side interactivity from the server layout.
 */
export function AppHeader({ navItems, settingsItem, logoutAction }: AppHeaderProps) {
  return (
    <ScrollHeader>
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        <Link href="/app" className="hover:opacity-80 transition-opacity flex-shrink-0 flex items-center gap-2">
          <div className="w-8 h-8 bg-[#D9F99D] rounded-lg flex items-center justify-center">
            <span className="text-[#1A1A1A] font-bold text-sm">B</span>
          </div>
          <span className="font-bold text-lg text-[#1A1A1A] hidden sm:inline">
            babewfd<span className="text-[#D9F99D]">.</span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop Navigation + Search + Settings grouped */}
          <div className="hidden md:flex items-center gap-3">
            <AppNav items={navItems} variant="desktop" />
            <SearchButton />
            <SettingsButton />
          </div>

          {/* Mobile: Show search */}
          <div className="md:hidden flex items-center gap-1">
            <SearchButton />
          </div>

          {/* Mobile Menu */}
          <MobileMenu
            navItems={navItems}
            settingsItem={settingsItem}
            logoutAction={logoutAction}
          />
        </div>
      </div>
    </ScrollHeader>
  );
}
