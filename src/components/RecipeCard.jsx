import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, Download, Trash2, UtensilsCrossed, Cookie, Croissant, Coffee, IceCream, Salad } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from './ui/alert-dialog';
import { useCart } from '../context/CartContext';
import { useRecipes } from '../context/RecipeContext';
import { exportRecipeAsMarkdown, exportRecipeAsPDF, downloadTextAsFile } from '../utils/exportService';
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

export default function RecipeCard({ recipe, onViewDetails }) {
  const { addToCart, removeFromCart, isInCart } = useCart();
  const { toggleFavorite, isFavorite, getLastMadeDate, deleteRecipe } = useRecipes();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const lastMadeDate = getLastMadeDate(recipe.id);

  const handleAddToCart = () => {
    if (addToCart(recipe)) {
      toast.success('Added to meal plan');
    } else {
      toast.info('Already in meal plan');
    }
  };

  const handleRemoveFromCart = () => {
    removeFromCart(recipe.id);
    toast.success('Removed from meal plan');
  };

  const handleToggleFavorite = () => {
    toggleFavorite(recipe.id);
    toast.success(isFavorite(recipe.id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleExportMarkdown = () => {
    const markdown = exportRecipeAsMarkdown(recipe);
    downloadTextAsFile(markdown, `${recipe.title.replace(/[^a-z0-9]/gi, '_')}.md`, 'text/markdown');
    toast.success('Recipe exported as Markdown');
  };

  const handleExportPDF = () => {
    exportRecipeAsPDF(recipe);
    toast.success('Opening PDF preview');
  };

  const handleDelete = () => {
    // Remove from cart if it's in cart
    if (isInCart(recipe.id)) {
      removeFromCart(recipe.id);
    }
    // Delete the recipe
    deleteRecipe(recipe.id);
    toast.success('Recipe deleted');
    setDeleteDialogOpen(false);
  };

  return (
    <Card 
      className="hover:shadow-lg hover:scale-[1.02] transition-all duration-200 flex flex-col h-full cursor-pointer"
      onClick={() => onViewDetails && onViewDetails(recipe)}
    >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{recipe.title}</CardTitle>
              <CardDescription className="mt-1 flex items-center gap-1 flex-wrap">
                <span className="inline-flex items-center gap-1">
                  {getRecipeIcon(recipe.recipeType || 'Dinner')}
                  {recipe.recipeType || 'Dinner'}
                </span>
                <span>•</span>
                <span>{recipe.category || recipe.proteinType}</span>
                <span>•</span>
                <span>{recipe.prepTime} prep</span>
                {lastMadeDate && (
                  <>
                    <span>•</span>
                    <Badge variant="outline" className="text-xs">
                      Made {formatDistanceToNow(new Date(lastMadeDate), { addSuffix: true })}
                    </Badge>
                  </>
                )}
              </CardDescription>
              {recipe.rating && (
                <div className="mt-2">
                  <StarRating rating={recipe.rating} disabled size="sm" />
                </div>
              )}
            </div>
          <div className="flex gap-1 ml-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleFavorite}
              className={isFavorite(recipe.id) ? 'text-red-500' : ''}
            >
              <Heart className={`h-4 w-4 ${isFavorite(recipe.id) ? 'fill-current' : ''}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleExportMarkdown}>
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Recipe</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{recipe.title}"? This action cannot be undone and will remove the recipe from your collection, favorites, and any meal plans.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col flex-1">
        <div className="flex-1">
          <p className="text-sm font-medium mb-1">Key Ingredients:</p>
          <p className="text-sm text-muted-foreground">
            {recipe.ingredients.slice(0, 5).join(', ')}
            {recipe.ingredients.length > 5 && '...'}
          </p>
        </div>
        {isInCart(recipe.id) ? (
          <Button
            variant="outline"
            className="w-full mt-4 border-orange-300 text-orange-700 hover:bg-orange-50 hover:text-orange-800 hover:border-orange-400 dark:border-orange-600 dark:text-orange-400 dark:hover:bg-orange-950 dark:hover:text-orange-300 dark:hover:border-orange-500"
            onClick={(e) => {
              e.stopPropagation();
              handleRemoveFromCart();
            }}
          >
            Remove from Meal Plan
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-full mt-4"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToCart();
            }}
          >
            Add to Meal Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

