"use client";

import { useState, useEffect, useRef } from "react";

interface TerminalLine {
  text: string;
  type?: "default" | "prompt" | "success" | "highlight" | "indent";
  delay?: number;
}

interface TerminalLogProps {
  lines: TerminalLine[];
  typingSpeed?: number;
  startDelay?: number;
  showCursor?: boolean;
  loop?: boolean;
  loopDelay?: number;
  className?: string;
}

export function TerminalLog({
  lines,
  typingSpeed = 30,
  startDelay = 500,
  showCursor = true,
  loop = true,
  loopDelay = 3000,
  className = "",
}: TerminalLogProps) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [showBlinkingCursor, setShowBlinkingCursor] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const startTyping = setTimeout(() => {
      setIsTyping(true);
    }, startDelay);

    return () => clearTimeout(startTyping);
  }, [startDelay]);

  useEffect(() => {
    if (!isTyping || currentLineIndex >= lines.length) {
      if (currentLineIndex >= lines.length && loop) {
        const resetTimeout = setTimeout(() => {
          setDisplayedLines([]);
          setCurrentLineIndex(0);
          setCurrentCharIndex(0);
        }, loopDelay);
        return () => clearTimeout(resetTimeout);
      }
      return;
    }

    const currentLine = lines[currentLineIndex];
    const lineDelay = currentLine.delay ?? 0;

    if (currentCharIndex === 0 && lineDelay > 0) {
      const delayTimeout = setTimeout(() => {
        setCurrentCharIndex(1);
      }, lineDelay);
      return () => clearTimeout(delayTimeout);
    }

    if (currentCharIndex <= currentLine.text.length) {
      const typingTimeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const newLines = [...prev];
          newLines[currentLineIndex] = currentLine.text.slice(0, currentCharIndex);
          return newLines;
        });
        setCurrentCharIndex((prev) => prev + 1);
      }, typingSpeed);

      return () => clearTimeout(typingTimeout);
    } else {
      const nextLineTimeout = setTimeout(() => {
        setCurrentLineIndex((prev) => prev + 1);
        setCurrentCharIndex(0);
      }, 100);

      return () => clearTimeout(nextLineTimeout);
    }
  }, [isTyping, currentLineIndex, currentCharIndex, lines, typingSpeed, loop, loopDelay]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedLines]);

  const getLineClass = (type: TerminalLine["type"]) => {
    switch (type) {
      case "prompt":
        return "terminal-prompt";
      case "success":
        return "terminal-success";
      case "highlight":
        return "terminal-highlight";
      case "indent":
        return "pl-4 text-gray-400";
      default:
        return "";
    }
  };

  return (
    <div className={`terminal-container h-full ${className}`}>
      <div className="terminal-header">
        <div className="terminal-dot terminal-dot-red" />
        <div className="terminal-dot terminal-dot-yellow" />
        <div className="terminal-dot terminal-dot-green" />
        <span className="ml-3 text-xs text-gray-500 font-mono">recipe-import.sh</span>
      </div>
      <div ref={containerRef} className="terminal-body overflow-auto max-h-64">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`terminal-line ${getLineClass(line.type)}`}
            style={{ opacity: displayedLines[index] ? 1 : 0 }}
          >
            {line.type === "prompt" && <span className="terminal-prompt">&gt; </span>}
            {displayedLines[index] || ""}
            {showCursor &&
              index === currentLineIndex &&
              currentCharIndex <= line.text.length &&
              isTyping && <span className="terminal-cursor" />}
          </div>
        ))}
        {showCursor && currentLineIndex >= lines.length && showBlinkingCursor && (
          <div className="terminal-line">
            <span className="terminal-prompt">&gt; </span>
            <span className="terminal-cursor" />
          </div>
        )}
      </div>
    </div>
  );
}

export const DEMO_RECIPE_IMPORT_LINES: TerminalLine[] = [
  { text: "importing recipe...", type: "prompt" },
  { text: "analyzing: Classic Lasagna", type: "default", delay: 200 },
  { text: "extracting:", type: "default", delay: 150 },
  { text: "• 12 ingredients found", type: "indent", delay: 100 },
  { text: "• 6 cooking steps", type: "indent", delay: 100 },
  { text: "• 45min cook time", type: "indent", delay: 100 },
  { text: "calculating nutrition...", type: "default", delay: 200 },
  { text: "• 485 cal per serving", type: "indent", delay: 100 },
  { text: "• 28g protein", type: "indent", delay: 100 },
  { text: "✓ RECIPE IMPORTED SUCCESSFULLY", type: "success", delay: 300 },
];

export default TerminalLog;
