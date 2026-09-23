import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#EE6A2B",
          borderRadius: 14,
          color: "white",
          fontSize: 46,
          fontWeight: 800,
          fontFamily: "Georgia, serif",
        }}
      >
        W
      </div>
    ),
    size,
  );
}
