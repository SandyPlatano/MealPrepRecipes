import { useState } from 'react';
import { searchByIngredients, parseIngredientInput, getTotalTime, formatTime } from '../utils/searchUtils';

const IngredientSearch = ({ recipes }) => {
  const [ingredientInput, setIngredientInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const ingredientsList = parseIngredientInput(ingredientInput);
    if (ingredientsList.length === 0) {
      return;
    }
    const results = searchByIngredients(recipes, ingredientsList);
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleClear = () => {
    setIngredientInput('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Search by Ingredients</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="mb-2">
          <label className="block text-sm text-gray-600 mb-1">
            Enter ingredients you have (comma-separated):
          </label>
          <textarea
            value={ingredientInput}
            onChange={(e) => setIngredientInput(e.target.value)}
            placeholder="e.g., chicken, garlic, broccoli, soy sauce, honey"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Find Recipes
          </button>
          {hasSearched && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </form>

      {hasSearched && (
        <div>
          {searchResults.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No recipes found with those ingredients. Try adding more ingredients.
            </p>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Found {searchResults.length} recipe{searchResults.length !== 1 ? 's' : ''} you can make
              </p>
              <div className="space-y-4">
                {searchResults.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">
                        {recipe.title}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          recipe.matchPercentage === 100
                            ? 'bg-green-100 text-green-700'
                            : recipe.matchPercentage >= 70
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {recipe.matchPercentage}% Match
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Protein:</span>
                        {recipe.proteinType}
                      </span>
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Total Time:</span>
                        {formatTime(getTotalTime(recipe.prepTime, recipe.cookTime))}
                      </span>
                      <span className="flex items-center">
                        <span className="font-medium mr-1">Ingredients:</span>
                        {recipe.matchedCount} of {recipe.totalIngredients}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <h4 className="font-medium text-green-700 mb-1 text-sm">
                          ✓ You have ({recipe.matchedCount}):
                        </h4>
                        <p className="text-sm text-gray-600">
                          {recipe.matchedIngredients.slice(0, 3).join(', ')}
                          {recipe.matchedIngredients.length > 3 && `... +${recipe.matchedIngredients.length - 3} more`}
                        </p>
                      </div>
                      {recipe.missingIngredients.length > 0 && (
                        <div>
                          <h4 className="font-medium text-orange-700 mb-1 text-sm">
                            ✗ You need ({recipe.missingIngredients.length}):
                          </h4>
                          <p className="text-sm text-gray-600">
                            {recipe.missingIngredients.slice(0, 3).join(', ')}
                            {recipe.missingIngredients.length > 3 && `... +${recipe.missingIngredients.length - 3} more`}
                          </p>
                        </div>
                      )}
                    </div>

                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IngredientSearch;
