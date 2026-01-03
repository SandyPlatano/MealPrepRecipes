import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Sparkles } from "lucide-react";

interface PasteInputStepProps {
  pasteText: string;
  isParsing: boolean;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
}

export function PasteInputStep({
  pasteText,
  isParsing,
  onTextChange,
  onSubmit,
}: PasteInputStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          Paste Recipe Text
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Paste any recipe text - from a website, an email, your notes,
          wherever. Our AI will turn it into a clean, organized recipe.
        </p>
        <Textarea
          placeholder="Paste your recipe here...

Example:
Grandma's Chicken Soup
Prep: 15 min | Cook: 1 hour

Ingredients:
- 2 lbs chicken thighs
- 4 cups chicken broth
- 2 carrots, diced
..."
          value={pasteText}
          onChange={(e) => onTextChange(e.target.value)}
          className="min-h-[300px] font-mono text-sm"
        />
        <Button
          onClick={onSubmit}
          disabled={isParsing || !pasteText.trim()}
          className="w-full"
        >
          {isParsing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Parsing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Parse Recipe
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
