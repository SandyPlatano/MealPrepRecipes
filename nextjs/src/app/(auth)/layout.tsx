import Link from "next/link";
import { PixelBrandLogo } from "@/components/landing/pixel-art";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Logo/Brand */}
        <div className="text-center flex flex-col gap-2">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <PixelBrandLogo size="lg" />
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
