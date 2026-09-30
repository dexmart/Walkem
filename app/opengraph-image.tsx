import { ImageResponse } from "next/og";
import { logoMarkDataUrl } from "@/lib/brand";

export const alt = "Walkem Authentic African Groceries – African & Caribbean food store in Moncton, NB";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const logo = await logoMarkDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 56,
          padding: "70px 80px",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F6EBDD 100%)",
          fontFamily: "Georgia, serif",
          position: "relative",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={340} height={340} alt="" />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ fontSize: 36, color: "#1E8B3A", fontWeight: 700, letterSpacing: 2 }}>MONCTON, NB</div>
          <div style={{ fontSize: 72, fontWeight: 800, color: "#141414", lineHeight: 1.05, marginTop: 14 }}>
            Walkem Authentic African Groceries
          </div>
          <div style={{ fontSize: 36, color: "#D7261E", marginTop: 20, fontWeight: 700 }}>African &amp; Caribbean food store</div>
          <div style={{ fontSize: 28, color: "#5B524D", marginTop: 20 }}>Yam · Plantain · Palm oil · Egusi · Spices — order on WhatsApp</div>
        </div>
        <div style={{ position: "absolute", left: 0, bottom: 0, width: "50%", height: 16, background: "#D7261E" }} />
        <div style={{ position: "absolute", right: 0, bottom: 0, width: "50%", height: 16, background: "#1E8B3A" }} />
      </div>
    ),
    size,
  );
}
