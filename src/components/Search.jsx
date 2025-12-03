import { useState, useEffect, useMemo } from 'react';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useRecipes } from '../context/RecipeContext';
import { searchByProtein } from '../utils/searchUtils';
import RecipeCard from './RecipeCard';
import RecipeDetailDialog from './RecipeDetailDialog';
import { Search as SearchIcon, Plus } from 'lucide-react';

const RECIPE_TYPES = ['Dinner', 'Baking', 'Breakfast', 'Dessert', 'Snack', 'Side Dish'];

export default function Search() {
  const { recipes } = useRecipes();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleViewDetails = (recipe) => {
    setSelectedRecipe(recipe);
    setDialogOpen(true);
  };

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Get unique categories based on selected type
  const categories = useMemo(() => {
    let filtered = recipes;
    if (typeFilter !== 'all') {
      filtered = recipes.filter(r => (r.recipeType || 'Dinner') === typeFilter);
    }
    const cats = new Set(filtered.map(r => r.category || r.proteinType).filter(Boolean));
    return Array.from(cats).sort();
  }, [recipes, typeFilter]);

  // Reset category filter when type changes
  useEffect(() => {
    setCategoryFilter('all');
  }, [typeFilter]);

  // Filter recipes
  const filteredRecipes = useMemo(() => {
    let filtered = recipes;

    // Filter by recipe type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(r => (r.recipeType || 'Dinner') === typeFilter);
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(r => (r.category || r.proteinType) === categoryFilter);
    }

    // Search by name/category (real-time)
    if (debouncedQuery.trim()) {
      filtered = searchByProtein(filtered, debouncedQuery);
    }

    return filtered;
  }, [recipes, typeFilter, categoryFilter, debouncedQuery]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Search Recipes</CardTitle>
          <CardDescription>Find recipes by type, proteins, or search term</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {RECIPE_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Proteins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Proteins</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div>
        {filteredRecipes.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="flex flex-col items-center gap-3">
                {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all' ? (
                  <SearchIcon className="h-12 w-12 text-muted-foreground opacity-50" />
                ) : (
                  <Plus className="h-12 w-12 text-muted-foreground opacity-50" />
                )}
                <p className="text-muted-foreground">
                  {searchQuery || typeFilter !== 'all' || categoryFilter !== 'all'
                    ? 'No recipes found matching your search.'
                    : 'No recipes yet. Add your first recipe to get started!'}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecipes.map(recipe => (
              <RecipeCard 
                key={recipe.id} 
                recipe={recipe} 
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </div>

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

