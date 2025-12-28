import nextPlugin from "@next/eslint-plugin-next";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import betterTailwindcss from "eslint-plugin-better-tailwindcss";
import tseslint from "typescript-eslint";

export default [
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
      "react": reactPlugin,
      "react-hooks": reactHooksPlugin,
      "jsx-a11y": jsxA11yPlugin,
      "better-tailwindcss": betterTailwindcss,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // React Hooks rules
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      // Prevent buttons without explicit type attribute (default is "submit")
      "react/button-has-type": "warn",
      // Prevent role="button" on non-interactive elements
      "jsx-a11y/no-noninteractive-element-to-interactive-role": "warn",
      // Keep existing overrides
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      // Tailwind CSS class validation (catches undefined utility classes)
      ...betterTailwindcss.configs["recommended-warn"].rules,
      // Whitelist our custom design system classes defined in globals.css
      "better-tailwindcss/no-unregistered-classes": ["warn", {
        ignore: [
          // Button classes (btn-primary, btn-secondary, btn-ghost, btn-tertiary, btn-cta)
          "^btn-.*",
          // Badge classes (badge-retro, badge-new, badge-pixel-*)
          "^badge-.*",
          // Retro design system utilities
          "^shadow-retro.*",
          // Animation classes
          "^animate-.*",
        ],
      }],
    },
    settings: {
      react: {
        version: "detect",
      },
      // Tailwind v4 uses CSS-based config via entryPoint
      "better-tailwindcss": {
        entryPoint: "src/app/globals.css",
      },
    },
  },
  {
    ignores: [".next/*", "node_modules/*"],
  },
];
