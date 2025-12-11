"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Link2, Heading2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder,
  rows = 4,
  maxLength,
}: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (prefix: string, suffix: string = "") => {
    const textarea = document.activeElement as HTMLTextAreaElement;
    if (textarea && textarea.tagName === "TEXTAREA") {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const newText =
        value.substring(0, start) +
        prefix +
        selectedText +
        suffix +
        value.substring(end);
      onChange(newText);

      // Reset cursor position
      setTimeout(() => {
        textarea.focus();
        const newPos = start + prefix.length + selectedText.length;
        textarea.setSelectionRange(newPos, newPos);
      }, 0);
    }
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => insertMarkdown("**", "**")}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => insertMarkdown("*", "*")}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => insertMarkdown("## ")}
          title="Heading"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={() => insertMarkdown("[", "](url)")}
          title="Link"
        >
          <Link2 className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant={showPreview ? "default" : "ghost"}
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={() => setShowPreview(!showPreview)}
        >
          {showPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div className="min-h-[100px] border rounded-md p-3 prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {value || "*No content to preview*"}
          </ReactMarkdown>
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className="font-mono text-sm"
        />
      )}

      {/* Help text */}
      <p className="text-xs text-muted-foreground">
        Supports Markdown: **bold**, *italic*, ## headings, [links](url)
      </p>
    </div>
  );
}
