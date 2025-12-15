"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, CheckCircle2, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";

interface FinalizeActionsProps {
  weekStartStr: string;
}

export function FinalizeActions({ weekStartStr }: FinalizeActionsProps) {
  const router = useRouter();

  const handleBackToEdit = () => {
    router.push(`/app/plan?week=${weekStartStr}`);
  };

  const handleEditShoppingList = () => {
    router.push("/app/shop");
  };

  const handleFinalize = () => {
    router.push(`/app/confirmation?week=${weekStartStr}`);
  };

  return (
    <Card className="border-t-2 border-primary/20 sticky bottom-0 md:bottom-4 z-10 shadow-lg">
      <CardContent className="p-3 md:p-4 pb-safe">
        {/* Desktop Layout */}
        <div className="hidden md:flex items-center gap-3">
          {/* Back button */}
          <Button variant="ghost" onClick={handleBackToEdit}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Edit Plan
          </Button>

          <div className="flex-1" />

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEditShoppingList}>
              <ShoppingCart className="h-4 w-4 mr-2" />
              Edit Shopping List
            </Button>

            <Button onClick={handleFinalize}>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Finalize Plan
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex items-center gap-2">
          {/* Back button - icon only on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBackToEdit}
            className="h-11 w-11 flex-shrink-0"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1" />

          {/* Edit Shopping List - icon only */}
          <Button
            variant="outline"
            size="icon"
            onClick={handleEditShoppingList}
            className="h-11 w-11 flex-shrink-0"
          >
            <ShoppingCart className="h-5 w-5" />
          </Button>

          {/* Primary action - prominent */}
          <Button onClick={handleFinalize} className="h-11 px-4 flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            <span className="font-medium">Finalize</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

