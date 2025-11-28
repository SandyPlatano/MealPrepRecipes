import { useState } from 'react';
import { searchByProtein, getTotalTime, formatTime } from '../utils/searchUtils';

const ProteinSearch = ({ recipes }) => {
  const [proteinQuery, setProteinQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    const results = searchByProtein(recipes, proteinQuery);
    setSearchResults(results);
    setHasSearched(true);
  };

  const handleClear = () => {
    setProteinQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Search by Protein Type</h2>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={proteinQuery}
            onChange={(e) => setProteinQuery(e.target.value)}
            placeholder="Enter protein type (e.g., chicken, salmon, beef, tofu)"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
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
              No recipes found for "{proteinQuery}". Try a different protein type.
            </p>
          ) : (
            <div>
              <p className="text-gray-600 mb-4">
                Found {searchResults.length} recipe{searchResults.length !== 1 ? 's' : ''} with {proteinQuery}
              </p>
              <div className="space-y-4">
                {searchResults.map((recipe) => (
                  <div
                    key={recipe.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {recipe.title}
                    </h3>
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
                        <span className="font-medium mr-1">Servings:</span>
                        {recipe.servings}
                      </span>
                    </div>
                    <div className="mb-3">
                      <h4 className="font-medium text-gray-700 mb-1">Key Ingredients:</h4>
                      <p className="text-sm text-gray-600">
                        {recipe.ingredients.slice(0, 5).join(', ')}
                        {recipe.ingredients.length > 5 && '...'}
                      </p>
                    </div>
                    {recipe.tags && recipe.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
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

export default ProteinSearch;
