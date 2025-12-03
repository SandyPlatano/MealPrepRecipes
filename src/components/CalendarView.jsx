import { useMemo } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { format, startOfWeek, addDays } from 'date-fns';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CalendarView({ cartItems, selectedWeek }) {
  const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });

  const mealsByDay = useMemo(() => {
    const meals = {};
    DAYS_OF_WEEK.forEach((day, index) => {
      meals[day] = cartItems.filter(item => item.day === day);
    });
    return meals;
  }, [cartItems]);

  const getDayDate = (dayIndex) => {
    return addDays(monday, dayIndex);
  };

  return (
    <div className="grid grid-cols-7 gap-2">
      {DAYS_OF_WEEK.map((day, index) => {
        const date = getDayDate(index);
        const meals = mealsByDay[day] || [];

        return (
          <Card key={day} className="min-h-[200px]">
            <CardContent className="p-3">
              <div className="mb-2">
                <div className="text-sm font-semibold">{day}</div>
                <div className="text-xs text-muted-foreground">
                  {format(date, 'MMM d')}
                </div>
              </div>
              <div className="space-y-1">
                {meals.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No meals</p>
                ) : (
                  meals.map((item) => (
                    <div
                      key={item.recipeId}
                      className="p-2 bg-muted rounded text-xs"
                    >
                      <div className="font-medium truncate">{item.recipe.title}</div>
                      {item.cook && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          {item.cook}
                        </Badge>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

