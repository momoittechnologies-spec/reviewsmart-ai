/**
 * Universal Branding Configuration for ReviewSmart AI Physical Printing Materials.
 * Defines the mandatory global branding footer across all formats:
 * Standees, A4 Posters, A3 Posters, Flyers, and PVC Cards.
 */

export const UNIVERSAL_BRANDING_LINE = "Powered by - MOMO IT TECHNOLOGIES | KADAPA";
export const VERIFIED_PARTNER_LINE = "✨ ReviewSmart AI • Verified Google Partner";

export interface PrintThemeColors {
  id: string;
  name: string;
  accent: string;
  bg: string;
  innerBorder: string;
  text: string;
  subtext: string;
}

/**
 * Draws the universal 2-line branding footer on an HTML5 Canvas at 300 DPI.
 * Line 1: Verified Partner badge
 * Line 2: Mandatory "Powered by - MOMO IT TECHNOLOGIES | KADAPA" line
 */
export function drawCanvasUniversalFooter(
  ctx: CanvasRenderingContext2D,
  centerX: number,
  partnerLineY: number,
  brandingLineY: number,
  theme: PrintThemeColors,
  options?: {
    partnerFontSize?: number;
    brandingFontSize?: number;
    partnerText?: string;
  }
) {
  const partnerFontSize = options?.partnerFontSize || 24;
  const brandingFontSize = options?.brandingFontSize || 21;
  const partnerText = options?.partnerText || VERIFIED_PARTNER_LINE;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // Line 1: Verified Partner / ReviewSmart AI
  ctx.fillStyle = theme.accent;
  ctx.font = `bold ${partnerFontSize}px -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`;
  ctx.fillText(partnerText, centerX, partnerLineY);

  // Line 2: Universal MOMO IT TECHNOLOGIES Branding
  ctx.fillStyle =
    theme.id === "pearl-gold"
      ? "#334155"
      : "rgba(255, 255, 255, 0.78)";
  ctx.font = `800 ${brandingFontSize}px 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, monospace`;
  ctx.fillText(UNIVERSAL_BRANDING_LINE, centerX, brandingLineY);

  ctx.restore();
}
