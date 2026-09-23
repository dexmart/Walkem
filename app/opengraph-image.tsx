import { ImageResponse } from "next/og";

export const alt = "Walkem Farm Market – Authentic African & Caribbean groceries in Moncton, NB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 90px",
          background: "linear-gradient(135deg, #FAF8F5 0%, #F6EBDD 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 40 }}>
          <div
            style={{
              width: 96,
              height: 96,
              borderRadius: 22,
              background: "#EE6A2B",
              color: "white",
              fontSize: 68,
              fontWeight: 800,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            W
          </div>
          <div style={{ fontSize: 40, color: "#2E7D4F", fontWeight: 700, letterSpacing: 2 }}>MONCTON, NB</div>
        </div>
        <div style={{ fontSize: 92, fontWeight: 800, color: "#2B211C", lineHeight: 1.05 }}>Walkem Farm Market</div>
        <div style={{ fontSize: 44, color: "#EE6A2B", marginTop: 20, fontWeight: 700 }}>
          Authentic African &amp; Caribbean Groceries
        </div>
        <div style={{ fontSize: 32, color: "#6B5E57", marginTop: 28 }}>
          Yam · Plantain · Palm oil · Egusi · Spices — order on WhatsApp
        </div>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: "100%", height: 18, background: "#EE6A2B" }} />
      </div>
    ),
    size,
  );
}
