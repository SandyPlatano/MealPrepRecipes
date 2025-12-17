"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { Clock, Users, ExternalLink } from "lucide-react";
import type { RecipeWithNutrition } from "@/types/recipe";
import type { RecipeNutrition } from "@/types/nutrition";

interface RecipeExportPreviewProps {
  recipe: RecipeWithNutrition & { nutrition?: RecipeNutrition | null };
  includeImage?: boolean;
}

/**
 * Hidden component that renders recipe in export-friendly format
 * Used as capture target for image/PDF generation
 *
 * Note: This component renders off-screen and should be wrapped
 * in a container with `position: absolute; left: -9999px`
 */
export const RecipeExportPreview = forwardRef<HTMLDivElement, RecipeExportPreviewProps>(
  function RecipeExportPreview({ recipe, includeImage = true }, ref) {
    const n = recipe.nutrition;
    const hasNutrition = n && (n.calories || n.protein_g || n.carbs_g || n.fat_g);

    return (
      <div
        ref={ref}
        className="bg-white text-black"
        style={{
          width: "800px",
          padding: "48px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Recipe Image */}
        {includeImage && recipe.image_url && (
          <div
            style={{
              width: "100%",
              height: "300px",
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              marginBottom: "24px",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={recipe.image_url}
              alt={recipe.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
              crossOrigin="anonymous"
            />
          </div>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: "32px",
            fontWeight: "700",
            marginBottom: "16px",
            fontFamily: "ui-monospace, monospace",
            lineHeight: "1.2",
          }}
        >
          {recipe.title}
        </h1>

        {/* Metadata Row */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "24px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          {recipe.recipe_type && (
            <span
              style={{
                padding: "4px 12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "6px",
              }}
            >
              {recipe.recipe_type}
            </span>
          )}
          {recipe.category && (
            <span
              style={{
                padding: "4px 12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "6px",
              }}
            >
              {recipe.category}
            </span>
          )}
          {recipe.protein_type && (
            <span
              style={{
                padding: "4px 12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "6px",
              }}
            >
              {recipe.protein_type}
            </span>
          )}
        </div>

        {/* Time & Servings */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "24px",
            marginBottom: "32px",
            fontSize: "14px",
            color: "#666",
          }}
        >
          {recipe.prep_time && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} />
              <span>Prep: {recipe.prep_time}</span>
            </div>
          )}
          {recipe.cook_time && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Clock size={16} />
              <span>Cook: {recipe.cook_time}</span>
            </div>
          )}
          {recipe.servings && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Users size={16} />
              <span>{recipe.servings}</span>
            </div>
          )}
        </div>

        {/* Two Column Layout */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "280px 1fr",
            gap: "32px",
            marginBottom: "32px",
          }}
        >
          {/* Ingredients */}
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "16px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              Ingredients
            </h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recipe.ingredients.map((ingredient, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    marginBottom: "8px",
                    fontSize: "14px",
                    lineHeight: "1.5",
                  }}
                >
                  <span
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#9ca3af",
                      marginTop: "7px",
                      flexShrink: 0,
                    }}
                  />
                  <span>{ingredient}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: "600",
                marginBottom: "16px",
                paddingBottom: "8px",
                borderBottom: "2px solid #e5e7eb",
              }}
            >
              Instructions
            </h2>
            <ol style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recipe.instructions.map((instruction, index) => (
                <li
                  key={index}
                  style={{
                    display: "flex",
                    gap: "12px",
                    marginBottom: "16px",
                    fontSize: "14px",
                    lineHeight: "1.6",
                  }}
                >
                  <span
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      backgroundColor: "#f3f4f6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: "600",
                      fontSize: "12px",
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </span>
                  <span style={{ paddingTop: "4px" }}>{instruction}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* Nutrition Facts */}
        {hasNutrition && (
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          >
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "12px",
              }}
            >
              Nutrition Facts (per serving)
            </h3>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "24px",
                fontSize: "14px",
              }}
            >
              {n?.calories && (
                <div>
                  <span style={{ fontWeight: "600" }}>{Math.round(n.calories)}</span>
                  <span style={{ color: "#666", marginLeft: "4px" }}>cal</span>
                </div>
              )}
              {n?.protein_g && (
                <div>
                  <span style={{ fontWeight: "600" }}>{n.protein_g}g</span>
                  <span style={{ color: "#666", marginLeft: "4px" }}>protein</span>
                </div>
              )}
              {n?.carbs_g && (
                <div>
                  <span style={{ fontWeight: "600" }}>{n.carbs_g}g</span>
                  <span style={{ color: "#666", marginLeft: "4px" }}>carbs</span>
                </div>
              )}
              {n?.fat_g && (
                <div>
                  <span style={{ fontWeight: "600" }}>{n.fat_g}g</span>
                  <span style={{ color: "#666", marginLeft: "4px" }}>fat</span>
                </div>
              )}
              {n?.fiber_g && (
                <div>
                  <span style={{ fontWeight: "600" }}>{n.fiber_g}g</span>
                  <span style={{ color: "#666", marginLeft: "4px" }}>fiber</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notes */}
        {recipe.notes && (
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "8px",
              }}
            >
              Notes
            </h3>
            <p
              style={{
                fontSize: "14px",
                lineHeight: "1.6",
                color: "#4b5563",
                whiteSpace: "pre-wrap",
              }}
            >
              {recipe.notes}
            </p>
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <h3
              style={{
                fontSize: "14px",
                fontWeight: "600",
                marginBottom: "8px",
                color: "#6b7280",
              }}
            >
              Tags
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  style={{
                    padding: "4px 10px",
                    backgroundColor: "#e5e7eb",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#4b5563",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Source URL */}
        {recipe.source_url && (
          <div
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              marginBottom: "24px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <ExternalLink size={12} />
              Source: {recipe.source_url}
            </span>
          </div>
        )}

        {/* Branding Footer */}
        <div
          style={{
            borderTop: "1px solid #e5e7eb",
            paddingTop: "16px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: "12px",
              color: "#9ca3af",
              margin: 0,
            }}
          >
            Made with MealPrep
          </p>
        </div>
      </div>
    );
  }
);
