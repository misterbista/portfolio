import { ImageResponse } from "next/og";
import { siteConfig } from "./site-config";

export const alt = `${siteConfig.name}, ${siteConfig.role}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background: "#ffffff",
          color: "#171717",
          display: "flex",
          flexDirection: "column",
          fontFamily: "monospace",
          height: "100%",
          justifyContent: "space-between",
          padding: "72px 80px",
          width: "100%",
        }}
      >
        <div
          style={{
            borderBottom: "2px solid #e9e9e9",
            display: "flex",
            fontSize: 26,
            justifyContent: "space-between",
            paddingBottom: 28,
          }}
        >
          <span>{siteConfig.name}</span>
          <span style={{ color: "#737373" }}>{siteConfig.location}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              display: "flex",
              fontSize: 84,
              letterSpacing: "-5px",
              lineHeight: 1,
              maxWidth: 900,
            }}
          >
            Reliable software for complex systems.
          </div>
          <div style={{ color: "#686868", display: "flex", fontSize: 27 }}>
            {siteConfig.role} · .NET · React · SQL · Azure
          </div>
        </div>

        <div
          style={{
            borderTop: "2px solid #e9e9e9",
            color: "#737373",
            display: "flex",
            fontSize: 22,
            paddingTop: 24,
          }}
        >
          piyushrajbista.com.np
        </div>
      </div>
    ),
    size,
  );
}

