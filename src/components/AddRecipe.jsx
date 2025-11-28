import { useState } from 'react';
import { createMarkdownRecipe } from '../utils/recipeParser';

const AddRecipe = ({ onRecipeAdded }) => {
  const [formData, setFormData] = useState({
    title: '',
    proteinType: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: '',
    instructions: '',
    tags: ''
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Recipe title is required';
    }

    if (!formData.proteinType.trim()) {
      newErrors.proteinType = 'Protein type is required';
    }

    if (!formData.prepTime.trim()) {
      newErrors.prepTime = 'Prep time is required';
    } else if (!/^\d+/.test(formData.prepTime)) {
      newErrors.prepTime = 'Prep time must start with a number';
    }

    if (!formData.cookTime.trim()) {
      newErrors.cookTime = 'Cook time is required';
    } else if (!/^\d+/.test(formData.cookTime)) {
      newErrors.cookTime = 'Cook time must start with a number';
    }

    if (!formData.servings.trim()) {
      newErrors.servings = 'Servings is required';
    } else if (!/^\d+/.test(formData.servings)) {
      newErrors.servings = 'Servings must be a number';
    }

    if (!formData.ingredients.trim()) {
      newErrors.ingredients = 'At least one ingredient is required';
    }

    if (!formData.instructions.trim()) {
      newErrors.instructions = 'Instructions are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Parse ingredients and instructions
    const ingredientsArray = formData.ingredients
      .split('\n')
      .map(ing => ing.trim())
      .filter(ing => ing.length > 0);

    const instructionsArray = formData.instructions
      .split('\n')
      .map(inst => inst.trim())
      .filter(inst => inst.length > 0);

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    // Create recipe object
    const recipe = {
      title: formData.title,
      proteinType: formData.proteinType,
      prepTime: formData.prepTime,
      cookTime: formData.cookTime,
      servings: formData.servings,
      ingredients: ingredientsArray,
      instructions: instructionsArray,
      tags: tagsArray
    };

    // Generate markdown
    const markdown = createMarkdownRecipe(recipe);

    // In a real app, this would save to a file
    // For now, we'll just call the callback and show success
    console.log('New Recipe Markdown:');
    console.log(markdown);

    if (onRecipeAdded) {
      onRecipeAdded({ ...recipe, id: Date.now() });
    }

    // Show success message
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);

    // Reset form
    setFormData({
      title: '',
      proteinType: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      ingredients: '',
      instructions: '',
      tags: ''
    });
    setErrors({});
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Recipe</h2>

      {showSuccess && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          Recipe successfully added! Check the console for the generated markdown.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Recipe Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Recipe Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="e.g., Grilled Lemon Chicken"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
        </div>

        {/* Protein Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Protein Type *
          </label>
          <input
            type="text"
            value={formData.proteinType}
            onChange={(e) => handleChange('proteinType', e.target.value)}
            placeholder="e.g., Chicken, Beef, Salmon, Tofu, Vegetarian"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.proteinType
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
          {errors.proteinType && (
            <p className="mt-1 text-sm text-red-600">{errors.proteinType}</p>
          )}
        </div>

        {/* Time and Servings Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prep Time *
            </label>
            <input
              type="text"
              value={formData.prepTime}
              onChange={(e) => handleChange('prepTime', e.target.value)}
              placeholder="e.g., 15 minutes"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.prepTime
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
            />
            {errors.prepTime && (
              <p className="mt-1 text-sm text-red-600">{errors.prepTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cook Time *
            </label>
            <input
              type="text"
              value={formData.cookTime}
              onChange={(e) => handleChange('cookTime', e.target.value)}
              placeholder="e.g., 30 minutes"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.cookTime
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
            />
            {errors.cookTime && (
              <p className="mt-1 text-sm text-red-600">{errors.cookTime}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Servings *
            </label>
            <input
              type="text"
              value={formData.servings}
              onChange={(e) => handleChange('servings', e.target.value)}
              placeholder="e.g., 4"
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.servings
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:ring-purple-500'
              }`}
            />
            {errors.servings && (
              <p className="mt-1 text-sm text-red-600">{errors.servings}</p>
            )}
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ingredients * (one per line)
          </label>
          <textarea
            value={formData.ingredients}
            onChange={(e) => handleChange('ingredients', e.target.value)}
            placeholder="2 lbs chicken breast&#10;1 cup soy sauce&#10;2 tbsp honey&#10;3 cloves garlic, minced"
            rows="6"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.ingredients
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
          {errors.ingredients && (
            <p className="mt-1 text-sm text-red-600">{errors.ingredients}</p>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instructions * (one step per line)
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => handleChange('instructions', e.target.value)}
            placeholder="Preheat oven to 400°F&#10;Mix marinade ingredients&#10;Marinate chicken for 30 minutes&#10;Bake for 25-30 minutes"
            rows="8"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
              errors.instructions
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-300 focus:ring-purple-500'
            }`}
          />
          {errors.instructions && (
            <p className="mt-1 text-sm text-red-600">{errors.instructions}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tags (comma-separated, optional)
          </label>
          <input
            type="text"
            value={formData.tags}
            onChange={(e) => handleChange('tags', e.target.value)}
            placeholder="e.g., quick, healthy, meal-prep-friendly"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
        >
          Add Recipe
        </button>
      </form>

      <p className="mt-4 text-sm text-gray-600">
        * Required fields. The markdown file will be created in the /recipes directory.
      </p>
    </div>
  );
};

export default AddRecipe;
