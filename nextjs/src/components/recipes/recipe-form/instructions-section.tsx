import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownEditor } from "@/components/ui/markdown-editor";
import { Plus, X } from "lucide-react";

interface InstructionsSectionProps {
  instructions: string[];
  addInstruction: () => void;
  updateInstruction: (index: number, value: string) => void;
  removeInstruction: (index: number) => void;
}

export function InstructionsSection({
  instructions,
  addInstruction,
  updateInstruction,
  removeInstruction,
}: InstructionsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Instructions</CardTitle>
        <CardDescription>
          Step by step. Make it foolproof. <span className="text-muted-foreground">(Optional)</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {instructions.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            No instructions added. Click &quot;Add Step&quot; below to add instructions, or leave empty if not needed.
          </p>
        ) : (
          instructions.map((instruction, index) => (
            <div key={index} className="flex gap-2">
              <span className="flex-shrink-0 w-6 h-10 flex items-center justify-center text-sm text-muted-foreground">
                {index + 1}.
              </span>
              <div className="flex-1">
                <MarkdownEditor
                  value={instruction}
                  onChange={(value) => updateInstruction(index, value)}
                  placeholder={`Step ${index + 1} - Use **bold** for emphasis, ## for sections`}
                  rows={3}
                  maxLength={2000}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeInstruction(index)}
                className="mt-1"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addInstruction}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
      </CardContent>
    </Card>
  );
}
