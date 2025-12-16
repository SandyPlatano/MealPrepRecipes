import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit-redis";

export const dynamic = "force-dynamic";

// Block internal/private IP ranges and localhost to prevent SSRF attacks
function isBlockedUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost and loopback
    if (
      hostname === "localhost" ||
      hostname === "127.0.0.1" ||
      hostname.startsWith("127.") ||
      hostname === "::1" ||
      hostname === "0.0.0.0"
    ) {
      return true;
    }
    
    // Block private IP ranges
    const privateRanges = [
      /^10\./,                    // 10.0.0.0/8
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./, // 172.16.0.0/12
      /^192\.168\./,              // 192.168.0.0/16
      /^169\.254\./,              // 169.254.0.0/16 (link-local)
      /^fc00:/,                   // IPv6 private
      /^fe80:/,                   // IPv6 link-local
    ];
    
    for (const range of privateRanges) {
      if (range.test(hostname)) {
        return true;
      }
    }
    
    // Block non-HTTP(S) protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return true;
    }
    
    return false;
  } catch {
    return true;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting: 30 requests per hour per user
    const rateLimitResult = await rateLimit({
      identifier: `scrape-url-${user.id}`,
      limit: 30,
      windowMs: 60 * 60 * 1000, // 1 hour
    });

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Rate limit exceeded. Try again later.",
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

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Validate URL
    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
    }

    // Check for SSRF vulnerabilities
    if (isBlockedUrl(url)) {
      return NextResponse.json(
        { error: "Access to this URL is not permitted" },
        { status: 403 }
      );
    }

    // Fetch the URL
    const response = await fetch(url, {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (compatible; MealPrepRecipeBot/1.0; +https://github.com/meal-prep)",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL: ${response.status} ${response.statusText}` },
        { status: 400 }
      );
    }

    const html = await response.text();

    // CRITICAL: Extract and preserve JSON-LD scripts BEFORE removing other scripts
    // JSON-LD contains structured recipe data (ingredients, instructions) that parse-recipe needs
    const jsonLdScripts: string[] = [];
    const jsonLdPattern = /<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/gi;
    let jsonLdMatch;
    while ((jsonLdMatch = jsonLdPattern.exec(html)) !== null) {
      jsonLdScripts.push(jsonLdMatch[0]);
    }

    // Clean scripts and styles from HTML
    let cleanedHtml = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    cleanedHtml = cleanedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
    cleanedHtml = cleanedHtml.replace(/<!--[\s\S]*?-->/g, ""); // Remove comments

    // Re-inject preserved JSON-LD scripts so parse-recipe can extract schema
    if (jsonLdScripts.length > 0) {
      cleanedHtml = jsonLdScripts.join("\n") + "\n" + cleanedHtml;
    }

    // Try to find common recipe sections with improved patterns
    const recipePatterns = [
      // Look for recipe schema markup first (most accurate)
      /<script[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?"@type"\s*:\s*"Recipe"[\s\S]*?<\/script>/i,
      // Main recipe containers
      /<article[^>]*>[\s\S]*?<\/article>/i,
      /<div[^>]*id="[^"]*recipe[^"]*"[^>]*>[\s\S]{100,}<\/div>/i,
      /<div[^>]*class="[^"]*recipe[^"]*"[^>]*>[\s\S]{100,}<\/div>/i,
      // Common recipe site patterns
      /<div[^>]*class="[^"]*recipe-content[^"]*"[^>]*>[\s\S]{100,}<\/div>/i,
      /<div[^>]*class="[^"]*recipe-body[^"]*"[^>]*>[\s\S]{100,}<\/div>/i,
      /<section[^>]*class="[^"]*recipe[^"]*"[^>]*>[\s\S]{100,}<\/section>/i,
      /<main[^>]*>[\s\S]{100,}<\/main>/i,
    ];

    let recipeHtml = cleanedHtml;
    for (const pattern of recipePatterns) {
      const match = cleanedHtml.match(pattern);
      if (match) {
        recipeHtml = match[0];
        break;
      }
    }

    // Preserve structure while converting HTML to readable text
    // This maintains ingredient lists and instruction formatting
    let text = recipeHtml;

    // Convert common recipe structure elements to preserved text
    text = text.replace(/<li[^>]*>/gi, "\n• ");
    text = text.replace(/<\/li>/gi, "");
    text = text.replace(/<br\s*\/?>/gi, "\n");
    text = text.replace(/<p[^>]*>/gi, "\n");
    text = text.replace(/<\/p>/gi, "");
    text = text.replace(/<div[^>]*>/gi, "\n");
    text = text.replace(/<\/div>/gi, "");
    text = text.replace(/<h[1-6][^>]*>/gi, "\n");
    text = text.replace(/<\/h[1-6]>/gi, "\n");
    text = text.replace(/<span[^>]*>/gi, "");
    text = text.replace(/<\/span>/gi, "");
    text = text.replace(/<strong[^>]*>/gi, "");
    text = text.replace(/<\/strong>/gi, "");
    text = text.replace(/<em[^>]*>/gi, "");
    text = text.replace(/<\/em>/gi, "");
    text = text.replace(/<ul[^>]*>/gi, "\n");
    text = text.replace(/<\/ul>/gi, "\n");
    text = text.replace(/<ol[^>]*>/gi, "\n");
    text = text.replace(/<\/ol>/gi, "\n");

    // Remove remaining HTML tags
    text = text.replace(/<[^>]+>/g, " ");

    // Clean up whitespace while preserving structure
    text = text.replace(/\n\s+/g, "\n"); // Remove trailing spaces after newlines
    text = text.replace(/\s+\n/g, "\n"); // Remove leading spaces before newlines
    text = text.replace(/\n+/g, "\n"); // Remove multiple newlines
    text = text.replace(/[ \t]+/g, " "); // Collapse multiple spaces
    text = text.trim();

    return NextResponse.json({
      html: recipeHtml.substring(0, 20000), // Increased limit for better recipe extraction
      text: text.substring(0, 15000), // Increased limit to preserve formatting
      url,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to scrape URL",
      },
      { status: 500 }
    );
  }
}
