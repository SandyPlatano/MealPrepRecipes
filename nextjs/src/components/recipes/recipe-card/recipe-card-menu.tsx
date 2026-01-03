import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  UtensilsCrossed,
  Share2,
  FolderPlus,
  ChefHat,
  Edit,
  Download,
  Trash2,
} from "lucide-react";

interface RecipeCardMenuProps {
  recipeId: string;
  onStartCooking: () => void;
  onShare: (e: React.MouseEvent) => void;
  onAddToFolder?: () => void;
  onMarkCooked: () => void;
  onEdit: () => void;
  onExportPDF: (e: React.MouseEvent) => void;
  onDelete: () => void;
}

export function RecipeCardMenu({
  recipeId,
  onStartCooking,
  onShare,
  onAddToFolder,
  onMarkCooked,
  onEdit,
  onExportPDF,
  onDelete,
}: RecipeCardMenuProps) {
  return (
    <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="size-8 rounded-full bg-black/50 backdrop-blur-sm text-white/80 hover:text-white hover:bg-black/70 shadow-lg ring-1 ring-white/20"
            aria-label="More actions"
          >
            <MoreVertical className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={onStartCooking}>
            <UtensilsCrossed className="size-4 mr-2" />
            Start Cooking
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onShare}>
            <Share2 className="size-4 mr-2" />
            Share Recipe
          </DropdownMenuItem>
          {onAddToFolder && (
            <DropdownMenuItem onClick={onAddToFolder}>
              <FolderPlus className="size-4 mr-2" />
              Add to Folders
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={onMarkCooked}>
            <ChefHat className="size-4 mr-2" />
            Mark as Cooked
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="size-4 mr-2" />
            Edit Recipe
          </DropdownMenuItem>
          <DropdownMenuItem onClick={onExportPDF}>
            <Download className="size-4 mr-2" />
            Export as PDF
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="size-4 mr-2" />
            Delete Recipe
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
