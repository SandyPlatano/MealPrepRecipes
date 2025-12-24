import Link from "next/link";
import { Zap, Twitter, Linkedin, Github } from "lucide-react";
import { FOOTER_LINKS, FOOTER_DESCRIPTION } from "../_data/landing-data";

export function DashboardFooter() {
  return (
    <footer className="border-t border-border bg-muted/50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary">
                <Zap className="size-5 text-primary-foreground" />
              </div>
              <span className="font-mono text-xl font-bold">RetailIQ</span>
            </Link>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              {FOOTER_DESCRIPTION}
            </p>

            {/* Social links */}
            <div className="mt-6 flex gap-4">
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="size-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Linkedin className="size-5" />
              </a>
              <a
                href="#"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Github className="size-5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          <div>
            <h4 className="font-mono font-semibold">Product</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-semibold">Company</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-mono font-semibold">Resources</h4>
            <ul className="mt-4 space-y-2">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} RetailIQ. All rights reserved.
          </p>
          <div className="flex gap-6">
            {FOOTER_LINKS.legal.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
