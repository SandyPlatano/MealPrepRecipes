'use client';

import Link from 'next/link';
import { PixelBrandLogoCompact } from '@/components/landing/pixel-art';
import { AppNav, type NavItem } from './app-nav';
import { MobileMenu } from './mobile-menu';
import { SettingsButton } from './settings-button';
import { SearchButton } from './search-button';
import { ScrollHeader } from './scroll-header';
import { NotificationBell } from '@/components/notifications';

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
          <PixelBrandLogoCompact variant="inline" colorMode="light" />
        </Link>

        <div className="flex items-center gap-3">
          {/* Desktop Navigation + Search + Notifications + Settings grouped */}
          <div className="hidden md:flex items-center gap-3">
            <AppNav items={navItems} variant="desktop" />
            <SearchButton />
            <NotificationBell />
            <SettingsButton />
          </div>

          {/* Mobile: Show search and notification bell */}
          <div className="md:hidden flex items-center gap-1">
            <SearchButton />
            <NotificationBell />
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
