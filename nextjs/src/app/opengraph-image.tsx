import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Babe, What's for Dinner? - Meal Planning Made Simple";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFCF6",
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: "#D9F99D",
          }}
        />

        {/* Icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 120,
            height: 120,
            borderRadius: 24,
            backgroundColor: "#D9F99D",
            marginBottom: 32,
            fontSize: 64,
          }}
        >
          🍽️
        </div>

        {/* App name - Babe, */}
        <div
          style={{
            fontSize: 72,
            fontStyle: "italic",
            color: "#1A1A1A",
            marginBottom: -8,
          }}
        >
          Babe,
        </div>

        {/* App name - What's for Dinner? */}
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            color: "#1A1A1A",
            marginBottom: 24,
          }}
        >
          What&apos;s for Dinner?
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#6B7280",
          }}
        >
          Finally, an answer. Meal planning made simple.
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 40,
            fontSize: 20,
            fontWeight: 600,
            color: "#1A1A1A",
          }}
        >
          babewfd.com
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            backgroundColor: "#D9F99D",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
