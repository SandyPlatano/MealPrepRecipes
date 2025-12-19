"use client";

import { useState, useRef, useEffect } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selectionRef = useRef<{ start: number; end: number } | null>(null);

  // Store selection when textarea is focused
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleSelectionChange = () => {
      selectionRef.current = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd,
      };
    };

    textarea.addEventListener("select", handleSelectionChange);
    textarea.addEventListener("keyup", handleSelectionChange);
    textarea.addEventListener("mouseup", handleSelectionChange);

    return () => {
      textarea.removeEventListener("select", handleSelectionChange);
      textarea.removeEventListener("keyup", handleSelectionChange);
      textarea.removeEventListener("mouseup", handleSelectionChange);
    };
  }, []);

  const insertMarkdown = (prefix: string, suffix: string = "", e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Use stored selection or current selection
    const start = selectionRef.current?.start ?? textarea.selectionStart;
    const end = selectionRef.current?.end ?? textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText =
      value.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      value.substring(end);
    
    onChange(newText);

    // Reset cursor position after state update
    setTimeout(() => {
      textarea.focus();
      const newPos = start + prefix.length + selectedText.length + suffix.length;
      textarea.setSelectionRange(newPos, newPos);
      selectionRef.current = { start: newPos, end: newPos };
    }, 0);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Toolbar */}
      <div className="flex items-center gap-1 border rounded-md p-1 bg-muted/50">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={(e) => insertMarkdown("**", "**", e)}
          onMouseDown={(e) => e.preventDefault()}
          title="Bold"
        >
          <Bold className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={(e) => insertMarkdown("*", "*", e)}
          onMouseDown={(e) => e.preventDefault()}
          title="Italic"
        >
          <Italic className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={(e) => insertMarkdown("## ", "", e)}
          onMouseDown={(e) => e.preventDefault()}
          title="Heading"
        >
          <Heading2 className="size-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={(e) => insertMarkdown("[", "](url)", e)}
          onMouseDown={(e) => e.preventDefault()}
          title="Link"
        >
          <Link2 className="size-4" />
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
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          maxLength={maxLength}
          className="font-mono text-sm"
        />
      )}
    </div>
  );
}
