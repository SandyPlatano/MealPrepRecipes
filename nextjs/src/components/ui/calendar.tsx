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

  monthsClassName?: string
  monthCaptionClassName?: string
  weekdaysClassName?: string
  weekdayClassName?: string
  monthClassName?: string
  captionClassName?: string
  captionLabelClassName?: string
  buttonNextClassName?: string
  buttonPreviousClassName?: string
  navClassName?: string
  monthGridClassName?: string
  weekClassName?: string
  dayClassName?: string
  dayButtonClassName?: string
  rangeStartClassName?: string
  rangeEndClassName?: string
  selectedClassName?: string
  todayClassName?: string
  outsideClassName?: string
  disabledClassName?: string
  rangeMiddleClassName?: string
  hiddenClassName?: string
}

type NavView = "days" | "years"

/**
 * Enhanced calendar component with year-view navigation.
 * Click the month label to switch to year selection view.
 *
 * @param props The props for the calendar.
 * @default yearRange 12
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
  }>(
    React.useMemo(() => {
      const currentYear = new Date().getFullYear()
      return {
        from: currentYear - Math.floor(yearRange / 2 - 1),
        to: currentYear + Math.ceil(yearRange / 2),
      }
    }, [yearRange])
  )

  const { onNextClick, onPrevClick, startMonth, endMonth } = props

  const columnsDisplayed = navView === "years" ? 1 : numberOfMonths

  // Enhanced sizing: 3.5rem cells for better touch targets
  const cellSize = "3.5rem"

  const _monthsClassName = cn("relative flex", props.monthsClassName)
  const _monthCaptionClassName = cn(
    "relative mx-10 flex h-8 items-center justify-center",
    props.monthCaptionClassName
  )
  const _weekdaysClassName = cn("flex flex-row", props.weekdaysClassName)
  const _weekdayClassName = cn(
    `w-[${cellSize}] text-sm font-medium text-muted-foreground uppercase`,
    props.weekdayClassName
  )
  const _monthClassName = cn("w-full", props.monthClassName)
  const _captionClassName = cn(
    "relative flex items-center justify-center pt-1",
    props.captionClassName
  )
  const _captionLabelClassName = cn(
    "truncate text-sm font-semibold",
    props.captionLabelClassName
  )
  const buttonNavClassName = buttonVariants({
    variant: "outline",
    className:
      "absolute h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-950/30 text-coral-500 hover:text-coral-600 border-coral-200 hover:border-coral-400 transition-all",
  })
  const _buttonNextClassName = cn(
    buttonNavClassName,
    "right-0",
    props.buttonNextClassName
  )
  const _buttonPreviousClassName = cn(
    buttonNavClassName,
    "left-0",
    props.buttonPreviousClassName
  )
  const _navClassName = cn("flex items-start", props.navClassName)
  const _monthGridClassName = cn("mx-auto mt-4", props.monthGridClassName)
  const _weekClassName = cn("mt-2 flex w-max items-start", props.weekClassName)
  const _dayClassName = cn(
    `flex size-[${cellSize}] flex-1 items-center justify-center p-0 text-sm`,
    props.dayClassName
  )
  const _dayButtonClassName = cn(
    buttonVariants({ variant: "ghost" }),
    `size-[${cellSize}] rounded-lg p-0 font-normal transition-colors aria-selected:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-950/30 hover:text-coral-600`,
    props.dayButtonClassName
  )
  // Range styling with coral accent
  const buttonRangeClassName =
    "bg-coral-100 dark:bg-coral-950/40 [&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary [&>button]:hover:text-primary-foreground"
  const _rangeStartClassName = cn(
    buttonRangeClassName,
    "day-range-start rounded-s-lg",
    props.rangeStartClassName
  )
  const _rangeEndClassName = cn(
    buttonRangeClassName,
    "day-range-end rounded-e-lg",
    props.rangeEndClassName
  )
  const _rangeMiddleClassName = cn(
    "bg-coral-50 dark:bg-coral-950/20 !text-foreground [&>button]:bg-transparent [&>button]:!text-foreground [&>button]:hover:bg-coral-100 dark:[&>button]:hover:bg-coral-950/40",
    props.rangeMiddleClassName
  )
  // Selected date: coral primary
  const _selectedClassName = cn(
    "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:hover:bg-primary/90 [&>button]:hover:text-primary-foreground [&>button]:shadow-sm",
    props.selectedClassName
  )
  // Today: sage green accent
  const _todayClassName = cn(
    "[&>button]:bg-accent [&>button]:text-accent-foreground [&>button]:font-semibold",
    props.todayClassName
  )
  const _outsideClassName = cn(
    "day-outside text-muted-foreground opacity-40 aria-selected:bg-coral-50/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
    props.outsideClassName
  )
  const _disabledClassName = cn(
    "text-muted-foreground opacity-40 cursor-not-allowed",
    props.disabledClassName
  )
  const _hiddenClassName = cn("invisible flex-1", props.hiddenClassName)

  // Calculate width based on cell size
  const calendarWidth = navView === "years" ? 280 : 280 * (columnsDisplayed ?? 1)

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      style={{
        width: calendarWidth + "px",
      }}
      classNames={{
        months: _monthsClassName,
        month_caption: _monthCaptionClassName,
        weekdays: _weekdaysClassName,
        weekday: _weekdayClassName,
        month: _monthClassName,
        caption: _captionClassName,
        caption_label: _captionLabelClassName,
        button_next: _buttonNextClassName,
        button_previous: _buttonPreviousClassName,
        nav: _navClassName,
        month_grid: _monthGridClassName,
        week: _weekClassName,
        day: _dayClassName,
        day_button: _dayButtonClassName,
        range_start: _rangeStartClassName,
        range_middle: _rangeMiddleClassName,
        range_end: _rangeEndClassName,
        selected: _selectedClassName,
        today: _todayClassName,
        outside: _outsideClassName,
        disabled: _disabledClassName,
        hidden: _hiddenClassName,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight
          return <Icon className="h-4 w-4" />
        },
        Nav: ({ className }) => (
          <Nav
            className={className}
            displayYears={displayYears}
            navView={navView}
            setDisplayYears={setDisplayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            onPrevClick={onPrevClick}
            onNextClick={onNextClick}
          />
        ),
        CaptionLabel: (props) => (
          <CaptionLabel
            showYearSwitcher={showYearSwitcher}
            navView={navView}
            setNavView={setNavView}
            displayYears={displayYears}
            {...props}
          />
        ),
        MonthGrid: ({ className, children, ...props }) => (
          <MonthGrid
            className={className}
            displayYears={displayYears}
            startMonth={startMonth}
            endMonth={endMonth}
            navView={navView}
            setNavView={setNavView}
            {...props}
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
        className="absolute left-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-950/30 text-coral-500 hover:text-coral-600 border-coral-200 hover:border-coral-400 transition-all"
        type="button"
        tabIndex={isPreviousDisabled ? undefined : -1}
        disabled={isPreviousDisabled}
        aria-label={
          navView === "years"
            ? `Go to the previous ${
                displayYears.to - displayYears.from + 1
              } years`
            : labelPrevious(previousMonth)
        }
        onClick={handlePreviousClick}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        className="absolute right-0 h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 hover:bg-coral-50 dark:hover:bg-coral-950/30 text-coral-500 hover:text-coral-600 border-coral-200 hover:border-coral-400 transition-all"
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
      className="h-8 w-full truncate text-sm font-semibold hover:bg-coral-50 dark:hover:bg-coral-950/30 hover:text-coral-600 transition-colors"
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
        {...props}
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
  ...props
}: {
  className?: string
  displayYears: { from: number; to: number }
  startMonth?: Date
  endMonth?: Date
  setNavView: React.Dispatch<React.SetStateAction<NavView>>
  navView: NavView
} & React.HTMLAttributes<HTMLDivElement>) {
  const { goToMonth, selected } = useDayPicker()

  return (
    <div className={cn("grid grid-cols-4 gap-2 p-2", className)} {...props}>
      {Array.from(
        { length: displayYears.to - displayYears.from + 1 },
        (_, i) => {
          const isBefore =
            startMonth &&
            differenceInCalendarDays(
              new Date(displayYears.from + i, 11, 31),
              startMonth
            ) < 0

          const isAfter =
            endMonth &&
            differenceInCalendarDays(
              new Date(displayYears.from + i, 0, 0),
              endMonth
            ) > 0

          const isDisabled = isBefore || isAfter
          const isCurrentYear = displayYears.from + i === new Date().getFullYear()

          return (
            <Button
              key={i}
              className={cn(
                "h-9 w-full text-sm font-normal text-foreground hover:bg-coral-50 dark:hover:bg-coral-950/30 hover:text-coral-600 transition-colors",
                isCurrentYear &&
                  "bg-accent font-semibold text-accent-foreground"
              )}
              variant="ghost"
              onClick={() => {
                setNavView("days")
                goToMonth(
                  new Date(
                    displayYears.from + i,
                    (selected as Date | undefined)?.getMonth() ?? 0
                  )
                )
              }}
              disabled={navView === "years" ? isDisabled : undefined}
            >
              {displayYears.from + i}
            </Button>
          )
        }
      )}
    </div>
  )
}

export { Calendar }
