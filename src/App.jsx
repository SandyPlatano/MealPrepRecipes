import { useState, useEffect, lazy, Suspense } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { ShoppingCart, Search as SearchIcon, Plus, BookOpen, BarChart3, Settings as SettingsIcon, Loader2 } from 'lucide-react';
import { useCart } from './context/CartContext';
import { useSettings } from './context/SettingsContext';

// Lazy load tab components for code splitting
const Search = lazy(() => import('./components/Search'));
const AddRecipe = lazy(() => import('./components/AddRecipe'));
const MyRecipes = lazy(() => import('./components/MyRecipes'));
const Stats = lazy(() => import('./components/Stats'));
const Settings = lazy(() => import('./components/Settings'));
const Cart = lazy(() => import('./components/Cart'));

// Loading fallback component
const TabLoader = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
  </div>
);

function App() {
  // Load active tab from URL hash, localStorage, or default to 'search'
  const [activeTab, setActiveTab] = useState(() => {
    // First check URL hash
    const hash = window.location.hash.slice(1); // Remove the '#'
    if (hash && ['search', 'add', 'my-recipes', 'stats', 'settings'].includes(hash)) {
      return hash;
    }
    // Then check localStorage
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab && ['search', 'add', 'my-recipes', 'stats', 'settings'].includes(savedTab)) {
      return savedTab;
    }
    // Default to search
    return 'search';
  });
  const [cartOpen, setCartOpen] = useState(false);
  const { getCartCount } = useCart();
  const { settings } = useSettings();

  // Save active tab to localStorage and URL hash whenever it changes
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
    // Only update URL hash if it doesn't match current activeTab to avoid conflicts with back button
    const currentHash = window.location.hash.slice(1);
    if (currentHash !== activeTab) {
      window.history.replaceState(null, '', `#${activeTab}`);
    }
  }, [activeTab]);

  // Listen for browser back/forward button to handle hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      // Handle empty hash (user navigated back to base URL)
      if (!hash) {
        // Default to 'search' when hash is removed
        setActiveTab('search');
        return;
      }
      // Update tab if hash is valid
      if (['search', 'add', 'my-recipes', 'stats', 'settings'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Apply dark mode on mount and when settings change
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Clean Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground font-mono">Meal Prep Recipe Manager</h1>
              <p className="text-sm text-muted-foreground mt-1">Plan, cook, and organize your meals</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={() => setCartOpen(true)}
            >
              <ShoppingCart className="h-5 w-5" />
              {getCartCount() > 0 && (
                <Badge
                  variant="default"
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {getCartCount()}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full justify-start bg-transparent h-auto p-0">
              <TabsTrigger value="search" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
                <SearchIcon className="h-4 w-4 mr-2" />
                Search
              </TabsTrigger>
              <TabsTrigger value="add" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
                <Plus className="h-4 w-4 mr-2" />
                Add Recipe
              </TabsTrigger>
              <TabsTrigger value="my-recipes" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
                <BookOpen className="h-4 w-4 mr-2" />
                My Recipes
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:border-b-2 data-[state=active]:border-foreground rounded-none">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Settings
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="search" className="mt-0">
            <Suspense fallback={<TabLoader />}>
              <Search />
            </Suspense>
          </TabsContent>
          <TabsContent value="add" className="mt-0">
            <Suspense fallback={<TabLoader />}>
              <AddRecipe />
            </Suspense>
          </TabsContent>
          <TabsContent value="my-recipes" className="mt-0">
            <Suspense fallback={<TabLoader />}>
              <MyRecipes />
            </Suspense>
          </TabsContent>
          <TabsContent value="stats" className="mt-0">
            <Suspense fallback={<TabLoader />}>
              <Stats />
            </Suspense>
          </TabsContent>
          <TabsContent value="settings" className="mt-0">
            <Suspense fallback={<TabLoader />}>
              <Settings />
            </Suspense>
          </TabsContent>
        </Tabs>
      </main>

      {/* Cart Sheet */}
      <Suspense fallback={null}>
        <Cart open={cartOpen} onOpenChange={setCartOpen} />
      </Suspense>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-auto">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-muted-foreground font-mono">
              Meal Prep Recipe Manager
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground/70">
              <span className="font-mono">v1.0.0</span>
              <span>•</span>
              <span>Built with React & Tailwind</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
