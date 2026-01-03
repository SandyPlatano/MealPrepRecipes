import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MarkdownEditor } from "@/components/ui/markdown-editor";

interface ExtraDetailsSectionProps {
  sourceUrl: string;
  setSourceUrl: (value: string) => void;
  notes: string;
  setNotes: (value: string) => void;
}

export function ExtraDetailsSection({
  sourceUrl,
  setSourceUrl,
  notes,
  setNotes,
}: ExtraDetailsSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Extra Details</CardTitle>
        <CardDescription>Optional but helpful.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="sourceUrl">Source URL</Label>
          <Input
            id="sourceUrl"
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://..."
            maxLength={500}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="notes">Notes</Label>
          <MarkdownEditor
            value={notes}
            onChange={setNotes}
            placeholder="Tips, substitutions, or personal notes... Use **bold** for emphasis"
            rows={4}
            maxLength={2000}
          />
        </div>
      </CardContent>
    </Card>
  );
}
