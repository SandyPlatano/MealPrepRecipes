"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { differenceInCalendarDays, format } from "date-fns"
import { ChevronLeft, ChevronRight } from "lucide-react"
import * as React from "react"
import {
  DayPicker,
  labelNext,
  labelPrevious,
  useDayPicker,
  type DayPickerProps,
} from "react-day-picker"

export type CalendarProps = DayPickerProps & {
  /**
   * In the year view, the number of years to display at once.
   * @default 12
   */
  yearRange?: number

  /**
   * Whether to show the year switcher in the caption.
   * @default true
   */
  showYearSwitcher?: boolean
}

type NavView = "days" | "years"

/**
 * Enhanced calendar component with beautiful coral-branded design.
 * Features: year-view navigation, large touch targets, smooth transitions.
 */
function Calendar({
  className,
  showOutsideDays = true,
  showYearSwitcher = true,
  yearRange = 12,
  numberOfMonths,
  components,
  ...props
}: CalendarProps) {
  const [navView, setNavView] = React.useState<NavView>("days")
  const [displayYears, setDisplayYears] = React.useState<{
    from: number
    to: number
  }>(() => {
    const currentYear = new Date().getFullYear()
    return {
      from: currentYear - Math.floor(yearRange / 2 - 1),
      to: currentYear + Math.ceil(yearRange / 2),
    }
  })

  const { onNextClick, onPrevClick, startMonth, endMonth } = props
  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        // Container structure
        months: "relative flex flex-col gap-4",
        month: "flex flex-col gap-4 w-full",

        // Header with month/year and navigation
        month_caption: "relative flex h-12 items-center justify-center px-12",
        caption_label: "text-base font-semibold tracking-tight",
        nav: "flex items-center justify-between absolute inset-x-0",

        // Navigation buttons - coral branded with smooth transitions
        button_previous: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute left-0 size-10 rounded-full p-0",
          "text-coral-500 hover:text-coral-600 hover:bg-coral-100 dark:hover:bg-coral-900/40",
          "transition-all duration-200 ease-out",
          "disabled:opacity-40 disabled:pointer-events-none"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-0 size-10 rounded-full p-0",
          "text-coral-500 hover:text-coral-600 hover:bg-coral-100 dark:hover:bg-coral-900/40",
          "transition-all duration-200 ease-out",
          "disabled:opacity-40 disabled:pointer-events-none"
        ),

        // Calendar grid
        month_grid: "w-full border-collapse mt-2",
        weekdays: "flex justify-around mb-1",
        weekday: cn(
          "w-11 h-8 flex items-center justify-center",
          "text-xs font-medium text-muted-foreground/70 uppercase tracking-wider"
        ),
        week: "flex justify-around mt-1",

        // Day cells - larger 44px touch targets with smooth transitions
        day: cn(
          "relative size-11 p-0 text-center",
          "focus-within:relative focus-within:z-20"
        ),
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "size-11 p-0 font-normal rounded-xl",
          "transition-all duration-200 ease-out",
          "hover:bg-coral-100 dark:hover:bg-coral-900/30 hover:text-coral-700 dark:hover:text-coral-300",
          "focus-visible:ring-2 focus-visible:ring-coral-500 focus-visible:ring-offset-0",
          "aria-selected:opacity-100"
        ),

        // Range selection states
        range_start: "day-range-start rounded-l-xl bg-coral-100/50 dark:bg-coral-900/30",
        range_end: "day-range-end rounded-r-xl bg-coral-100/50 dark:bg-coral-900/30",
        range_middle: "bg-coral-50 dark:bg-coral-900/20 rounded-none",

        // Selected day - prominent coral with shadow
        selected: cn(
          "[&>button]:bg-coral-500 [&>button]:text-white [&>button]:font-semibold",
          "[&>button]:hover:bg-coral-600 [&>button]:shadow-md [&>button]:shadow-coral-500/25",
          "dark:[&>button]:bg-coral-500 dark:[&>button]:hover:bg-coral-400"
        ),

        // Today indicator - subtle sage accent ring
        today: cn(
          "[&>button]:ring-2 [&>button]:ring-sage-400 dark:[&>button]:ring-sage-500",
          "[&>button]:ring-offset-0",
          "[&>button]:font-semibold [&>button]:text-sage-700 dark:[&>button]:text-sage-300"
        ),

        // Outside month days - subtle and dimmed
        outside: cn(
          "text-muted-foreground/40",
          "[&>button]:text-muted-foreground/40",
          "aria-selected:bg-coral-50/30 dark:aria-selected:bg-coral-900/10"
        ),

        // Disabled and hidden states
        disabled: "text-muted-foreground/30 [&>button]:text-muted-foreground/30",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="size-5" strokeWidth={2.5} />
        },
        Nav: ({ className: navClassName }) => (
          <Nav
            className={navClassName}
            displayYears={displayYears}
            navView={navView}
            setDisplayYears={setDisplayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
          />
        ),
        CaptionLabel: (captionProps) => (
          <CaptionLabel
            showYearSwitcher={showYearSwitcher}
            navView={navView}
            setNavView={setNavView}
            displayYears={displayYears}
            {...captionProps}
          />
        ),
        MonthGrid: ({ className: gridClassName, children, ...gridProps }) => (
          <MonthGrid
            className={gridClassName}
            displayYears={displayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            navView={navView}
            setNavView={setNavView}
            {...gridProps}
          >
            {children}
          </MonthGrid>
        ),
        ...components,
      }}
      numberOfMonths={columnsDisplayed}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

