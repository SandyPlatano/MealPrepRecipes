"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { INGREDIENT_CATEGORIES } from "@/types/shopping-list";

interface AddItemFormProps {
  newItem: string;
  setNewItem: (value: string) => void;
  newCategory: string;
  setNewCategory: (value: string) => void;
  isAdding: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

/**
 * Form for manually adding items to the shopping list.
 *
 * Includes ingredient input and category selector.
 */
export function AddItemForm({
  newItem,
  setNewItem,
  newCategory,
  setNewCategory,
  isAdding,
  onSubmit,
}: AddItemFormProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-900 dark:text-gray-100">
          Add Item
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="flex gap-2">
          <Input
            placeholder="Add ingredient..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            className="flex-1 border-gray-200 focus:border-[#D9F99D] focus:ring-1 focus:ring-[#D9F99D] dark:border-gray-700"
          />
          <Select value={newCategory} onValueChange={setNewCategory}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {INGREDIENT_CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="submit"
            disabled={isAdding || !newItem.trim()}
            className="bg-[#1A1A1A] hover:bg-[#1A1A1A]/90 text-white rounded-full"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
