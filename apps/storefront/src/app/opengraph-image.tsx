import { ImageResponse } from "next/og";

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
          alignItems: "center",
          justifyContent: "center",
          background: "#161311",
          color: "#faf9f6",
        }}
      >
        <span style={{ fontSize: 96, letterSpacing: 24, fontWeight: 600 }}>LIKIYA</span>
      </div>
    ),
    { ...size },
  );
}
