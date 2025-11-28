import { useState } from 'react';
import ProteinSearch from './components/ProteinSearch';
import IngredientSearch from './components/IngredientSearch';
import AddRecipe from './components/AddRecipe';
import { sampleRecipes } from './utils/recipeParser';

function App() {
  const [recipes, setRecipes] = useState(sampleRecipes);
  const [activeTab, setActiveTab] = useState('protein');

  const handleRecipeAdded = (newRecipe) => {
    setRecipes(prev => [...prev, newRecipe]);
    console.log('Recipe added to database:', newRecipe);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-bold">Meal Prep Recipe Manager</h1>
          <p className="mt-2 text-blue-100">Search recipes by protein or ingredients, and add your own!</p>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <nav className="flex space-x-1">
            <button
              onClick={() => setActiveTab('protein')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'protein'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Search by Protein
            </button>
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'border-b-2 border-green-600 text-green-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Search by Ingredients
            </button>
            <button
              onClick={() => setActiveTab('add')}
              className={`px-6 py-3 font-medium transition-colors ${
                activeTab === 'add'
                  ? 'border-b-2 border-purple-600 text-purple-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Add Recipe
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'protein' && <ProteinSearch recipes={recipes} />}
        {activeTab === 'ingredients' && <IngredientSearch recipes={recipes} />}
        {activeTab === 'add' && <AddRecipe onRecipeAdded={handleRecipeAdded} />}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">
              Meal Prep Recipe Manager - Your personal recipe assistant
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-sm text-gray-400">
                Currently managing {recipes.length} recipes
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
