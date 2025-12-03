import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useRecipes } from '../context/RecipeContext';
import { useCart } from '../context/CartContext';
import RecipeCard from './RecipeCard';
import RecipeDetailDialog from './RecipeDetailDialog';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { ShoppingCart, Heart, History } from 'lucide-react';

export default function MyRecipes() {
  const { 
    getFavoriteRecipes, 
    getAllHistory, 
    getRecentHistory,
    recipes 
  } = useRecipes();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState('favorites');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  const favoriteRecipes = getFavoriteRecipes();
  const recentHistory = getRecentHistory(10);
  const allHistory = getAllHistory();

  // Get recipe objects from history entries
  const getRecipesFromHistory = (historyEntries) => {
    return historyEntries
      .map(entry => {
        const recipe = recipes.find(r => r.id === entry.recipeId);
        return recipe ? { ...recipe, historyEntry: entry } : null;
      })
      .filter(Boolean);
  };

  const recentRecipes = getRecipesFromHistory(recentHistory);
  const allHistoryRecipes = getRecipesFromHistory(allHistory);

  const handleMakeAgain = (recipe) => {
    if (addToCart(recipe)) {
      toast.success('Added to this week\'s plan!');
    } else {
      toast.info('Already on the menu');
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>The Vault</CardTitle>
          <CardDescription>Your favorites and everything you've actually made</CardDescription>
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
          <TabsTrigger value="recent">Recent Wins</TabsTrigger>
          <TabsTrigger value="history">Full History</TabsTrigger>
        </TabsList>

        <TabsContent value="favorites" className="mt-6">
          {favoriteRecipes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <Heart className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    No favorites yet. Heart the ones you love so you can find them when babe asks.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {favoriteRecipes.map(recipe => (
                <RecipeCard 
                  key={recipe.id} 
                  recipe={recipe} 
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="recent" className="mt-6">
          {recentRecipes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <History className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Nothing cooked yet. Mark recipes as done to build your track record.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {recentRecipes.map(({ historyEntry, ...recipe }) => (
                <Card key={`${recipe.id}-${historyEntry.date}`} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle>{recipe.title}</CardTitle>
                        <CardDescription className="mt-1">
                          Made on {format(new Date(historyEntry.date), 'MMM d, yyyy')}
                          {historyEntry.rating && (
                            <>
                              <span> • </span>
                              <span>{historyEntry.rating}/5 ⭐</span>
                            </>
                          )}
                        </CardDescription>
                        {historyEntry.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">
                            "{historyEntry.notes}"
                          </p>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleMakeAgain(recipe)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Make It Again
                      </Button>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          {allHistoryRecipes.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-3">
                  <History className="h-12 w-12 text-muted-foreground opacity-50" />
                  <p className="text-muted-foreground">
                    Nothing cooked yet. Mark recipes as done to build your track record.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Group by date */}
              {Object.entries(
                allHistoryRecipes.reduce((acc, { historyEntry, ...recipe }) => {
                  const date = format(new Date(historyEntry.date), 'yyyy-MM-dd');
                  if (!acc[date]) acc[date] = [];
                  acc[date].push({ historyEntry, ...recipe });
                  return acc;
                }, {})
              )
                .sort(([a], [b]) => b.localeCompare(a))
                .map(([date, recipesForDate]) => (
                  <div key={date}>
                    <h3 className="text-lg font-semibold mb-3">
                      {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                    </h3>
                    <div className="space-y-2">
                      {recipesForDate.map(({ historyEntry, ...recipe }) => (
                        <Card key={`${recipe.id}-${historyEntry.date}`} className="hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{recipe.title}</h4>
                                {historyEntry.rating && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Rated {historyEntry.rating}/5 ⭐
                                  </p>
                                )}
                                {historyEntry.notes && (
                                  <p className="text-sm text-muted-foreground mt-1 italic">
                                    "{historyEntry.notes}"
                                  </p>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleMakeAgain(recipe)}
                              >
                                <ShoppingCart className="h-4 w-4 mr-2" />
                                Make Again
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Single dialog instance for recipe details */}
      {selectedRecipe && (
        <RecipeDetailDialog
          recipe={selectedRecipe}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) setSelectedRecipe(null);
          }}
        />
      )}
    </div>
  );
}

