import { Toaster as Sonner } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      theme="system"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-2 group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:font-mono group-[.toaster]:rounded-md group-[.toaster]:text-sm",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:font-mono group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:font-mono group-[.toast]:border-2 group-[.toast]:border-primary/60 group-[.toast]:rounded-md group-[.toast]:hover:bg-primary/95",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:font-mono group-[.toast]:rounded-md",
        },
      }}
      {...props} />
  );
}

export { Toaster }
