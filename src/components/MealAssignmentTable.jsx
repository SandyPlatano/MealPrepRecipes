import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Button } from './ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { X } from 'lucide-react';
import { format, startOfWeek, addDays } from 'date-fns';

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MealAssignmentTable({
  cartItems,
  selectedWeek,
  cookNames,
  onUpdateAssignment,
  onRemoveItem,
}) {
  const monday = startOfWeek(selectedWeek, { weekStartsOn: 1 });
  
  const getDayDate = (dayIndex) => {
    return addDays(monday, dayIndex);
  };

  const getDayLabel = (dayIndex) => {
    const date = getDayDate(dayIndex);
    return `${DAYS_OF_WEEK[dayIndex]}, ${format(date, 'MMM d')}`;
  };

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Recipe</TableHead>
            <TableHead>Cook</TableHead>
            <TableHead>Day</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cartItems.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                No recipes in cart. Add recipes from the Search tab.
              </TableCell>
            </TableRow>
          ) : (
            cartItems.map((item) => (
              <TableRow key={item.recipeId}>
                <TableCell className="font-medium">{item.recipe.title}</TableCell>
                <TableCell>
                  <Select
                    value={item.cook || ''}
                    onValueChange={(value) => onUpdateAssignment(item.recipeId, 'cook', value)}
                  >
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Select cook" />
                    </SelectTrigger>
                    <SelectContent>
                      {cookNames.map((name) => (
                        <SelectItem key={name} value={name}>
                          {name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Select
                    value={item.day || ''}
                    onValueChange={(value) => onUpdateAssignment(item.recipeId, 'day', value)}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {DAYS_OF_WEEK.map((day, index) => (
                        <SelectItem key={day} value={day}>
                          {getDayLabel(index)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveItem(item.recipeId)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

