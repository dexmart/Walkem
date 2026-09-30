import { ImageResponse } from "next/og";
import { logoMarkDataUrl } from "@/lib/brand";

// Square Walkem logo tile shown for any product that has no photo yet.
export const dynamic = "force-static";

export async function GET() {
  const logo = await logoMarkDataUrl();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFFFFF 0%, #F6EBDD 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={560} height={560} alt="" />
      </div>
    ),
    { width: 800, height: 800 },
  );
}
