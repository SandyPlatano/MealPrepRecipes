"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner } from "sonner";
import { useEffect, useState } from "react";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Determine the actual theme to use
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get the resolved theme (handles system theme)
  // Default to "dark" during SSR and before theme is loaded to match defaultTheme
  let resolvedTheme: "light" | "dark" = "dark";
  
  if (mounted && theme) {
    if (theme === "system") {
      resolvedTheme = (systemTheme || "dark") as "light" | "dark";
    } else if (theme === "light" || theme === "dark") {
      resolvedTheme = theme;
    }
  }

  return (
    <Sonner
      theme={resolvedTheme}
      className="toaster group"
      expand={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-gray-300 dark:group-[.toaster]:border-gray-600 group-[.toaster]:shadow-md group-[.toaster]:rounded-xl group-[.toaster]:text-sm",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-[#D9F99D] group-[.toast]:text-[#1A1A1A] group-[.toast]:border group-[.toast]:border-[#D9F99D] group-[.toast]:rounded-full group-[.toast]:hover:bg-[#D9F99D]/90",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:rounded-full",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
