'use client';

import { useState, useEffect } from 'react';
import { Check, X, Edit2, Plus, Loader2, ShoppingCart, ChefHat, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface DetectedItem {
  ingredient: string;
  quantity?: string;
  category: string;
  confidence: number;
  confirmed?: boolean;
  edited?: boolean;
}

interface SuggestedRecipe {
  id: string;
  title: string;
  prep_time?: number;
  cook_time?: number;
  image_url?: string;
  matching_ingredients: number;
  total_ingredients: number;
  missing_ingredients: number;
}

interface ScanReviewProps {
  scanId: string;
  initialItems: DetectedItem[];
  suggestedRecipes?: SuggestedRecipe[];
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ScanReview({
  scanId,
  initialItems,
  suggestedRecipes = [],
  onConfirm,
  onCancel
}: ScanReviewProps) {
  const [items, setItems] = useState<DetectedItem[]>(
    initialItems.map(item => ({ ...item, confirmed: true }))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState({ ingredient: '', quantity: '' });
  const [isConfirming, setIsConfirming] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [newItem, setNewItem] = useState({ ingredient: '', quantity: '', category: 'Other' });

  const confirmedCount = items.filter(item => item.confirmed).length;
  const confirmationProgress = (confirmedCount / items.length) * 100;

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.9) {
      return <Badge variant="default" className="bg-green-500">High</Badge>;
    } else if (confidence >= 0.85) {
      return <Badge variant="secondary">Medium</Badge>;
    } else {
      return <Badge variant="outline">Low</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Produce': '🥬',
      'Dairy': '🥛',
      'Meat': '🥩',
      'Seafood': '🐟',
      'Pantry': '🥫',
      'Condiments': '🧂',
      'Beverages': '🥤',
      'Frozen': '❄️',
      'Snacks': '🍿',
      'Other': '📦'
    };
    return icons[category] || '📦';
  };

  const handleToggleItem = (index: number) => {
    const newItems = [...items];
    newItems[index].confirmed = !newItems[index].confirmed;
    setItems(newItems);
  };

  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setEditValue({
      ingredient: items[index].ingredient,
      quantity: items[index].quantity || ''
    });
  };

  const handleSaveEdit = (index: number) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      ingredient: editValue.ingredient,
      quantity: editValue.quantity,
      edited: true
    };
    setItems(newItems);
    setEditingIndex(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    if (newItem.ingredient) {
      setItems([...items, {
        ingredient: newItem.ingredient,
        quantity: newItem.quantity,
        category: newItem.category as DetectedItem['category'],
        confidence: 1.0,
        confirmed: true,
        edited: true
      }]);
      setNewItem({ ingredient: '', quantity: '', category: 'Other' });
      setShowAddItem(false);
      toast.success('Item added');
    }
  };

  const handleConfirmItems = async () => {
    const confirmedItems = items.filter(item => item.confirmed);

    if (confirmedItems.length === 0) {
      toast.error('Please select at least one item to add to your pantry');
      return;
    }

    setIsConfirming(true);

    try {
      const response = await fetch('/api/pantry/confirm-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scan_id: scanId,
          confirmed_items: confirmedItems,
          add_to_pantry: true
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to confirm items');
      }

      toast.success(`Added ${confirmedItems.length} items to your pantry!`);
      onConfirm();

    } catch (error) {
      console.error('Error confirming items:', error);
      toast.error('Failed to add items to pantry');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Review Header */}
      <Card>
        <CardHeader>
          <CardTitle>Review Detected Items</CardTitle>
          <CardDescription>
            We found {items.length} items in your {scanId ? 'scan' : 'image'}.
            Review and confirm what you'd like to add to your pantry.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>{confirmedCount} of {items.length} items selected</span>
              <span>{Math.round(confirmationProgress)}%</span>
            </div>
            <Progress value={confirmationProgress} />
          </div>
        </CardContent>
      </Card>

      {/* Detected Items List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Detected Items</CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddItem(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-lg border ${
                  item.confirmed ? 'bg-accent/50' : 'bg-muted/30'
                }`}
              >
                <Checkbox
                  checked={item.confirmed}
                  onCheckedChange={() => handleToggleItem(index)}
                />

                <div className="flex-1">
                  {editingIndex === index ? (
                    <div className="flex gap-2">
                      <Input
                        value={editValue.ingredient}
                        onChange={(e) => setEditValue({ ...editValue, ingredient: e.target.value })}
                        placeholder="Item name"
                        className="flex-1"
                      />
                      <Input
                        value={editValue.quantity}
                        onChange={(e) => setEditValue({ ...editValue, quantity: e.target.value })}
                        placeholder="Quantity"
                        className="w-32"
                      />
                      <Button size="sm" onClick={() => handleSaveEdit(index)}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingIndex(null)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{getCategoryIcon(item.category)}</span>
                      <div className="flex-1">
                        <div className="font-medium">
                          {item.ingredient}
                          {item.edited && (
                            <Badge variant="outline" className="ml-2 text-xs">
                              Edited
                            </Badge>
                          )}
                        </div>
                        {item.quantity && (
                          <div className="text-sm text-muted-foreground">
                            Quantity: {item.quantity}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getConfidenceBadge(item.confidence)}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditItem(index)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No items detected. Try adding items manually.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Suggested Recipes */}
      {suggestedRecipes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              Recipes You Can Make
            </CardTitle>
            <CardDescription>
              Based on the items detected, here are some recipes you can make
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {suggestedRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors cursor-pointer"
                  onClick={() => window.location.href = `/recipes/${recipe.id}`}
                >
                  {recipe.image_url && (
                    <img
                      src={recipe.image_url}
                      alt={recipe.title}
                      className="w-16 h-16 rounded-md object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{recipe.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {recipe.prep_time && `${recipe.prep_time} min prep`}
                      {recipe.cook_time && ` • ${recipe.cook_time} min cook`}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary" className="bg-green-100">
                      {recipe.matching_ingredients}/{recipe.total_ingredients} ingredients
                    </Badge>
                    {recipe.missing_ingredients === 0 && (
                      <div className="text-xs text-green-600 mt-1">Ready to make!</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          className="flex-1"
          onClick={handleConfirmItems}
          disabled={confirmedCount === 0 || isConfirming}
        >
          {isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding to Pantry...
            </>
          ) : (
            <>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add {confirmedCount} Items to Pantry
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={isConfirming}>
          Cancel
        </Button>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item Manually</DialogTitle>
            <DialogDescription>
              Add an item that wasn't detected in the scan
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Item Name</Label>
              <Input
                value={newItem.ingredient}
                onChange={(e) => setNewItem({ ...newItem, ingredient: e.target.value })}
                placeholder="e.g., Tomatoes"
              />
            </div>
            <div>
              <Label>Quantity (optional)</Label>
              <Input
                value={newItem.quantity}
                onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                placeholder="e.g., 2 lbs"
              />
            </div>
            <div>
              <Label>Category</Label>
              <select
                className="w-full border rounded-md p-2"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              >
                <option value="Produce">Produce</option>
                <option value="Dairy">Dairy</option>
                <option value="Meat">Meat</option>
                <option value="Seafood">Seafood</option>
                <option value="Pantry">Pantry</option>
                <option value="Condiments">Condiments</option>
                <option value="Beverages">Beverages</option>
                <option value="Frozen">Frozen</option>
                <option value="Snacks">Snacks</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddItem} className="flex-1">
                Add Item
              </Button>
              <Button variant="outline" onClick={() => setShowAddItem(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}