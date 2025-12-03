import { useState, useMemo, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { Heart, Download, Printer, UtensilsCrossed, Cookie, Coffee, IceCream, Croissant, Salad } from 'lucide-react';
import { useRecipes } from '../context/RecipeContext';
import { useCart } from '../context/CartContext';
import { exportRecipeAsMarkdown, exportRecipeAsPDF } from '../utils/exportService';
import { scaleRecipeIngredients } from '../utils/ingredientParser';
import { toast } from 'sonner';
import StarRating from './StarRating';
import { formatDistanceToNow } from 'date-fns';

// Get icon based on recipe type
const getRecipeIcon = (recipeType) => {
  switch (recipeType) {
    case 'Baking':
      return <Cookie className="h-4 w-4" />;
    case 'Breakfast':
      return <Coffee className="h-4 w-4" />;
    case 'Dessert':
      return <IceCream className="h-4 w-4" />;
    case 'Snack':
      return <Croissant className="h-4 w-4" />;
    case 'Side Dish':
      return <Salad className="h-4 w-4" />;
    case 'Dinner':
    default:
      return <UtensilsCrossed className="h-4 w-4" />;
  }
};

export default function RecipeDetailDialog({ recipe, open, onOpenChange }) {
  const { 
    toggleFavorite, 
    isFavorite, 
    markAsCooked, 
    getRecipeHistory,
    getLastMadeDate,
    updateRecipeRating,
    updateRecipeNotes,
    updateHistoryEntry,
  } = useRecipes();
  const { addToCart, removeFromCart, isInCart } = useCart();
  
  const [servingScale, setServingScale] = useState(1);
  const [hasBeenCooked, setHasBeenCooked] = useState(false);
  const [rating, setRating] = useState(recipe?.rating || null);
  const [notes, setNotes] = useState(recipe?.notes || '');

  // Check if recipe has been cooked
  const recipeHistory = useMemo(() => recipe?.id ? getRecipeHistory(recipe.id) : [], [recipe?.id, getRecipeHistory, open]);
  const lastMadeDate = useMemo(() => recipe?.id ? getLastMadeDate(recipe.id) : null, [recipe?.id, getLastMadeDate, open]);
  
  // Get latest history entry for rating/notes
  const latestHistory = recipeHistory.length > 0 ? recipeHistory[0] : null;
  
  // Initialize state from latest history or recipe
  useEffect(() => {
    if (!recipe) return;
    if (latestHistory) {
      setHasBeenCooked(true);
      setRating(latestHistory.rating || recipe.rating || null);
      setNotes(latestHistory.notes || recipe.notes || '');
    } else {
      setHasBeenCooked(false);
      setRating(recipe.rating || null);
      setNotes(recipe.notes || '');
    }
  }, [recipe?.id, latestHistory, recipe?.rating, recipe?.notes]);

  const scaledIngredients = useMemo(() => {
    if (!recipe?.ingredients) return [];
    if (servingScale === 1) return recipe.ingredients;
    return scaleRecipeIngredients(recipe.ingredients, servingScale);
  }, [recipe?.ingredients, servingScale]);

  const handleMarkAsCooked = () => {
    const newEntry = markAsCooked(recipe.id);
    setHasBeenCooked(true);
    // Update latestHistory reference
    const updatedHistory = getRecipeHistory(recipe.id);
    if (updatedHistory.length > 0) {
      const latest = updatedHistory[0];
      // Update rating/notes to use the new history entry
      setRating(latest.rating || null);
      setNotes(latest.notes || '');
    }
    toast.success('Nice! Now rate it.');
  };

  const handleRatingChange = (newRating) => {
    setRating(newRating);
    if (hasBeenCooked && latestHistory) {
      updateHistoryEntry(recipe.id, latestHistory.date, { rating: newRating });
    }
    updateRecipeRating(recipe.id, newRating);
    toast.success(`Rated ${newRating} stars!`);
  };

  const handleNotesChange = (newNotes) => {
    setNotes(newNotes);
    if (hasBeenCooked && latestHistory) {
      updateHistoryEntry(recipe.id, latestHistory.date, { notes: newNotes });
    }
    updateRecipeNotes(recipe.id, newNotes);
  };

  const handleAddToCart = () => {
    if (addToCart(recipe)) {
      toast.success('Added!');
      onOpenChange(false);
    } else {
      toast.info('Already there');
    }
  };

  const handleRemoveFromCart = () => {
    removeFromCart(recipe.id);
    toast.success('Removed');
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>${recipe.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 40px;
            line-height: 1.6;
          }
          h1 { color: #000; border-bottom: 2px solid #000; padding-bottom: 10px; }
          h2 { color: #333; margin-top: 30px; }
          .meta { color: #666; margin: 20px 0; }
          ul, ol { margin: 10px 0; padding-left: 30px; }
          li { margin: 5px 0; }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <h1>${recipe.title}</h1>
        <div class="meta">
          <strong>Type:</strong> ${recipe.recipeType || 'Dinner'} | 
          <strong>Category:</strong> ${recipe.category || recipe.proteinType} | 
          <strong>Prep Time:</strong> ${recipe.prepTime} | 
          <strong>Cook Time:</strong> ${recipe.cookTime} | 
          <strong>Servings:</strong> ${recipe.servings}
        </div>
        
        <h2>Ingredients</h2>
        <ul>
          ${scaledIngredients.map(ing => `<li>${ing}</li>`).join('')}
        </ul>
        
        <h2>Instructions</h2>
        <ol>
          ${recipe.instructions.map(inst => `<li>${inst}</li>`).join('')}
        </ol>
        
        ${notes ? `<h2>Notes</h2><p>${notes}</p>` : ''}
        ${rating ? `<p><strong>Rating:</strong> ${rating}/5 ⭐</p>` : ''}
      </body>
      </html>
    `;
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => printWindow.print(), 250);
    };
  };

  // Don't render if recipe is missing
  if (!recipe) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-background text-foreground">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-2xl">{recipe.title}</DialogTitle>
              <DialogDescription className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  {getRecipeIcon(recipe.recipeType || 'Dinner')}
                  {recipe.recipeType || 'Dinner'}
                </span>
                <span>•</span>
                <span>{recipe.category || recipe.proteinType}</span>
                <span>•</span>
                <span>{recipe.prepTime} prep</span>
                <span>•</span>
                <span>{recipe.cookTime} cook</span>
                <span>•</span>
                <span>{recipe.servings} servings</span>
                {lastMadeDate && (
                  <>
                    <span>•</span>
                    <Badge variant="secondary">
                      Made {formatDistanceToNow(new Date(lastMadeDate), { addSuffix: true })}
                    </Badge>
                  </>
                )}
              </DialogDescription>
            </div>
            <div className="flex gap-1 ml-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => toggleFavorite(recipe.id)}
                className={isFavorite(recipe.id) ? 'text-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isFavorite(recipe.id) ? 'fill-current' : ''}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Serving Scale */}
            <div className="flex items-center gap-4">
              <Label>Servings:</Label>
              <div className="flex gap-2">
                {[0.5, 1, 1.5, 2, 3].map(scale => (
                  <Button
                    key={scale}
                    variant={servingScale === scale ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setServingScale(scale)}
                  >
                    {scale === 0.5 ? '½x' : scale === 1.5 ? '1½x' : `${scale}x`}
                  </Button>
                ))}
              </div>
              {servingScale !== 1 && (
                <span className="text-sm text-muted-foreground">
                  ({Math.round(parseFloat(recipe.servings) * servingScale)} servings)
                </span>
              )}
            </div>

            <Separator />

            {/* Ingredients */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Ingredients</h3>
              <ul className="list-disc list-inside space-y-1">
                {scaledIngredients.map((ing, index) => (
                  <li key={index} className="text-sm">{ing}</li>
                ))}
              </ul>
            </div>

            <Separator />

            {/* Instructions */}
            <div>
              <h3 className="text-lg font-semibold mb-2">Instructions</h3>
              <ol className="list-decimal list-inside space-y-2">
                {recipe.instructions.map((inst, index) => (
                  <li key={index} className="text-sm">{inst}</li>
                ))}
              </ol>
            </div>

            <Separator />

            {/* Rating / Notes (only shown if cooked) */}
            {hasBeenCooked && (
              <div className="space-y-4">
                <div>
                  <Label>How Was It?</Label>
                  <StarRating
                    rating={rating}
                    onRatingChange={handleRatingChange}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => handleNotesChange(e.target.value)}
                    placeholder="Add notes for next time (e.g., 'Babe loved this', 'Needs more garlic', 'Never again')"
                    rows={3}
                  />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="flex flex-col gap-2 pt-4 border-t">
          {!hasBeenCooked ? (
            <>
              <Button onClick={handleMarkAsCooked} className="w-full">
                I Made This
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                Mark it done to rate and add notes
              </p>
            </>
          ) : null}
          <div className="flex gap-2">
            {isInCart(recipe.id) ? (
              <Button
                variant="outline"
                className="flex-1 border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-400 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300 dark:hover:border-orange-500"
                onClick={handleRemoveFromCart}
              >
                Remove from Plan
              </Button>
            ) : (
              <Button
                variant="default"
                className="flex-1"
                onClick={handleAddToCart}
              >
                Add to Plan
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

