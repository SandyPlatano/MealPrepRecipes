#!/usr/bin/env python3
"""
Strip decorative Tailwind classes from TSX files.
Keeps only structural/layout classes.
"""

import re
import sys
from pathlib import Path

# Patterns to REMOVE
REMOVE_PATTERNS = [
    # Colors
    r'\bbg-[^\s"\']+',
    r'\btext-(?!xs\b|sm\b|base\b|lg\b|xl\b|2xl\b|3xl\b|4xl\b|5xl\b|6xl\b|7xl\b|8xl\b|9xl\b)[^\s"\']+',
    r'\bfill-[^\s"\']+',
    r'\bstroke-[^\s"\']+',
    r'\bfrom-[^\s"\']+',
    r'\bto-[^\s"\']+',
    r'\bvia-[^\s"\']+',

    # Borders
    r'\bborder-(?!t\b|r\b|b\b|l\b|x\b|y\b|s\b|e\b)[^\s"\']+',
    r'\bring-[^\s"\']+',
    r'\boutline-[^\s"\']+',
    r'\bdivide-[^\s"\']+',

    # Effects
    r'\bshadow-[^\s"\']+',
    r'\bdrop-shadow-[^\s"\']+',
    r'\brounded-[^\s"\']+',

    # Typography
    r'\bfont-(?!mono\b)[^\s"\']+',
    r'\btracking-[^\s"\']+',
    r'\bleading-[^\s"\']+',

    # Spacing (except for specific layout needs)
    r'\bp-\d+',
    r'\bpx-\d+',
    r'\bpy-\d+',
    r'\bpt-\d+',
    r'\bpr-\d+',
    r'\bpb-\d+',
    r'\bpl-\d+',
    r'\bm-\d+',
    r'\bmx-\d+',
    r'\bmy-\d+',
    r'\bmt-\d+',
    r'\bmr-\d+',
    r'\bmb-\d+',
    r'\bml-\d+',
    r'\bgap-\d+',
    r'\bspace-x-\d+',
    r'\bspace-y-\d+',

    # Transitions
    r'\btransition-[^\s"\']+',
    r'\bduration-[^\s"\']+',
    r'\bease-[^\s"\']+',
    r'\bdelay-[^\s"\']+',

    # Animations
    r'\banimate-[^\s"\']+',

    # Transforms
    r'\bscale-[^\s"\']+',
    r'\brotate-[^\s"\']+',
    r'\btranslate-[^\s"\']+',
    r'\bskew-[^\s"\']+',
    r'\btransform\b',

    # Filters
    r'\bblur-[^\s"\']+',
    r'\bbrightness-[^\s"\']+',
    r'\bcontrast-[^\s"\']+',
    r'\bbackdrop-[^\s"\']+',

    # Opacity & Blending
    r'\bopacity-[^\s"\']+',
    r'\bmix-blend-[^\s"\']+',

    # State variants with decorative classes
    r'\bhover:[^\s"\']*(?:bg|text|border|shadow|opacity|scale|rotate|translate|ring|outline)[^\s"\']*',
    r'\bfocus:[^\s"\']*(?:bg|text|border|shadow|opacity|scale|rotate|translate|ring|outline)[^\s"\']*',
    r'\bactive:[^\s"\']*(?:bg|text|border|shadow|opacity|scale|rotate|translate|ring|outline)[^\s"\']*',
    r'\bgroup-hover:[^\s"\']*(?:bg|text|border|shadow|opacity|scale|rotate|translate|ring|outline)[^\s"\']*',
    r'\bfocus-visible:[^\s"\']*(?:bg|text|border|shadow|opacity|scale|rotate|translate|ring|outline)[^\s"\']*',
    r'\bdisabled:[^\s"\']*(?:bg|text|border|shadow|opacity)[^\s"\']*',
    r'\bdark:[^\s"\']*(?:bg|text|border|shadow|ring|outline)[^\s"\']*',
]

def clean_classname(classname: str) -> str:
    """Remove decorative classes from a className string."""
    classes = classname.split()
    kept_classes = []

    for cls in classes:
        # Check if this class matches any remove pattern
        should_remove = False
        for pattern in REMOVE_PATTERNS:
            if re.match(pattern, cls):
                should_remove = True
                break

        if not should_remove:
            kept_classes.append(cls)

    return ' '.join(kept_classes)

def process_file(filepath: Path) -> tuple[bool, int]:
    """Process a single file. Returns (was_modified, num_changes)."""
    try:
        content = filepath.read_text()
        original_content = content
        changes = 0

        # Match className="..." and className={...}
        def replace_classname(match):
            nonlocal changes
            full_match = match.group(0)

            # Extract the classes content
            classes = match.group(1)

            cleaned = clean_classname(classes)

            if cleaned != classes:
                changes += 1

            # Return empty if no classes left
            if not cleaned.strip():
                return ''

            # Return with original quote style
            return f'className="{cleaned}"'

        # Pattern for className="..."
        content = re.sub(
            r'className="([^"]*)"',
            replace_classname,
            content
        )

        # Fix empty className attributes
        content = re.sub(r'\s+className=""', '', content)

        if content != original_content:
            filepath.write_text(content)
            return True, changes

        return False, 0

    except Exception as e:
        print(f"Error processing {filepath}: {e}", file=sys.stderr)
        import traceback
        traceback.print_exc()
        return False, 0

def main():
    repo_root = Path(__file__).parent
    nextjs_root = repo_root / "nextjs" / "src"

    # Find all TSX files in components and app
    component_files = list((nextjs_root / "components").rglob("*.tsx"))
    app_files = list((nextjs_root / "app").rglob("*.tsx"))

    all_files = component_files + app_files

    print(f"Found {len(all_files)} TSX files to process")

    total_modified = 0
    total_changes = 0

    for filepath in all_files:
        was_modified, changes = process_file(filepath)
        if was_modified:
            total_modified += 1
            total_changes += changes
            rel_path = str(filepath.relative_to(repo_root))
            if len(rel_path) > 60:
                rel_path = "..." + rel_path[-57:]
            print(f"✓ {rel_path} ({changes} changes)")

    print(f"\nComplete! Modified {total_modified} files with {total_changes} total changes")

if __name__ == "__main__":
    main()
