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
          backgroundColor: "#111111",
          backgroundImage:
            "radial-gradient(circle at 10% 20%, rgba(255, 68, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(255, 68, 0, 0.1) 0%, transparent 50%)",
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
            background: "linear-gradient(90deg, #F97316, #cc3600)",
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
            backgroundColor: "#F97316",
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
            color: "#F97316",
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
            color: "#FDFBF7",
            fontFamily: "monospace",
            marginBottom: 24,
          }}
        >
          What&apos;s for Dinner?
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: 28,
            color: "#a3a3a3",
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
            color: "#F97316",
            fontFamily: "monospace",
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
            background: "linear-gradient(90deg, #F97316, #cc3600)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
