"use client";

import { useMemo, useCallback, ComponentType } from "react";
import { Calendar, momentLocalizer, Views, type CalendarProps, type Event } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import type { EventInteractionArgs } from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./meal-plan-calendar.css";
import {
  type WeekPlanData,
  type DayOfWeek,
  type MealAssignmentWithRecipe,
  DAYS_OF_WEEK,
} from "@/types/meal-plan";
import { cn } from "@/lib/utils";

// Initialize moment localizer
const localizer = momentLocalizer(moment);

// Type for our meal events
interface MealEvent extends Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  assignmentId: string;
  recipeId: string;
  recipeType: string;
  cook: string | null;
  cookColor: string | null;
  dayOfWeek: DayOfWeek;
}

// Create DnD calendar
const DnDCalendar = withDragAndDrop<MealEvent>(
  Calendar as ComponentType<CalendarProps<MealEvent>>
);

interface Recipe {
  id: string;
  title: string;
  recipe_type: string;
  category?: string | null;
  prep_time?: string | null;
  cook_time?: string | null;
  image_url?: string | null;
  tags?: string[];
}

interface MealPlanCalendarProps {
  weekStart: Date;
  weekPlan: WeekPlanData;
  recipes: Recipe[];
  cookNames: string[];
  cookColors: Record<string, string>;
  calendarExcludedDays?: string[];
  onMoveAssignment: (assignmentId: string, newDay: DayOfWeek) => void;
  onSelectEvent?: (assignment: MealAssignmentWithRecipe) => void;
  isPending?: boolean;
}

// Custom event component to show meal details
function MealEventComponent({ event }: { event: MealEvent }) {
  return (
    <div
      className="meal-event"
      style={{
        borderLeftColor: event.cookColor || undefined,
      }}
    >
      <div className="meal-event-title">{event.title}</div>
      {event.cook && (
        <div className="meal-event-cook">{event.cook}</div>
      )}
    </div>
  );
}

// Custom toolbar to simplify navigation
function CustomToolbar({
  label,
  onNavigate,
  onView,
  view
}: {
  label: string;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onView: (view: string) => void;
  view: string;
}) {
  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate("TODAY")}>
          Today
        </button>
        <button type="button" onClick={() => onNavigate("PREV")}>
          Back
        </button>
        <button type="button" onClick={() => onNavigate("NEXT")}>
          Next
        </button>
      </div>
      <span className="rbc-toolbar-label">{label}</span>
      <div className="rbc-btn-group">
        <button
          type="button"
          onClick={() => onView(Views.MONTH)}
          className={view === Views.MONTH ? "rbc-active" : ""}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => onView(Views.WEEK)}
          className={view === Views.WEEK ? "rbc-active" : ""}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => onView(Views.AGENDA)}
          className={view === Views.AGENDA ? "rbc-active" : ""}
        >
          Agenda
        </button>
      </div>
    </div>
  );
}

