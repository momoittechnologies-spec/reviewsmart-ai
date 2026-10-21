import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ReviewSmart AI - Smart Google Review Standees & NFC Cards";
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
          alignItems: "flex-start",
          justifyContent: "space-between",
          backgroundColor: "#090d16",
          backgroundImage:
            "radial-gradient(circle at 25% 25%, rgba(79, 70, 229, 0.3) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(16, 185, 129, 0.25) 0%, transparent 50%)",
          padding: "60px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#0f172a",
              fontWeight: 900,
              fontSize: 26,
            }}
          >
            ★
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontSize: 36, fontWeight: 900, color: "#ffffff" }}>
              Review<span style={{ color: "#818cf8" }}>Smart</span>
            </span>
            <span
              style={{
                fontSize: 16,
                fontWeight: 900,
                color: "#0f172a",
                backgroundColor: "#f59e0b",
                padding: "4px 10px",
                borderRadius: 9999,
              }}
            >
              AI
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              borderRadius: 9999,
              padding: "8px 20px",
              color: "#34d399",
              fontSize: 18,
              fontWeight: 700,
              width: "fit-content",
            }}
          >
            <span>🇮🇳 Pan-India Smart NFC Review Standees</span>
            <span>•</span>
            <span>₹2,999 Lifetime Pass</span>
          </div>

          <h1
            style={{
              fontSize: 54,
              fontWeight: 900,
              color: "#ffffff",
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Get 100+ 5-Star Google Reviews
            <br />
            in 6 Native Indian Languages
          </h1>

          <p
            style={{
              fontSize: 24,
              color: "#94a3b8",
              margin: 0,
            }}
          >
            Telugu, Hindi, English, Tamil, Kannada &amp; Malayalam &bull; Private WhatsApp Grievance Shield
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", gap: 32, color: "#cbd5e1", fontSize: 18, fontWeight: 700 }}>
            <span>⚡ 1-Tap NFC &amp; QR Standees</span>
            <span>🛡️ Negative Review Shield</span>
            <span>🆓 Free GMB Setup Included</span>
          </div>
          <span style={{ color: "#818cf8", fontSize: 20, fontWeight: 900 }}>
            www.reviewsmart.online
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
