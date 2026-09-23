import { ImageResponse } from "next/og";

// Square Walkem logo shown for any product that has no photo yet (same size as uploaded photos' frame).
export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FAF8F5 0%, #F6EBDD 100%)",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: 56,
            background: "#EE6A2B",
            color: "white",
            fontSize: 190,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          W
        </div>
        <div style={{ marginTop: 44, fontSize: 64, fontWeight: 800, color: "#2B211C" }}>Walkem Farm Market</div>
        <div style={{ marginTop: 12, fontSize: 34, color: "#2E7D4F", letterSpacing: 2 }}>MONCTON, NB</div>
      </div>
    ),
    { width: 800, height: 800 },
  );
}