export function MealPlanCalendar({
  weekStart,
  weekPlan,
  cookColors,
  calendarExcludedDays = [],
  onMoveAssignment,
  onSelectEvent,
  isPending = false,
}: MealPlanCalendarProps) {
  // Convert meal assignments to calendar events
  const events = useMemo(() => {
    const mealEvents: MealEvent[] = [];

    DAYS_OF_WEEK.forEach((day, index) => {
      const assignments = weekPlan.assignments[day] || [];
      const dayDate = new Date(weekStart);
      dayDate.setDate(dayDate.getDate() + index);

      assignments.forEach((assignment) => {
        // Create event for this meal - all day event
        const eventStart = new Date(dayDate);
        eventStart.setHours(0, 0, 0, 0);

        const eventEnd = new Date(dayDate);
        eventEnd.setHours(23, 59, 59, 999);

        mealEvents.push({
          id: assignment.id,
          title: assignment.recipe.title,
          start: eventStart,
          end: eventEnd,
          allDay: true,
          assignmentId: assignment.id,
          recipeId: assignment.recipe.id,
          recipeType: assignment.recipe.recipe_type,
          cook: assignment.cook,
          cookColor: assignment.cook ? cookColors[assignment.cook] || null : null,
          dayOfWeek: day,
        });
      });
    });

    return mealEvents;
  }, [weekPlan, weekStart, cookColors]);

  // Find assignment from event
  const findAssignment = useCallback((eventId: string): MealAssignmentWithRecipe | null => {
    for (const day of DAYS_OF_WEEK) {
      const found = weekPlan.assignments[day]?.find(a => a.id === eventId);
      if (found) return found;
    }
    return null;
  }, [weekPlan]);

  // Handle event drop (drag and drop)
  const handleEventDrop = useCallback(({ event, start }: EventInteractionArgs<MealEvent>) => {
    const newDate = new Date(start);
    const dayIndex = (newDate.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const newDay = DAYS_OF_WEEK[dayIndex];

    if (newDay && event.dayOfWeek !== newDay) {
      onMoveAssignment(event.assignmentId, newDay);
    }
  }, [onMoveAssignment]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: MealEvent) => {
    if (onSelectEvent) {
      const assignment = findAssignment(event.assignmentId);
      if (assignment) {
        onSelectEvent(assignment);
      }
    }
  }, [findAssignment, onSelectEvent]);

  // Style events based on cook color
  const eventPropGetter = useCallback((event: MealEvent) => {
    const style: React.CSSProperties = {};
    if (event.cookColor) {
      style.borderLeftColor = event.cookColor;
    }
    return {
      style,
      className: cn(
        event.cookColor && "has-cook-color"
      ),
    };
  }, []);

  // Style day cells - highlight excluded days
  const dayPropGetter = useCallback((date: Date) => {
    const dayIndex = (date.getDay() + 6) % 7; // Convert Sunday=0 to Monday=0
    const day = DAYS_OF_WEEK[dayIndex];

    if (calendarExcludedDays.includes(day)) {
      return {
        className: "calendar-excluded-day",
        style: {
          backgroundColor: "hsl(var(--muted))",
          opacity: 0.7,
        },
      };
    }
    return {};
  }, [calendarExcludedDays]);

  // Format for week header
  const formats = useMemo(() => ({
    dayFormat: "ddd D",
    dayHeaderFormat: "dddd, MMMM D",
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      const startStr = moment(start).format("MMM D");
      const endStr = moment(end).format("MMM D");
      return `${startStr} - ${endStr}`;
    },
    agendaDateFormat: "ddd, MMM D",
    agendaHeaderFormat: ({ start, end }: { start: Date; end: Date }) => {
      const startStr = moment(start).format("MMM D");
      const endStr = moment(end).format("MMM D");
      return `${startStr} - ${endStr}`;
    },
  }), []);

  // Messages for empty states
  const messages = useMemo(() => ({
    noEventsInRange: "No meals planned for this period.",
    showMore: (total: number) => `+${total} more`,
  }), []);

  return (
    <div className={cn(
      "meal-plan-calendar-wrapper",
      isPending && "opacity-60 pointer-events-none"
    )}>
      <DnDCalendar
        localizer={localizer}
        events={events}
        defaultView={Views.WEEK}
        views={[Views.MONTH, Views.WEEK, Views.AGENDA]}
        defaultDate={weekStart}
        style={{ height: 600, width: "100%" }}
        className="rounded-lg overflow-hidden"
        selectable={false}
        resizable={false}
        draggableAccessor={() => true}
        eventPropGetter={eventPropGetter}
        dayPropGetter={dayPropGetter}
        onEventDrop={handleEventDrop}
        onSelectEvent={handleSelectEvent}
        components={{
          event: MealEventComponent,
          toolbar: CustomToolbar,
        }}
        formats={formats}
        messages={messages}
        popup
        showAllEvents
      />
    </div>
  );
}
