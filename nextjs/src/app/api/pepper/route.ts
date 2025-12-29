import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PEPPER_SYSTEM_PROMPT, buildPepperContextMessage } from "@/lib/ai/pepper-prompt";
import { searchRecipes, addToMealPlan, addToShoppingList, getRecipeDetails } from "@/app/actions/pepper";
import type { PepperContext, PepperRecipeSummary, PepperPantryItem, PepperMealHistory, PepperAction } from "@/types/pepper";

// Type for meal assignment from Supabase query with nested recipe relation
// Note: Supabase returns nested relations as arrays even for single items
interface MealAssignmentDB {
  day: string;
  meal_type: string | null;
  recipe_id: string;
  recipes: { title: string }[] | { title: string } | null;
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

// Tool definitions for Claude
const PEPPER_TOOLS = [
  {
    name: "search_recipes",
    description: "Search the user's recipe collection by ingredients, tags, or text query. Returns matching recipes with details.",
    input_schema: {
      type: "object",
      properties: {
        ingredients: {
          type: "array",
          items: { type: "string" },
          description: "List of ingredients to search for (e.g., ['chicken', 'broccoli'])",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description: "Recipe tags to filter by (e.g., ['quick', 'healthy'])",
        },
        query: {
          type: "string",
          description: "Text search query for recipe titles",
        },
      },
    },
  },
  {
    name: "add_to_meal_plan",
    description: "Add a specific recipe to the user's meal plan for a given day and meal type.",
    input_schema: {
      type: "object",
      properties: {
        recipe_id: {
          type: "string",
          description: "The ID of the recipe to add (from search results)",
        },
        day: {
          type: "string",
          enum: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
          description: "Day of the week to add the recipe",
        },
        meal_type: {
          type: "string",
          enum: ["breakfast", "lunch", "dinner", "snack"],
          description: "Type of meal",
        },
      },
      required: ["recipe_id", "day", "meal_type"],
    },
  },
  {
    name: "add_to_shopping_list",
    description: "Add ingredients or items to the user's shopping list.",
    input_schema: {
      type: "object",
      properties: {
        items: {
          type: "array",
          items: { type: "string" },
          description: "List of items to add (e.g., ['chicken breast', 'olive oil', 'garlic'])",
        },
      },
      required: ["items"],
    },
  },
  {
    name: "get_recipe_details",
    description: "Get full details of a specific recipe including ingredients and instructions.",
    input_schema: {
      type: "object",
      properties: {
        recipe_id: {
          type: "string",
          description: "The ID of the recipe to get details for",
        },
      },
      required: ["recipe_id"],
    },
  },
];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { message, session_id } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get user's household
    const { data: membership } = await supabase
      .from("household_members")
      .select("household_id")
      .eq("user_id", user.id)
      .single();

    if (!membership) {
      return NextResponse.json({ error: "Household not found" }, { status: 400 });
    }

    const householdId = membership.household_id;

