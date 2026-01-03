import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImportStatus {
  url: string;
  status: "pending" | "processing" | "success" | "error";
  error?: string;
}

interface ImportProgressProps {
  statuses: ImportStatus[];
}

export function ImportProgress({ statuses }: ImportProgressProps) {
  const completedCount = statuses.filter(
    (s) => s.status === "success" || s.status === "error"
  ).length;

  return (
    <div className="flex flex-col gap-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">Importing recipes...</span>
        <span className="text-muted-foreground">
          {statuses.filter((s) => s.status === "success").length} /{" "}
          {statuses.length} complete
        </span>
      </div>
      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 bg-primary/60 rounded-full animate-pulse" />
        Please keep this page open while importing
      </p>
      <Progress value={(completedCount / statuses.length) * 100} />
      <div className="flex flex-col gap-2">
        {statuses.map((status, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            {status.status === "pending" && (
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
            )}
            {status.status === "processing" && (
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            )}
            {status.status === "success" && (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            )}
            {status.status === "error" && (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span
              className={cn(
                "truncate flex-1",
                status.status === "error" && "text-red-500"
              )}
            >
              {new URL(status.url).hostname}
            </span>
            {status.error && (
              <span className="text-xs text-red-500 truncate max-w-[150px]">
                {status.error}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
