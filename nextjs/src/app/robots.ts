import { MetadataRoute } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://babewfd.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/app/",
          "/api/",
          "/auth/",
          "/settings/",
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
