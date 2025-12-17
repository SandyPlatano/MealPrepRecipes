"use client"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { differenceInCalendarDays } from "date-fns"
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
 * Enhanced calendar component with year-view navigation.
 * Click the month label to switch to year selection view.
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
      className={cn("p-4", className)}
      classNames={{
        months: "relative flex flex-col sm:flex-row gap-4",
        month: "space-y-4 w-full",
        month_caption: "relative mx-10 flex h-9 items-center justify-center",
        caption_label: "truncate text-sm font-semibold",
        nav: "flex items-center justify-between absolute inset-x-0",
        button_previous: cn(
          buttonVariants({ variant: "outline" }),
          "absolute left-1 h-9 w-9 bg-transparent p-0 opacity-80 hover:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-900/30 text-coral-500 hover:text-coral-600 border-coral-200 hover:border-coral-400"
        ),
        button_next: cn(
          buttonVariants({ variant: "outline" }),
          "absolute right-1 h-9 w-9 bg-transparent p-0 opacity-80 hover:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-900/30 text-coral-500 hover:text-coral-600 border-coral-200 hover:border-coral-400"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex",
        weekday: "text-muted-foreground w-10 font-medium text-xs uppercase text-center",
        week: "flex w-full mt-2",
        day: "relative h-10 w-10 p-0 text-center text-sm focus-within:relative focus-within:z-20",
        day_button: cn(
          buttonVariants({ variant: "ghost" }),
          "h-10 w-10 p-0 font-normal rounded-lg hover:bg-coral-50 dark:hover:bg-coral-900/30 hover:text-coral-600 aria-selected:opacity-100"
        ),
        range_start: "day-range-start bg-coral-100 dark:bg-coral-900/40 rounded-l-lg",
        range_end: "day-range-end bg-coral-100 dark:bg-coral-900/40 rounded-r-lg",
        range_middle: "bg-coral-50 dark:bg-coral-900/20 rounded-none",
        selected: "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90 [&>button]:shadow-sm",
        today: "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold",
        outside: "text-muted-foreground opacity-50 aria-selected:bg-coral-50/50 aria-selected:opacity-40",
        disabled: "text-muted-foreground opacity-50",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
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
        variant="outline"
        className="absolute left-1 h-9 w-9 bg-transparent p-0 opacity-80 hover:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-900/30 text-coral-500 hover:text-coral-600 border-coral-200 hover:border-coral-400"
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
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        className="absolute right-1 h-9 w-9 bg-transparent p-0 opacity-80 hover:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-900/30 text-coral-500 hover:text-coral-600 border-coral-200 hover:border-coral-400"
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
        <ChevronRight className="h-4 w-4" />
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
      className="h-9 w-full truncate text-sm font-semibold hover:bg-coral-50 dark:hover:bg-coral-900/30 hover:text-coral-600"
      variant="ghost"
      size="sm"
      onClick={() => setNavView((prev) => (prev === "days" ? "years" : "days"))}
    >
      {navView === "days"
        ? children
        : displayYears.from + " - " + displayYears.to}
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
    <div className={cn("grid grid-cols-4 gap-2 p-2 mt-4", className)}>
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

          return (
            <Button
              key={year}
              className={cn(
                "h-10 w-full text-sm font-normal hover:bg-coral-50 dark:hover:bg-coral-900/30 hover:text-coral-600",
                isCurrentYear && "bg-accent font-semibold text-accent-foreground"
              )}
              variant="ghost"
              onClick={() => {
                setNavView("days")
                goToMonth(
                  new Date(
                    year,
                    (selected as Date | undefined)?.getMonth() ?? 0
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
