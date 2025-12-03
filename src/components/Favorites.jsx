import { Card, CardContent } from './ui/card';
import { useRecipes } from '../context/RecipeContext';
import RecipeCard from './RecipeCard';

export default function Favorites() {
  const { getFavoriteRecipes } = useRecipes();
  const favoriteRecipes = getFavoriteRecipes();

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-6">
          <h2 className="text-2xl font-bold mb-2">Favorite Recipes</h2>
          <p className="text-muted-foreground">
            {favoriteRecipes.length === 0
              ? 'No favorite recipes yet. Click the heart icon on any recipe to add it here.'
              : `You have ${favoriteRecipes.length} favorite recipe${favoriteRecipes.length !== 1 ? 's' : ''}.`}
          </p>
        </CardContent>
      </Card>

      {favoriteRecipes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favoriteRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  );
}

