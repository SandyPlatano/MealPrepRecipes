import Link from "next/link";
import { BrandLogo } from "@/components/brand/logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <BrandLogo size="lg" />
          </Link>
          <p className="text-sm text-muted-foreground">Finally, an answer.</p>
        </div>

        {/* Auth Form */}
        {children}

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground">
          Made with love (and mild guilt)
        </p>
      </div>
    </div>
  );
}