    // Get or create session
    let currentSessionId = session_id;

    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          household_id: householdId,
          title: `Chat ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single();

      if (sessionError) {
        console.error("Failed to create session:", sessionError);
        return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
      }

      currentSessionId = newSession.id;
    }

    // Save user message
    await supabase.from("chat_messages").insert({
      session_id: currentSessionId,
      role: "user",
      content: message,
      metadata: {},
    });

    // Gather context for Pepper
    const context = await gatherPepperContext(supabase, user.id, householdId, currentSessionId);

    // Build messages for Claude
    const contextMessage = buildPepperContextMessage(context);

    // Get recent conversation history
    const conversationHistory = context.recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Build messages array
    const messages = [
      // Inject context as first exchange
      { role: "user", content: `Here's my current context:\n\n${contextMessage}` },
      { role: "assistant", content: "Got it! I'm ready to help with your cooking adventure. What's on your mind?" },
      // Previous conversation
      ...conversationHistory,
      // Current message
      { role: "user", content: message },
    ];

    // Call Claude API with tools
    const { pepperResponse, actions } = await callClaudeWithTools(messages, currentSessionId);

    if (!pepperResponse) {
      // Save error message and return fallback
      const fallbackContent = "Oops! I'm having a little trouble thinking right now. Give me a moment and try again?";

      const { data: assistantMsg } = await supabase
        .from("chat_messages")
        .insert({
          session_id: currentSessionId,
          role: "assistant",
          content: fallbackContent,
          metadata: { error: "Claude API error" },
        })
        .select()
        .single();

      return NextResponse.json({
        session_id: currentSessionId,
        message: assistantMsg || {
          id: `error-${Date.now()}`,
          content: fallbackContent,
          role: "assistant",
          metadata: {},
          created_at: new Date().toISOString(),
        },
      });
    }

    // Save assistant message
    const { data: assistantMsg, error: assistantMsgError } = await supabase
      .from("chat_messages")
      .insert({
        session_id: currentSessionId,
        role: "assistant",
        content: pepperResponse,
        metadata: {
          model: "claude-sonnet-4-5-20250929",
          actions_taken: actions,
        },
      })
      .select()
      .single();

    if (assistantMsgError) {
      console.error("Failed to save assistant message:", assistantMsgError);
    }

    return NextResponse.json({
      session_id: currentSessionId,
      message: assistantMsg || {
        id: `resp-${Date.now()}`,
        content: pepperResponse,
        role: "assistant",
        metadata: { actions_taken: actions },
        created_at: new Date().toISOString(),
      },
      actions_taken: actions,
    });
  } catch (error) {
    console.error("Pepper API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * Gather all context Pepper needs to give helpful responses
 */
async function gatherPepperContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  householdId: string,
  sessionId: string
): Promise<PepperContext> {
  // Run all queries in parallel for speed
  const [
    recipesResult,
    pantryResult,
    settingsResult,
    historyResult,
    mealPlanResult,
    messagesResult,
    householdResult,
  ] = await Promise.all([
    // User's recipes
    supabase
      .from("recipes")
      .select("id, title, ingredients, tags, cuisine, protein_type, prep_time, cook_time, servings, rating")
      .eq("household_id", householdId)
      .order("rating", { ascending: false, nullsFirst: false })
      .limit(50),

    // Pantry items
    supabase
      .from("pantry_items")
      .select("id, name, category, quantity, unit, expires_at")
      .eq("household_id", householdId)
      .limit(30),

    // User settings
    supabase
      .from("user_settings")
      .select("allergen_alerts, custom_dietary_restrictions, favorite_cuisines")
      .eq("user_id", userId)
      .single(),

    // Cooking history (last 30 days)
    supabase
      .from("cooking_history")
      .select("recipe_id, cooked_at, rating, recipes(title)")
      .eq("household_id", householdId)
      .gte("cooked_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order("cooked_at", { ascending: false })
      .limit(15),

    // Current meal plan
    supabase
      .from("meal_plans")
      .select(`
        week_start,
        meal_assignments(
          day,
          meal_type,
          recipe_id,
          recipes(title)
        )
      `)
      .eq("household_id", householdId)
      .gte("week_start", getWeekStart())
      .order("week_start", { ascending: false })
      .limit(1)
      .single(),

    // Recent messages in this session
    supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: false })
      .limit(10),

    // Household size
    supabase
      .from("household_members")
      .select("user_id")
      .eq("household_id", householdId),
  ]);

  // Build cook count map from history
  const cookCountMap = new Map<string, number>();
  for (const entry of historyResult.data || []) {
    const count = cookCountMap.get(entry.recipe_id) || 0;
    cookCountMap.set(entry.recipe_id, count + 1);
  }

  // Transform recipes
  const recipes: PepperRecipeSummary[] = (recipesResult.data || []).map((r) => ({
    id: r.id,
    title: r.title,
    ingredients: (r.ingredients || []).map((i: { name?: string }) => i.name || "").filter(Boolean),
    tags: r.tags || [],
    cuisine: r.cuisine,
    protein_type: r.protein_type,
    prep_time: r.prep_time || 15,
    cook_time: r.cook_time || 0,
    servings: r.servings || 4,
    rating: r.rating,
    times_cooked: cookCountMap.get(r.id) || 0,
  }));

  // Transform pantry
  const pantry: PepperPantryItem[] = (pantryResult.data || []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category || "Other",
    quantity: p.quantity,
    unit: p.unit,
    expires_at: p.expires_at,
  }));

  // Transform history
  const mealHistory: PepperMealHistory[] = (historyResult.data || []).map((h) => ({
    recipe_id: h.recipe_id,
    recipe_title: (h.recipes as { title?: string })?.title || "Unknown",
    cooked_at: h.cooked_at,
    rating: h.rating,
  }));

  // Build meal plan summary
  let currentMealPlan = null;
  if (mealPlanResult.data) {
    const assignments = mealPlanResult.data.meal_assignments as MealAssignmentDB[] | undefined;
    currentMealPlan = {
      week_start: mealPlanResult.data.week_start,
      assignments: (assignments || []).map((a) => {
        // Handle Supabase nested relation (can be array or object)
        const recipeData = Array.isArray(a.recipes) ? a.recipes[0] : a.recipes;
        return {
          day: a.day,
          meal_type: a.meal_type || "dinner",
          recipe_id: a.recipe_id,
          recipe_title: recipeData?.title || "Unknown",
        };
      }),
    };
  }

  // Reverse messages to get chronological order (oldest first)
  const recentMessages = (messagesResult.data || []).reverse();

  return {
    recipes,
    pantry,
    preferences: {
      dietary_restrictions: settingsResult.data?.custom_dietary_restrictions || [],
      allergens: settingsResult.data?.allergen_alerts || [],
      favorite_cuisines: settingsResult.data?.favorite_cuisines || [],
      disliked_ingredients: [],
      household_size: householdResult.data?.length || 1,
      cooking_skill_level: "intermediate",
    },
    mealHistory,
    currentMealPlan,
    recentMessages,
  };
}

