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
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:font-mono group-[.toaster]:rounded-md group-[.toaster]:text-sm",
          description:
            "group-[.toast]:text-muted-foreground group-[.toast]:font-mono group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-mono group-[.toast]:border-2 group-[.toast]:border-primary/60 group-[.toast]:rounded-md group-[.toast]:hover:bg-primary/95",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-mono group-[.toast]:rounded-md",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
