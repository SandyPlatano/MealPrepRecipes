import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import {
  Trash2,
  Check,
  RefreshCw,
  Copy,
  Cookie,
  BookOpen,
  Store,
  MoreVertical,
  Route,
  RotateCcw,
  Mail,
} from "lucide-react";
import { STORE_FLOW_ORDER } from "@/types/shopping-list";

interface ActionsToolbarProps {
  // Counts
  pantryCount: number;
  checkedCount: number;

  // State
  showPantryItems: boolean;
  showRecipeSources: boolean;
  storeMode: boolean;
  isSendingPlan: boolean;
  isGenerating: boolean;
  hasCategoryOrder: boolean;

  // Handlers
  onTogglePantry: () => void;
  onToggleRecipeSources: (checked: boolean) => void | Promise<void>;
  onToggleStoreMode: () => void;
  onSendPlan: () => void | Promise<void>;
  onClearAll: () => void;
  onCopyToClipboard: () => void | Promise<void>;
  onGenerateFromPlan: () => void | Promise<void>;
  onSortForStore: () => void;
  onResetOrder: () => void;
  onClearChecked: () => void | Promise<void>;

  // Conditionals
  hasPlannedRecipes: boolean;
}

export function ActionsToolbar({
  pantryCount,
  checkedCount,
  showPantryItems,
  showRecipeSources,
  storeMode,
  isSendingPlan,
  isGenerating,
  hasCategoryOrder,
  onTogglePantry,
  onToggleRecipeSources,
  onToggleStoreMode,
  onSendPlan,
  onClearAll,
  onCopyToClipboard,
  onGenerateFromPlan,
  onSortForStore,
  onResetOrder,
  onClearChecked,
  hasPlannedRecipes,
}: ActionsToolbarProps) {
  return (
    <div className="flex gap-2">
      {/* Main action buttons - evenly distributed */}
      <div className="flex gap-2 flex-1">
        {/* Email Meal Plan - Primary */}
        {hasPlannedRecipes && (
          <Button
            variant="outline"
            className="flex-1 rounded-full border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"
            onClick={onSendPlan}
            disabled={isSendingPlan}
          >
            <Mail className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">{isSendingPlan ? "Emailing..." : "Email Meal Plan"}</span>
            <span className="sm:hidden">{isSendingPlan ? "..." : "Email"}</span>
          </Button>
        )}

        {/* Show Pantry Items */}
        {pantryCount > 0 && (
          <Button
            variant={showPantryItems ? "default" : "outline"}
            className={`flex-1 rounded-full ${showPantryItems ? "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90" : "border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"}`}
            onClick={onTogglePantry}
          >
            <Cookie className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">
              {showPantryItems ? "Hide" : "Show"} Pantry ({pantryCount})
            </span>
            <span className="sm:hidden">
              Pantry ({pantryCount})
            </span>
          </Button>
        )}

        {/* Show Recipe Sources Toggle */}
        <div className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-full border border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-800">
          <BookOpen className="h-4 w-4 text-gray-700 dark:text-gray-300" />
          <span className="text-sm hidden sm:inline text-gray-900 dark:text-gray-100">Sources</span>
          <Switch
            checked={showRecipeSources}
            onCheckedChange={onToggleRecipeSources}
            className="h-5 w-9"
          />
        </div>

        {/* Store Mode Toggle */}
        <Button
          variant={storeMode ? "default" : "outline"}
          className={`flex-1 rounded-full ${storeMode ? "bg-[#1A1A1A] hover:bg-[#1A1A1A]/90" : "border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"}`}
          onClick={onToggleStoreMode}
        >
          <Store className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">
            {storeMode ? "Exit Store" : "Store Mode"}
          </span>
          <span className="sm:hidden">
            {storeMode ? "Exit" : "Store"}
          </span>
        </Button>

        {/* Clear All Items */}
        <Button
          variant="outline"
          className="flex-1 rounded-full border-gray-300 text-gray-900 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-100"
          onClick={onClearAll}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Clear All</span>
          <span className="sm:hidden">Clear</span>
        </Button>
      </div>

      {/* Three-Dot Menu - Secondary Actions (fixed width) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onCopyToClipboard}>
            <Copy className="h-4 w-4 mr-2" />
            Copy List
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onGenerateFromPlan} disabled={isGenerating}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
            Refresh from Meal Plan
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onSortForStore}>
            <Route className="h-4 w-4 mr-2" />
            Sort for Store
          </DropdownMenuItem>
          {hasCategoryOrder && (
            <DropdownMenuItem onClick={onResetOrder}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset Category Order
            </DropdownMenuItem>
          )}
          {checkedCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onClearChecked}>
                <Check className="h-4 w-4 mr-2" />
                Clear Checked ({checkedCount})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
