import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { useRecipes } from '../context/RecipeContext';
import { useSettings } from '../context/SettingsContext';
import { parseRecipeWithClaude, parseRecipeFromHTML } from '../utils/anthropicService';
import { fetchRecipeFromURL } from '../utils/urlScraper';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function AddRecipe() {
  const { addRecipe } = useRecipes();
  const { settings } = useSettings();
  const [mode, setMode] = useState('text');
  const [rawText, setRawText] = useState('');
  const [url, setUrl] = useState('');
  const [parsedRecipe, setParsedRecipe] = useState(null);
  const [editableRecipe, setEditableRecipe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleParseText = async () => {
    if (!rawText.trim()) {
      toast.error('Please enter recipe text');
      return;
    }

    if (!settings.anthropicApiKey) {
      toast.error('Please set your Anthropic API key in Settings');
      return;
    }

    setLoading(true);
    try {
      const parsed = await parseRecipeWithClaude(rawText, settings.anthropicApiKey);
      setParsedRecipe(parsed);
      setEditableRecipe(parsed);
      setShowPreview(true);
      toast.success('Recipe parsed successfully! Review and edit if needed.');
    } catch (error) {
      toast.error(`Failed to parse recipe: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchFromURL = async () => {
    if (!url.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    if (!settings.anthropicApiKey) {
      toast.error('Please set your Anthropic API key in Settings');
      return;
    }

    setLoading(true);
    try {
      // Fetch HTML from URL
      const html = await fetchRecipeFromURL(url);
      
      // Parse with Claude
      const parsed = await parseRecipeFromHTML(html, url, settings.anthropicApiKey);
      setParsedRecipe(parsed);
      setEditableRecipe(parsed);
      setShowPreview(true);
      toast.success('Recipe fetched and parsed! Review and edit if needed.');
    } catch (error) {
      toast.error(`Failed to fetch recipe: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!editableRecipe || !editableRecipe.title) {
      toast.error('Please parse a recipe first');
      return;
    }

    const newRecipe = addRecipe(editableRecipe);
    toast.success(`Recipe "${newRecipe.title}" added!`);
    
    // Reset form
    setRawText('');
    setUrl('');
    setParsedRecipe(null);
    setEditableRecipe(null);
    setShowPreview(false);
  };

  const updateEditableField = (field, value) => {
    setEditableRecipe(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add New Recipe</CardTitle>
          <CardDescription>Paste recipe text or import from a URL</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={setMode}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="text">Free-form Text</TabsTrigger>
              <TabsTrigger value="url">Import from URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="text" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="recipe-text">Recipe Text</Label>
                <Textarea
                  id="recipe-text"
                  placeholder="Paste your recipe here. For example:&#10;Grilled Lemon Chicken&#10;Ingredients: 2 lbs chicken breast, 2 tbsp honey, 1 lemon...&#10;Instructions: Marinate chicken, grill for 10 minutes..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>
              <Button onClick={handleParseText} disabled={loading || !rawText.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Parsing...
                  </>
                ) : (
                  'Parse with AI'
                )}
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div>
                <Label htmlFor="recipe-url">Recipe URL</Label>
                <Input
                  id="recipe-url"
                  type="url"
                  placeholder="https://example.com/recipe"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Works with most recipe websites. If the site blocks access, copy the recipe text and use the free-form input instead.
                </p>
              </div>
              <Button onClick={handleFetchFromURL} disabled={loading || !url.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Fetching...
                  </>
                ) : (
                  'Fetch & Parse Recipe'
                )}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showPreview && editableRecipe && (
        <Card>
          <CardHeader>
            <CardTitle>Review & Edit Recipe</CardTitle>
            <CardDescription>Make any corrections before saving</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">Recipe Title</Label>
              <Input
                id="title"
                value={editableRecipe.title}
                onChange={(e) => updateEditableField('title', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="recipeType">Recipe Type</Label>
                <Input
                  id="recipeType"
                  value={editableRecipe.recipeType || 'Dinner'}
                  onChange={(e) => updateEditableField('recipeType', e.target.value)}
                  placeholder="Dinner, Baking, Breakfast, etc."
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={editableRecipe.category || editableRecipe.proteinType || ''}
                  onChange={(e) => {
                    updateEditableField('category', e.target.value);
                    updateEditableField('proteinType', e.target.value);
                  }}
                  placeholder="Chicken, Cookies, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="servings">Servings</Label>
                <Input
                  id="servings"
                  value={editableRecipe.servings}
                  onChange={(e) => updateEditableField('servings', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="prep">Prep Time</Label>
                <Input
                  id="prep"
                  value={editableRecipe.prepTime}
                  onChange={(e) => updateEditableField('prepTime', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="cook">Cook Time</Label>
                <Input
                  id="cook"
                  value={editableRecipe.cookTime}
                  onChange={(e) => updateEditableField('cookTime', e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="ingredients">Ingredients (one per line)</Label>
              <Textarea
                id="ingredients"
                value={editableRecipe.ingredients.join('\n')}
                onChange={(e) => updateEditableField('ingredients', e.target.value.split('\n').filter(Boolean))}
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="instructions">Instructions (one per line)</Label>
              <Textarea
                id="instructions"
                value={editableRecipe.instructions.join('\n')}
                onChange={(e) => updateEditableField('instructions', e.target.value.split('\n').filter(Boolean))}
                rows={8}
              />
            </div>

            <div>
              <Label htmlFor="tags">Tags (comma-separated)</Label>
              <Input
                id="tags"
                value={editableRecipe.tags?.join(', ') || ''}
                onChange={(e) => updateEditableField('tags', e.target.value.split(',').map(t => t.trim()).filter(Boolean))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSave} className="flex-1">
                Save Recipe
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowPreview(false);
                  setEditableRecipe(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
