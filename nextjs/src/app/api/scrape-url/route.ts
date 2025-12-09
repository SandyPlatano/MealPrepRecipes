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

    // Basic text extraction - remove scripts and styles
    let text = html.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
    text = text.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

    // Try to find common recipe sections
    const recipePatterns = [
      /<article[^>]*>[\s\S]*?<\/article>/i,
      /<div[^>]*class="[^"]*recipe[^"]*"[^>]*>[\s\S]*?<\/div>/i,
      /<main[^>]*>[\s\S]*?<\/main>/i,
    ];

    for (const pattern of recipePatterns) {
      const match = html.match(pattern);
      if (match) {
        text = match[0];
        break;
      }
    }

    // Remove HTML tags
    text = text.replace(/<[^>]+>/g, " ");

    // Clean up whitespace
    text = text.replace(/\s+/g, " ").trim();

    return NextResponse.json({
      html: html.substring(0, 15000), // Limit HTML size
      text: text.substring(0, 10000), // Limit text size
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