function Nav({
  className,
  navView,
  startMonth,
  endMonth,
  displayYears,
  setDisplayYears,
  onPrevClick,
  onNextClick,
}: {
  className?: string
  navView: NavView
  startMonth?: Date
  endMonth?: Date
  displayYears: { from: number; to: number }
  setDisplayYears: React.Dispatch<
    React.SetStateAction<{ from: number; to: number }>
  >
  onPrevClick?: (date: Date) => void
  onNextClick?: (date: Date) => void
}) {
  const { nextMonth, previousMonth, goToMonth } = useDayPicker()

  const isPreviousDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          differenceInCalendarDays(
            new Date(displayYears.from - 1, 0, 1),
            startMonth
          ) < 0) ||
        (endMonth &&
          differenceInCalendarDays(
            new Date(displayYears.from - 1, 0, 1),
            endMonth
          ) > 0)
      )
    }
    return !previousMonth
  })()

  const isNextDisabled = (() => {
    if (navView === "years") {
      return (
        (startMonth &&
          differenceInCalendarDays(
            new Date(displayYears.to + 1, 0, 1),
            startMonth
          ) < 0) ||
        (endMonth &&
          differenceInCalendarDays(
            new Date(displayYears.to + 1, 0, 1),
            endMonth
          ) > 0)
      )
    }
    return !nextMonth
  })()

  const handlePreviousClick = React.useCallback(() => {
    if (!previousMonth) return
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from - (prev.to - prev.from + 1),
        to: prev.to - (prev.to - prev.from + 1),
      }))
      onPrevClick?.(
        new Date(
          displayYears.from - (displayYears.to - displayYears.from),
          0,
          1
        )
      )
      return
    }
    goToMonth(previousMonth)
    onPrevClick?.(previousMonth)
  }, [previousMonth, goToMonth, navView, displayYears, setDisplayYears, onPrevClick])

  const handleNextClick = React.useCallback(() => {
    if (!nextMonth) return
    if (navView === "years") {
      setDisplayYears((prev) => ({
        from: prev.from + (prev.to - prev.from + 1),
        to: prev.to + (prev.to - prev.from + 1),
      }))
      onNextClick?.(
        new Date(
          displayYears.from + (displayYears.to - displayYears.from),
          0,
          1
        )
      )
      return
    }
    goToMonth(nextMonth)
    onNextClick?.(nextMonth)
  }, [goToMonth, nextMonth, navView, displayYears, setDisplayYears, onNextClick])

  return (
    <nav className={cn("flex items-center", className)}>
      <Button
        variant="ghost"
        className={cn(
          "absolute left-0 size-10 rounded-full p-0",
          "text-coral-500 hover:text-coral-600 hover:bg-coral-100 dark:hover:bg-coral-900/40",
          "transition-all duration-200 ease-out"
        )}
        type="button"
        tabIndex={isPreviousDisabled ? undefined : -1}
        disabled={isPreviousDisabled}
        aria-label={
          navView === "years"
            ? `Go to the previous ${displayYears.to - displayYears.from + 1} years`
            : labelPrevious(previousMonth)
        }
        onClick={handlePreviousClick}
      >
        <ChevronLeft className="size-5" strokeWidth={2.5} />
      </Button>

      <Button
        variant="ghost"
        className={cn(
          "absolute right-0 size-10 rounded-full p-0",
          "text-coral-500 hover:text-coral-600 hover:bg-coral-100 dark:hover:bg-coral-900/40",
          "transition-all duration-200 ease-out"
        )}
        type="button"
        tabIndex={isNextDisabled ? undefined : -1}
        disabled={isNextDisabled}
        aria-label={
          navView === "years"
            ? `Go to the next ${displayYears.to - displayYears.from + 1} years`
            : labelNext(nextMonth)
        }
        onClick={handleNextClick}
      >
        <ChevronRight className="size-5" strokeWidth={2.5} />
      </Button>
    </nav>
  )
}

