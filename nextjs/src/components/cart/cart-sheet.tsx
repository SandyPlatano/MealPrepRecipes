"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { X, Trash2, ShoppingCart, Download, Mail, Loader2, Calendar as CalendarIcon, ChefHat } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { useCart } from "./cart-context";
import { DAYS_OF_WEEK, type DayOfWeek, formatWeekRange, getWeekStart } from "@/types/meal-plan";
import { getAssignedItems } from "@/types/cart";
import { toast } from "sonner";
import { format } from "date-fns";
import { downloadShoppingListAsMarkdown } from "@/lib/export";

interface CartSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartSheet({ open, onOpenChange }: CartSheetProps) {
  const {
    items,
    weekStart,
    removeFromCart,
    updateCartItem,
    clearCart,
    setWeekStart,
  } = useCart();

  const [cookNames, setCookNames] = useState<string[]>(["Me", "Partner"]);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isCreatingCalendarEvents, setIsCreatingCalendarEvents] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Load cook names from settings (localStorage for now)
  useEffect(() => {
    const stored = localStorage.getItem("user-settings");
    if (stored) {
      try {
        const settings = JSON.parse(stored);
        if (settings.cook_names && settings.cook_names.length > 0) {
          setCookNames(settings.cook_names);
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
    }
  }, [open]);

  const assignedItems = getAssignedItems(items);
  const weekRangeStr = formatWeekRange(weekStart);

  // Generate dates for each day of the week
  const dayDates: Record<DayOfWeek, string> = {} as Record<DayOfWeek, string>;
  DAYS_OF_WEEK.forEach((day, index) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + index);
    dayDates[day] = format(date, "MMM d");
  });

  const getDayLabel = (day: DayOfWeek) => {
    return `${day}, ${dayDates[day]}`;
  };

  // Get all ingredients from assigned recipes
  const allIngredients = useMemo(() => {
    const ingredientSet = new Set<string>();
    assignedItems.forEach((item) => {
      if (item.recipe && item.recipe.ingredients) {
        item.recipe.ingredients.forEach((ing) => ingredientSet.add(ing));
      }
    });
    return Array.from(ingredientSet);
  }, [assignedItems]);

  const handleClearCart = () => {
    clearCart();
    toast.success("Starting fresh");
  };

  const handleWeekChange = (direction: "prev" | "next") => {
    const newDate = new Date(weekStart);
    newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
    setWeekStart(newDate);
  };

  const handleThisWeek = () => {
    const monday = getWeekStart(new Date());
    setWeekStart(monday);
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const monday = getWeekStart(date);
      setWeekStart(monday);
      setCalendarOpen(false);
    }
  };

  const handleDownloadShoppingList = () => {
    if (assignedItems.length === 0) {
      toast.error("No assigned meals to download");
      return;
    }

    // Collect all ingredients from assigned recipes
    const allIngredients = assignedItems.flatMap((item) =>
      (item.recipe.ingredients || []).map((ing) => ({
        ingredient: ing,
        recipe_title: item.recipe.title,
        day: item.day,
        cook: item.cook,
      }))
    );

    downloadShoppingListAsMarkdown({
      weekRange: weekRangeStr,
      items: allIngredients,
    });

    toast.success("Shopping list downloaded!");
  };

  const handleEmailShoppingList = async () => {
    if (assignedItems.length === 0) {
      toast.error("Assign everyone first. No free rides.");
      return;
    }

    setIsSendingEmail(true);
    const loadingToast = toast.loading("Sending your meal plan...");

    try {
      const response = await fetch("/api/send-shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: weekRangeStr,
          weekStart: weekStart.toISOString().split("T")[0],
          items: assignedItems.map((item) => ({
            recipe: item.recipe,
            cook: item.cook,
            day: item.day,
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.dismiss(loadingToast);
        toast.error(result.error || "Failed to send email");
        return;
      }

      toast.dismiss(loadingToast);
      toast.success(result.message || "Boom. Plan sent!");
    } catch (error) {
      console.error("Error sending email:", error);
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "Something went wrong sending the plan");
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleCreateCalendarEvents = async () => {
    if (assignedItems.length === 0) {
      toast.error("Assign everyone first. No free rides.");
      return;
    }

    setIsCreatingCalendarEvents(true);
    const loadingToast = toast.loading("Creating calendar events...");

    try {
      const response = await fetch("/api/google-calendar/create-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekRange: weekRangeStr,
          items: assignedItems.map((item) => ({
            recipe: item.recipe,
            cook: item.cook,
            day: item.day,
          })),
          userTimeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.dismiss(loadingToast);
        toast.error(result.error || "Failed to create calendar events");
        return;
      }

      toast.dismiss(loadingToast);

      if (result.eventsCreated > 0) {
        toast.success(`Created ${result.eventsCreated} calendar event${result.eventsCreated > 1 ? 's' : ''}!`);
      } else {
        toast.info("No calendar events were created. Make sure Google Calendar is connected in Settings.");
      }
    } catch (error) {
      console.error("Error creating calendar events:", error);
      toast.dismiss(loadingToast);
      toast.error(error instanceof Error ? error.message : "Something went wrong creating calendar events");
    } finally {
      setIsCreatingCalendarEvents(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="font-mono">This Week&apos;s Plan</SheetTitle>
          <SheetDescription>
            Assign meals, generate the shopping list, and finally have an answer when babe asks.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Week Selector */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange("prev")}
                >
                  ← Previous
                </Button>
                <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex-1 justify-center font-medium"
                    >
                      <CalendarIcon className="h-4 w-4 mr-2" />
                      {weekRangeStr}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center">
                    <Calendar
                      mode="single"
                      selected={weekStart}
                      onSelect={handleDateSelect}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWeekChange("next")}
                >
                  Next →
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleThisWeek}
                >
                  This Week
                </Button>
              </div>
            </CardContent>
          </Card>

          {items.length === 0 ? (
            <div className="flex items-center justify-center text-center text-muted-foreground p-8">
              <div>
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recipes in your plan yet.</p>
                <p className="text-sm mt-1">
                  Browse recipes and click &quot;Add to Plan&quot; to get started.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Meal Assignment Table */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Who&apos;s Making What</CardTitle>
                      <CardDescription>
                        Assign each meal to a cook and day. No ambiguity. No excuses.
                      </CardDescription>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {assignedItems.length}/{items.length} assigned
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
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
                        {items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">
                              <div>
                                <p className="truncate max-w-[200px]">{item.recipe.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {item.recipe.recipe_type}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={item.cook || "unassigned"}
                                onValueChange={(value) =>
                                  updateCartItem(item.id, {
                                    cook: value === "unassigned" ? null : value,
                                  })
                                }
                              >
                                <SelectTrigger className="w-[120px]">
                                  <ChefHat className="h-3 w-3 mr-1 flex-shrink-0" />
                                  <SelectValue placeholder="Select cook" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">No cook</SelectItem>
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
                                value={item.day || "unassigned"}
                                onValueChange={(value) =>
                                  updateCartItem(item.id, {
                                    day: value === "unassigned" ? null : (value as DayOfWeek),
                                  })
                                }
                              >
                                <SelectTrigger className="w-[160px]">
                                  <SelectValue placeholder="Select day" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="unassigned">No day</SelectItem>
                                  {DAYS_OF_WEEK.map((day) => (
                                    <SelectItem key={day} value={day}>
                                      {getDayLabel(day)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeFromCart(item.id)}
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Shopping List Preview */}
              {allIngredients.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Shopping List Preview</CardTitle>
                    <CardDescription>
                      {allIngredients.length} items from {assignedItems.length} assigned recipes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-[200px]">
                      <ul className="space-y-1 text-sm">
                        {allIngredients.slice(0, 20).map((ing, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />
                            {ing}
                          </li>
                        ))}
                        {allIngredients.length > 20 && (
                          <li className="text-muted-foreground italic">
                            ...and {allIngredients.length - 20} more items
                          </li>
                        )}
                      </ul>
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}

              {/* Actions */}
              <TooltipProvider>
                <div className="flex flex-col gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        className="w-full"
                        disabled={assignedItems.length === 0 || isSendingEmail}
                        onClick={handleEmailShoppingList}
                      >
                        {isSendingEmail ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Mail className="mr-2 h-4 w-4" />
                            Send the Plan
                          </>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Email the meal plan and shopping list to yourself</TooltipContent>
                  </Tooltip>

                  <div className="grid grid-cols-2 gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={assignedItems.length === 0}
                          onClick={handleDownloadShoppingList}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download List
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Download shopping list as markdown file</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          disabled={assignedItems.length === 0 || isCreatingCalendarEvents}
                          onClick={handleCreateCalendarEvents}
                        >
                          {isCreatingCalendarEvents ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating...
                            </>
                          ) : (
                            <>
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              Add to Calendar
                            </>
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Create Google Calendar events for your meal plan</TooltipContent>
                    </Tooltip>
                  </div>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-400 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300 dark:hover:border-orange-500"
                        onClick={handleClearCart}
                        disabled={items.length === 0}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Start Over
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Clear all meals from this week&apos;s plan</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
