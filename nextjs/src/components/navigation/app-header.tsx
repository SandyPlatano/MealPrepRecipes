'use client';

import Link from 'next/link';
import { BrandLogoCompact } from '@/components/brand/logo';
import { AppNav, type NavItem } from './app-nav';
import { MobileMenu } from './mobile-menu';
import { SettingsButton } from './settings-button';
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
        <Link href="/app" className="hover:opacity-80 transition-opacity flex-shrink-0">
          <BrandLogoCompact />
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop Navigation + Settings grouped */}
          <div className="hidden md:flex items-center gap-3">
            <AppNav items={navItems} variant="desktop" />
            <SettingsButton />
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
