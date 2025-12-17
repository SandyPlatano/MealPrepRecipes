"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChefHat, CalendarDays, X, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DAY_OF_WEEK_NAMES,
  DAY_OF_WEEK_SHORT,
  getScheduleDisplayName,
  type DayOfWeekIndex,
  type ScheduleMealType,
  type CookingScheduleWithUser,
  type CookingScheduleFormData,
  type HouseholdMemberWithProfile,
} from "@/types/household";
import {
  getCookingSchedules,
  upsertCookingSchedule,
  deleteCookingSchedule,
  getHouseholdMembers,
} from "@/app/actions/household";
import { useCookingScheduleRealtime } from "@/hooks/use-household-realtime";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ============================================================================
// Types
// ============================================================================

interface ScheduleCell {
  day: DayOfWeekIndex;
  mealType: ScheduleMealType;
  schedule: CookingScheduleWithUser | null;
}

interface AssignCookDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cell: ScheduleCell | null;
  members: HouseholdMemberWithProfile[];
  onAssign: (formData: CookingScheduleFormData) => Promise<void>;
  onClear: () => Promise<void>;
}

// ============================================================================
// Assign Cook Dialog
// ============================================================================

function AssignCookDialog({
  open,
  onOpenChange,
  cell,
  members,
  onAssign,
  onClear,
}: AssignCookDialogProps) {
  const [assignmentType, setAssignmentType] = useState<"member" | "custom">("member");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [customName, setCustomName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (cell?.schedule) {
      if (cell.schedule.assigned_user_id) {
        setAssignmentType("member");
        setSelectedMemberId(cell.schedule.assigned_user_id);
        setCustomName("");
      } else if (cell.schedule.assigned_cook_name) {
        setAssignmentType("custom");
        setCustomName(cell.schedule.assigned_cook_name);
        setSelectedMemberId("");
      }
    } else {
      setAssignmentType("member");
      setSelectedMemberId("");
      setCustomName("");
    }
  }, [cell]);

  const handleSubmit = async () => {
    if (!cell) return;

    setIsSubmitting(true);
    try {
      await onAssign({
        day_of_week: cell.day,
        meal_type: cell.mealType,
        assigned_user_id: assignmentType === "member" ? selectedMemberId : null,
        assigned_cook_name: assignmentType === "custom" ? customName : null,
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error assigning cook:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    setIsSubmitting(true);
    try {
      await onClear();
      onOpenChange(false);
    } catch (error) {
      console.error("Error clearing assignment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!cell) return null;

  const canSubmit =
    (assignmentType === "member" && selectedMemberId) ||
    (assignmentType === "custom" && customName.trim());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            Assign Cook for {DAY_OF_WEEK_NAMES[cell.day]} {cell.mealType}
          </DialogTitle>
          <DialogDescription>
            Choose who will cook this meal or enter a custom name.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Assignment Type Toggle */}
          <div className="flex gap-2">
            <Button
              variant={assignmentType === "member" ? "default" : "outline"}
              size="sm"
              onClick={() => setAssignmentType("member")}
              className="flex-1"
            >
              <ChefHat className="h-4 w-4 mr-2" />
              Household Member
            </Button>
            <Button
              variant={assignmentType === "custom" ? "default" : "outline"}
              size="sm"
              onClick={() => setAssignmentType("custom")}
              className="flex-1"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Custom Name
            </Button>
          </div>

          {/* Member Selection */}
          {assignmentType === "member" && (
            <div className="space-y-2">
              <Label>Select Member</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a household member" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.user_id} value={member.user_id}>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-5 w-5">
                          <AvatarImage src={member.profile.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">
                            {member.profile.first_name?.[0] ?? "?"}
                          </AvatarFallback>
                        </Avatar>
                        {member.profile.first_name || member.profile.email}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Custom Name Input */}
          {assignmentType === "custom" && (
            <div className="space-y-2">
              <Label htmlFor="custom-name">Custom Cook Name</Label>
              <Input
                id="custom-name"
                placeholder="e.g., Mom, Dad, Chef Alex"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {cell.schedule && (
            <Button
              variant="destructive"
              onClick={handleClear}
              disabled={isSubmitting}
              className="sm:mr-auto"
            >
              <X className="h-4 w-4 mr-2" />
              Clear Assignment
            </Button>
          )}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}>
            {isSubmitting ? "Saving..." : "Assign Cook"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Schedule Cell Component
// ============================================================================

interface ScheduleCellProps {
  schedule: CookingScheduleWithUser | null;
  onClick: () => void;
}

function ScheduleCellComponent({ schedule, onClick }: ScheduleCellProps) {
  const displayName = schedule ? getScheduleDisplayName(schedule) : null;
  const initials = schedule?.user?.first_name?.[0] ?? schedule?.assigned_cook_name?.[0] ?? "?";

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-20 rounded-md border-2 transition-all hover:border-primary hover:bg-accent/50",
        schedule ? "border-muted bg-muted/30" : "border-dashed border-muted-foreground/20 bg-muted/10"
      )}
    >
      {schedule ? (
        <div className="flex flex-col items-center justify-center gap-1.5 p-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src={schedule.user?.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium truncate max-w-full px-1">
            {displayName}
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <ChefHat className="h-5 w-5" />
        </div>
      )}
    </button>
  );
}

// ============================================================================
// Loading Skeleton
// ============================================================================

function CookingScheduleSkeleton() {
  const mealTypes: ScheduleMealType[] = ["breakfast", "lunch", "dinner"];
  const days: DayOfWeekIndex[] = [0, 1, 2, 3, 4, 5, 6];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Cooking Schedule
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Header Row */}
          <div className="grid grid-cols-8 gap-2">
            <div className="text-sm font-medium text-muted-foreground"></div>
            {days.map((day) => (
              <div key={day} className="text-center">
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-full" />
              </div>
            ))}
          </div>

          {/* Meal Rows */}
          {mealTypes.map((mealType) => (
            <div key={mealType} className="grid grid-cols-8 gap-2">
              <Skeleton className="h-20 w-full" />
              {days.map((day) => (
                <Skeleton key={`${day}-${mealType}`} className="h-20 w-full rounded-md" />
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Empty State
// ============================================================================

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <ChefHat className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Cooking Schedule Yet</h3>
      <p className="text-sm text-muted-foreground max-w-md">
        Click on any cell to assign household members or custom cooks to meals throughout the week.
      </p>
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

interface CookingScheduleEditorProps {
  householdId: string | null;
}

export function CookingScheduleEditor({ householdId }: CookingScheduleEditorProps) {
  const [schedules, setSchedules] = useState<CookingScheduleWithUser[]>([]);
  const [members, setMembers] = useState<HouseholdMemberWithProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCell, setSelectedCell] = useState<ScheduleCell | null>(null);

  const mealTypes: ScheduleMealType[] = ["breakfast", "lunch", "dinner"];
  const days: DayOfWeekIndex[] = [0, 1, 2, 3, 4, 5, 6];

  // Load data
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [schedulesResult, membersResult] = await Promise.all([
        getCookingSchedules(),
        getHouseholdMembers(),
      ]);

      if (!schedulesResult.error && schedulesResult.data) {
        setSchedules(schedulesResult.data);
      }

      if (!membersResult.error && membersResult.data) {
        setMembers(membersResult.data);
      }
    } catch (error) {
      console.error("Error loading cooking schedule data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Real-time subscription
  useCookingScheduleRealtime(householdId, (payload) => {
    console.log("Real-time schedule change:", payload);
    loadData();
  });

  // Get schedule for a specific day/meal
  const getSchedule = (day: DayOfWeekIndex, mealType: ScheduleMealType) => {
    return schedules.find((s) => s.day_of_week === day && s.meal_type === mealType) ?? null;
  };

  // Handle cell click
  const handleCellClick = (day: DayOfWeekIndex, mealType: ScheduleMealType) => {
    const schedule = getSchedule(day, mealType);
    setSelectedCell({ day, mealType, schedule });
    setDialogOpen(true);
  };

  // Handle assignment
  const handleAssign = async (formData: CookingScheduleFormData) => {
    const result = await upsertCookingSchedule(formData);
    if (!result.error) {
      await loadData();
    } else {
      throw new Error(result.error);
    }
  };

  // Handle clear
  const handleClear = async () => {
    if (!selectedCell) return;
    const result = await deleteCookingSchedule(selectedCell.day, selectedCell.mealType);
    if (!result.error) {
      await loadData();
    } else {
      throw new Error(result.error);
    }
  };

  const hasAnySchedules = schedules.length > 0;

  if (isLoading) {
    return <CookingScheduleSkeleton />;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Cooking Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!hasAnySchedules ? (
            <EmptyState />
          ) : (
            <div className="space-y-4 overflow-x-auto">
              {/* Header Row */}
              <div className="grid grid-cols-8 gap-2 min-w-[640px]">
                <div className="text-sm font-medium text-muted-foreground"></div>
                {days.map((day) => (
                  <div key={day} className="text-center">
                    <div className="font-semibold text-sm hidden sm:block">
                      {DAY_OF_WEEK_NAMES[day]}
                    </div>
                    <div className="font-semibold text-sm sm:hidden">
                      {DAY_OF_WEEK_SHORT[day]}
                    </div>
                  </div>
                ))}
              </div>

              {/* Meal Rows */}
              {mealTypes.map((mealType) => (
                <div key={mealType} className="grid grid-cols-8 gap-2 min-w-[640px]">
                  {/* Meal Type Label */}
                  <div className="flex items-center">
                    <Badge variant="outline" className="capitalize text-xs">
                      {mealType}
                    </Badge>
                  </div>

                  {/* Day Cells */}
                  {days.map((day) => (
                    <ScheduleCellComponent
                      key={`${day}-${mealType}`}
                      schedule={getSchedule(day, mealType)}
                      onClick={() => handleCellClick(day, mealType)}
                    />
                  ))}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AssignCookDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        cell={selectedCell}
        members={members}
        onAssign={handleAssign}
        onClear={handleClear}
      />
    </>
  );
}
