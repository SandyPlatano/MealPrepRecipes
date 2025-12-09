import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@/lib/supabase/server";
import { generateShoppingListHTML, generateShoppingListText } from "@/lib/email/shopping-list-template";
import { markMealPlanAsSent } from "@/app/actions/meal-plans";
import { rateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authentication
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || !user.email) {
      return NextResponse.json(
        { error: "Not authenticated. Please sign in to send emails." },
        { status: 401 }
      );
    }

    // Rate limiting: 10 emails per hour per user (prevent email spam)
    const rateLimitResult = rateLimit({
      identifier: `send-email-${user.id}`,
      limit: 10,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Too many emails sent. Try again later.",
          retryAfter: Math.ceil((rateLimitResult.reset - Date.now()) / 1000),
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": rateLimitResult.limit.toString(),
            "X-RateLimit-Remaining": rateLimitResult.remaining.toString(),
            "X-RateLimit-Reset": rateLimitResult.reset.toString(),
            "Retry-After": Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const body = await request.json();
    const { weekRange, items, weekStart } = body;

    // Use the authenticated user's email
    const recipientEmail = user.email;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: "Assign everyone first. No free rides." },
        { status: 400 }
      );
    }

    // Normalize items to expected format
    // Expected format: { recipe: { title: string, ingredients: string[] }, cook: string, day: string }
    const normalizedItems = items.map((item: unknown) => {
      // Handle object items
      if (typeof item === 'object' && item !== null) {
        const obj = item as Record<string, unknown>;
        
        // Already in correct format
        if (obj.recipe && typeof obj.recipe === 'object') {
          const recipe = obj.recipe as Record<string, unknown>;
          return {
            recipe: {
              title: String(recipe.title || 'Untitled Recipe'),
              ingredients: Array.isArray(recipe.ingredients) ? recipe.ingredients.map(String) : [],
            },
            cook: obj.cook ? String(obj.cook) : null,
            day: obj.day ? String(obj.day) : null,
          };
        }
        
        // Simple format with just name/title
        if (obj.name || obj.title) {
          return {
            recipe: {
              title: String(obj.name || obj.title || 'Untitled Recipe'),
              ingredients: Array.isArray(obj.ingredients) ? obj.ingredients.map(String) : [],
            },
            cook: obj.cook ? String(obj.cook) : null,
            day: obj.day ? String(obj.day) : null,
          };
        }
      }
      
      // Fallback for string items
      if (typeof item === 'string') {
        return {
          recipe: { title: item, ingredients: [] },
          cook: null,
          day: null,
        };
      }
      
      // Default fallback
      return {
        recipe: { title: 'Unknown Item', ingredients: [] },
        cook: null,
        day: null,
      };
    });

    // Enhanced logging for testing
    console.log("\n" + "=".repeat(60));
    console.log("📧 EMAIL SENDING TEST");
    console.log("=".repeat(60));
    console.log("👤 Logged-in User ID:", user.id);
    console.log("📨 Recipient Email:", recipientEmail);
    console.log("📮 From Email:", process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev");
    console.log("📅 Week Range:", weekRange);
    console.log("🍽️  Number of Meals:", normalizedItems.length);
    console.log("=".repeat(60) + "\n");

    // Generate HTML and text versions
    const html = generateShoppingListHTML({ weekRange: weekRange || "This Week", items: normalizedItems });
    const text = generateShoppingListText({ weekRange: weekRange || "This Week", items: normalizedItems });

    console.log("📤 Sending email to Resend API...");

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      to: recipientEmail,
      subject: `Your Meal Plan & Shopping List - ${weekRange}`,
      html,
      text,
    });

    if (emailError) {
      console.log("\n❌ RESEND API ERROR:");
      console.error("Failed to send email:", emailError);
      console.log("=".repeat(60) + "\n");
      return NextResponse.json(
        { error: `Couldn't send email: ${emailError.message || 'Unknown error'}` },
        { status: 500 }
      );
    }

    // Log success
    console.log("\n✅ RESEND API SUCCESS!");
    console.log("📧 Email ID:", emailData?.id);
    console.log("📨 Sent To:", recipientEmail);
    console.log("💡 Check Resend Dashboard: https://resend.com/logs");
    console.log("=".repeat(60) + "\n");

    // Mark the meal plan as sent if weekStart is provided
    if (weekStart) {
      await markMealPlanAsSent(weekStart);
    }

    return NextResponse.json({
      success: true,
      message: `Boom. Plan sent to ${recipientEmail}!`,
      emailId: emailData?.id,
      sentTo: recipientEmail,
    });
  } catch (error) {
    console.error("Error sending shopping list email:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Something went wrong: ${errorMessage}` },
      { status: 500 }
    );
  }
}
