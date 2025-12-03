import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useRecipes } from '../context/RecipeContext';
import { useSettings } from '../context/SettingsContext';
import { format, startOfMonth, isAfter } from 'date-fns';

export default function Stats() {
  const { recipes, getAllHistory } = useRecipes();
  const { settings } = useSettings();

  const history = getAllHistory();
  const thisMonth = startOfMonth(new Date());

  // Filter history for this month
  const thisMonthHistory = useMemo(() => {
    return history.filter(entry => {
      const entryDate = new Date(entry.date);
      return isAfter(entryDate, thisMonth) || entryDate.getTime() === thisMonth.getTime();
    });
  }, [history, thisMonth]);

  // Most-made recipe
  const mostMadeRecipe = useMemo(() => {
    const counts = {};
    history.forEach(entry => {
      counts[entry.recipeId] = (counts[entry.recipeId] || 0) + 1;
    });
    const maxCount = Math.max(...Object.values(counts), 0);
    const mostMadeId = Object.keys(counts).find(id => counts[id] === maxCount);
    if (mostMadeId) {
      return recipes.find(r => r.id === mostMadeId);
    }
    return null;
  }, [history, recipes]);

  // Recipes by type breakdown
  const recipesByType = useMemo(() => {
    const typeCounts = {};
    history.forEach(entry => {
      const recipe = recipes.find(r => r.id === entry.recipeId);
      if (recipe) {
        const type = recipe.recipeType || 'Dinner';
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    });
    return typeCounts;
  }, [history, recipes]);

  // Average rating
  const averageRating = useMemo(() => {
    const ratings = history
      .map(entry => entry.rating)
      .filter(r => r !== null && r !== undefined);
    if (ratings.length === 0) return null;
    const sum = ratings.reduce((a, b) => a + b, 0);
    return (sum / ratings.length).toFixed(1);
  }, [history]);

  // You vs Morgan cooking count (from cart assignments - approximate)
  // This is approximate since we don't track who actually cooked, just who was assigned
  const cookingCounts = useMemo(() => {
    // We can't accurately determine this from history alone
    // This would need to be tracked when marking as cooked
    return { you: 0, morgan: 0 };
  }, []);

  // Favorite category
  const favoriteCategory = useMemo(() => {
    const categoryCounts = {};
    history.forEach(entry => {
      const recipe = recipes.find(r => r.id === entry.recipeId);
      if (recipe) {
        const category = recipe.category || recipe.proteinType || 'Other';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      }
    });
    const maxCount = Math.max(...Object.values(categoryCounts), 0);
    const favorite = Object.keys(categoryCounts).find(cat => categoryCounts[cat] === maxCount);
    return favorite || 'None yet';
  }, [history, recipes]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cooking Statistics</CardTitle>
          <CardDescription>Your meal prep insights and achievements</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Total Recipes Cooked */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Total Recipes Cooked</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{history.length}</div>
            <p className="text-sm text-muted-foreground mt-2">
              {thisMonthHistory.length} this month
            </p>
          </CardContent>
        </Card>

        {/* Most-Made Recipe */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Most-Made Recipe</CardTitle>
          </CardHeader>
          <CardContent>
            {mostMadeRecipe ? (
              <>
                <div className="text-xl font-semibold">{mostMadeRecipe.title}</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Made {history.filter(e => e.recipeId === mostMadeRecipe.id).length} time(s)
                </p>
              </>
            ) : (
              <p className="text-muted-foreground">No recipes cooked yet</p>
            )}
          </CardContent>
        </Card>

        {/* Average Rating */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            {averageRating ? (
              <div className="text-3xl font-bold">{averageRating}/5 ⭐</div>
            ) : (
              <p className="text-muted-foreground">No ratings yet</p>
            )}
          </CardContent>
        </Card>

        {/* Favorite Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Favorite Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-semibold">{favoriteCategory}</div>
          </CardContent>
        </Card>

        {/* Recipes by Type */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Recipes by Type</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(recipesByType).length > 0 ? (
              <div className="space-y-2">
                {Object.entries(recipesByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(recipesByType))) * 100}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No cooking history yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