function CaptionLabel({
  children,
  showYearSwitcher,
  navView,
  setNavView,
  displayYears,
  ...props
}: {
  showYearSwitcher?: boolean
  navView: NavView
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
  displayYears: { from: number; to: number }
} & React.HTMLAttributes<HTMLSpanElement>) {
  if (!showYearSwitcher) return <span {...props}>{children}</span>

  return (
    <Button
      className={cn(
        "h-10 px-4 text-base font-semibold tracking-tight rounded-lg",
        "hover:bg-coral-100 dark:hover:bg-coral-900/30",
        "hover:text-coral-700 dark:hover:text-coral-300",
        "transition-all duration-200 ease-out",
        "focus-visible:ring-2 focus-visible:ring-coral-500"
      )}
      variant="ghost"
      onClick={() => setNavView((prev) => (prev === "days" ? "years" : "days"))}
    >
      {navView === "days" ? (
        children
      ) : (
        <span className="tabular-nums">
          {displayYears.from} — {displayYears.to}
        </span>
      )}
    </Button>
  )
}

function MonthGrid({
  className,
  children,
  displayYears,
  startMonth,
  endMonth,
  navView,
  setNavView,
  ...props
}: {
  className?: string
  children: React.ReactNode
  displayYears: { from: number; to: number }
  startMonth?: Date
  endMonth?: Date
  navView: NavView
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
} & React.TableHTMLAttributes<HTMLTableElement>) {
  if (navView === "years") {
    return (
      <YearGrid
        displayYears={displayYears}
        startMonth={startMonth}
        endMonth={endMonth}
        setNavView={setNavView}
        navView={navView}
        className={className}
      />
    )
  }
  return (
    <table className={className} {...props}>
      {children}
    </table>
  )
}

function YearGrid({
  className,
  displayYears,
  startMonth,
  endMonth,
  setNavView,
  navView,
}: {
  className?: string
  displayYears: { from: number; to: number }
  startMonth?: Date
  endMonth?: Date
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
  navView: NavView
}) {
  const { goToMonth, selected } = useDayPicker()

  return (
    <div
      className={cn(
        "grid grid-cols-3 gap-2 p-2 mt-4",
        "animate-in fade-in-50 zoom-in-95 duration-200",
        className
      )}
    >
      {Array.from(
        { length: displayYears.to - displayYears.from + 1 },
        (_, i) => {
          const year = displayYears.from + i
          const isBefore =
            startMonth &&
            differenceInCalendarDays(new Date(year, 11, 31), startMonth) < 0

          const isAfter =
            endMonth &&
            differenceInCalendarDays(new Date(year, 0, 0), endMonth) > 0

          const isDisabled = isBefore || isAfter
          const isCurrentYear = year === new Date().getFullYear()
          const isSelectedYear = (selected as Date | undefined)?.getFullYear() === year

          return (
            <Button
              key={year}
              className={cn(
                "h-12 w-full text-sm font-medium rounded-xl",
                "transition-all duration-200 ease-out",
                "hover:bg-coral-100 dark:hover:bg-coral-900/30",
                "hover:text-coral-700 dark:hover:text-coral-300",
                // Current year - sage accent
                isCurrentYear && !isSelectedYear && cn(
                  "ring-2 ring-sage-400 dark:ring-sage-500",
                  "text-sage-700 dark:text-sage-300 font-semibold"
                ),
                // Selected year - coral background
                isSelectedYear && cn(
                  "bg-coral-500 text-white font-semibold",
                  "hover:bg-coral-600 shadow-md shadow-coral-500/25"
                )
              )}
              variant="ghost"
              onClick={() => {
                setNavView("days")
                goToMonth(
                  new Date(
                    year,
                    (selected as Date | undefined)?.getMonth() ?? new Date().getMonth()
                  )
                )
              }}
              disabled={navView === "years" ? isDisabled : undefined}
            >
              {year}
            </Button>
          )
        }
      )}
    </div>
  )
}

export { Calendar }
