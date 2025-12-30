#!/usr/bin/env python3
"""
Fix broken conditional classes after stripping.
Patterns to fix:
- `condition && ` followed by closing paren
- `condition ? ` followed by `:`
- `condition : ` followed by closing paren
"""

import re
from pathlib import Path

def fix_file(filepath: Path) -> bool:
    """Fix broken conditionals. Returns True if modified."""
    content = filepath.read_text()
    original = content

    # Fix: `condition && ` followed by newline and closing paren/bracket
    # Replace with empty string
    content = re.sub(r'(\w+)\s+&&\s+\n\s*\)', '', content)

    # Fix: `condition ? ` followed by newline and `:` (ternary with empty true branch)
    content = re.sub(r'(\w+|\))\s+\?\s+\n\s*:\s+\n', r'', content)

    # Fix: `: ` followed by newline and closing paren (ternary with empty false branch)
    content = re.sub(r':\s+\n\s*\)', ')', content)

    # Fix standalone empty lines with just commas
    content = re.sub(r'^\s*,\s*$', '', content, flags=re.MULTILINE)

    if content != original:
        filepath.write_text(content)
        return True
    return False

def main():
    repo_root = Path(__file__).parent
    nextjs_root = repo_root / "nextjs" / "src"

    # Scan all TSX files
    all_files = list((nextjs_root / "components").rglob("*.tsx"))
    all_files.extend((nextjs_root / "app").rglob("*.tsx"))

    fixed = 0
    for filepath in all_files:
        if fix_file(filepath):
            fixed += 1
            rel_path = str(filepath.relative_to(repo_root))
            if len(rel_path) > 60:
                rel_path = "..." + rel_path[-57:]
            print(f"✓ Fixed {rel_path}")

    print(f"\nFixed {fixed} files")

if __name__ == "__main__":
    main()
