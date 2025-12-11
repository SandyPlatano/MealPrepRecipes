"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker } from "react-day-picker"
import "react-day-picker/style.css"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      style={{
        "--rdp-day-width": "2.5rem",
        "--rdp-day-height": "2.5rem",
        "--rdp-day_button-width": "2.5rem",
        "--rdp-day_button-height": "2.5rem",
      } as React.CSSProperties}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 relative items-center h-10 w-full",
        caption_label: "text-sm font-medium",
        nav: "flex items-center gap-1",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 absolute -left-2"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "h-9 w-9 bg-transparent p-0 opacity-50 hover:opacity-100 absolute -right-2"
        ),
        month_grid: "w-full border-collapse mt-4",
        weekdays: "",
        weekday:
          "text-muted-foreground rounded-md w-10 font-normal text-[0.8rem] text-center uppercase",
        week: "mt-2",
        day: "h-10 w-10 text-center text-sm p-0 relative [&:has([aria-selected].range_end)]:rounded-r-md [&:has([aria-selected].outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal aria-selected:opacity-100"
        ),
        range_end: "range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          if (orientation === "left") {
            return <ChevronLeft className="h-4 w-4" />;
          }
          return <ChevronRight className="h-4 w-4" />;
        },
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