/**
 * Call Claude API with tool support
 * Handles tool calls recursively until a final text response is generated
 */
async function callClaudeWithTools(
  messages: { role: string; content: string }[],
  sessionId: string,
  maxIterations: number = 3
): Promise<{ pepperResponse: string | null; actions: PepperAction[] }> {
  const actions: PepperAction[] = [];
  let currentMessages = [...messages];
  let iterations = 0;

  while (iterations < maxIterations) {
    iterations++;

    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-5-20250929",
        max_tokens: 1024,
        temperature: 0.7,
        system: PEPPER_SYSTEM_PROMPT,
        tools: PEPPER_TOOLS,
        messages: currentMessages,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("Claude API error:", error);
      return { pepperResponse: null, actions };
    }

    const data = await response.json();

    // Check if the response contains tool use
    const toolUseBlocks = data.content.filter((block: { type: string }) => block.type === "tool_use");
    const textBlocks = data.content.filter((block: { type: string }) => block.type === "text");

    if (toolUseBlocks.length === 0) {
      // No tool calls - return the text response
      const textContent = textBlocks.map((b: { text: string }) => b.text).join("\n");
      return { pepperResponse: textContent, actions };
    }

    // Handle tool calls
    const toolResults: { type: string; tool_use_id: string; content: string }[] = [];

    for (const toolCall of toolUseBlocks) {
      const { id, name, input } = toolCall;
      let result: unknown;

      try {
        switch (name) {
          case "search_recipes":
            result = await searchRecipes(input);
            if ((result as { data: unknown[] }).data) {
              actions.push({
                type: "recipe_suggested",
                timestamp: new Date().toISOString(),
              });
            }
            break;

          case "add_to_meal_plan":
            result = await addToMealPlan(input);
            if ((result as { success: boolean }).success) {
              actions.push({
                type: "added_to_plan",
                entity_id: input.recipe_id,
                timestamp: new Date().toISOString(),
              });
            }
            break;

          case "add_to_shopping_list":
            result = await addToShoppingList(input);
            if ((result as { success: boolean }).success) {
              actions.push({
                type: "added_to_shopping",
                timestamp: new Date().toISOString(),
              });
            }
            break;

          case "get_recipe_details":
            result = await getRecipeDetails(input.recipe_id);
            break;

          default:
            result = { error: `Unknown tool: ${name}` };
        }
      } catch (error) {
        console.error(`Tool ${name} error:`, error);
        result = { error: `Failed to execute ${name}` };
      }

      toolResults.push({
        type: "tool_result",
        tool_use_id: id,
        content: JSON.stringify(result),
      });
    }

    // Add assistant message with tool use
    currentMessages.push({
      role: "assistant",
      content: data.content,
    });

    // Add tool results
    currentMessages.push({
      role: "user",
      content: toolResults as unknown as string, // Claude expects this format
    });
  }

  // Max iterations reached
  console.warn("Max tool iterations reached");
  return { pepperResponse: "I got a bit lost there! Could you try asking that again?", actions };
}

/**
 * Get Monday of current week
 */
function getWeekStart(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday.toISOString().split("T")[0];
}
