import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Calendar } from './ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { format, startOfWeek, addWeeks, subWeeks, isSameWeek } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '../lib/utils';

export default function WeekSelector({ selectedWeek, onWeekChange }) {
  const [open, setOpen] = useState(false);

  // Get Monday of the selected week
  const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  const sunday = new Date(monday);
  sunday.setDate(sunday.getDate() + 6);

  const handlePreviousWeek = () => {
    const prevWeek = subWeeks(monday, 1);
    onWeekChange(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = addWeeks(monday, 1);
    onWeekChange(nextWeek);
  };

  const handleToday = () => {
    onWeekChange(new Date());
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="outline" onClick={handlePreviousWeek}>
        ← Previous
      </Button>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[280px] justify-start text-left font-normal",
              !selectedWeek && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(monday, "MMM d")} - {format(sunday, "MMM d, yyyy")}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={monday}
            onSelect={(date) => {
              if (date) {
                onWeekChange(date);
                setOpen(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Button variant="outline" onClick={handleNextWeek}>
        Next →
      </Button>
      
      <Button variant="ghost" onClick={handleToday} className="ml-auto">
        This Week
      </Button>
    </div>
  );
}

