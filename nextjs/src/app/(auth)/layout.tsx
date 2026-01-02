import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#FFFCF6]">
      <div className="w-full max-w-md flex flex-col gap-8">
        {/* Logo/Brand */}
        <div className="text-center flex flex-col gap-2">
          <Link href="/" className="inline-flex items-center justify-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 bg-[#D9F99D] rounded-xl flex items-center justify-center">
              <span className="text-[#1A1A1A] font-bold text-lg">B</span>
            </div>
            <span className="font-bold text-2xl text-[#1A1A1A]">
              babewfd<span className="text-[#D9F99D]">.</span>
            </span>
          </Link>
          <p className="text-sm text-gray-500">Finally, an answer.</p>
        </div>

        {/* Auth Form */}
        {children}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400">
          Made with love (and mild guilt)
        </p>
      </div>
    </div>
  );
}
