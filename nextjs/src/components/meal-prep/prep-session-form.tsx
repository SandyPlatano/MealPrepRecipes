"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { PrepSession, PrepSessionFormData } from "@/types/meal-prep";

export interface PrepSessionFormProps {
  initialData?: PrepSession;
  onSubmit: (data: PrepSessionFormData) => void | Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
}

interface FormValues {
  name: string;
  scheduled_date: Date | undefined;
  estimated_total_time_minutes: string;
  notes: string;
}

export function PrepSessionForm({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: PrepSessionFormProps) {
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      name: initialData?.name || "",
      scheduled_date: initialData?.scheduled_date
        ? new Date(initialData.scheduled_date)
        : undefined,
      estimated_total_time_minutes: initialData?.estimated_total_time_minutes?.toString() || "",
      notes: initialData?.notes || "",
    },
  });

  const selectedDate = watch("scheduled_date");

  useEffect(() => {
    if (initialData?.scheduled_date) {
      setValue("scheduled_date", new Date(initialData.scheduled_date));
    }
  }, [initialData, setValue]);

  const handleFormSubmit = async (data: FormValues) => {
    if (!data.scheduled_date) {
      return;
    }

    const formData: PrepSessionFormData = {
      name: data.name.trim(),
      scheduled_date: format(data.scheduled_date, "yyyy-MM-dd"),
      estimated_total_time_minutes: data.estimated_total_time_minutes
        ? parseInt(data.estimated_total_time_minutes, 10)
        : undefined,
      notes: data.notes.trim() || undefined,
    };

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium">
          Session Name
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g., Sunday Meal Prep"
          {...register("name", {
            required: "Session name is required",
            minLength: {
              value: 1,
              message: "Session name cannot be empty",
            },
          })}
          disabled={isSubmitting}
          className={cn(
            errors.name && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>

      {/* Scheduled Date */}
      <div className="space-y-2">
        <Label className="text-base font-medium">
          Scheduled Date
          <span className="text-destructive ml-1">*</span>
        </Label>
        <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !selectedDate && "text-muted-foreground",
                errors.scheduled_date && "border-destructive focus-visible:ring-destructive"
              )}
              disabled={isSubmitting}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? (
                format(selectedDate, "PPP")
              ) : (
                <span>Pick a date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setValue("scheduled_date", date, {
                  shouldValidate: true,
                });
                setDatePickerOpen(false);
              }}
              initialFocus
              disabled={isSubmitting}
            />
          </PopoverContent>
        </Popover>
        {errors.scheduled_date && (
          <p className="text-sm text-destructive">
            {errors.scheduled_date.message}
          </p>
        )}
      </div>

      {/* Estimated Time */}
      <div className="space-y-2">
        <Label htmlFor="estimated_total_time_minutes" className="text-base font-medium">
          Estimated Time (minutes)
        </Label>
        <Input
          id="estimated_total_time_minutes"
          type="number"
          min="0"
          step="15"
          placeholder="e.g., 120"
          {...register("estimated_total_time_minutes", {
            min: {
              value: 0,
              message: "Time must be positive",
            },
          })}
          disabled={isSubmitting}
          className={cn(
            errors.estimated_total_time_minutes &&
              "border-destructive focus-visible:ring-destructive"
          )}
        />
        {errors.estimated_total_time_minutes && (
          <p className="text-sm text-destructive">
            {errors.estimated_total_time_minutes.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Optional: How long you expect this prep session to take
        </p>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="notes" className="text-base font-medium">
          Notes
        </Label>
        <Textarea
          id="notes"
          placeholder="Any special notes about this prep session..."
          rows={4}
          {...register("notes")}
          disabled={isSubmitting}
        />
        <p className="text-xs text-muted-foreground">
          Optional: Add any additional information or reminders
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              {initialData ? "Updating..." : "Creating..."}
            </>
          ) : (
            <>{initialData ? "Update Session" : "Create Session"}</>
          )}
        </Button>
      </div>
    </form>
  );
}
