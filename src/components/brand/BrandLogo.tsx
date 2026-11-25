"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface BrandLogoProps {
  variant?: "full" | "icon";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  theme?: "light" | "dark";
  href?: string;
  className?: string;
  priority?: boolean;
}

const FULL_LOGO_WIDTH = 1019;
const FULL_LOGO_HEIGHT = 194;
const ICON_SIZE = 194;

/* ─────────────────────────────────────────────────────────
   BRAND ICON — Official ReviewSmart AI Speech Bubble Mark
   Standalone cobalt speech bubble with lowercase "r" cutout.
   Used exclusively in icon-only placements.
───────────────────────────────────────────────────────── */
export function BrandIcon({
  size = "md",
  className = "",
  decorative = true,
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  decorative?: boolean;
}) {
  const sizeMap: Record<string, string> = {
    xs: "w-5 h-5",
    sm: "w-7 h-7",
    md: "w-9 h-9",
    lg: "w-11 h-11",
    xl: "w-14 h-14",
  };

  return (
    <div
      className={`relative shrink-0 select-none ${sizeMap[size]} ${className}`}
      aria-hidden={decorative ? "true" : undefined}
    >
      <Image
        src="/brand/reviewsmart-icon.webp"
        alt={decorative ? "" : "ReviewSmart AI"}
        width={ICON_SIZE}
        height={ICON_SIZE}
        className="w-full h-full object-contain drop-shadow-xs"
      />
    </div>
  );
}

/* ─────────────────────────────────────────────────────────
   BRAND LOGO — Official Full Artwork via next/image
   Preserves cropped proportions (1019x194) with height: auto
   and compact light backing on dark surfaces.
───────────────────────────────────────────────────────── */
export default function BrandLogo({
  variant = "full",
  size = "md",
  theme = "light",
  href = "/",
  className = "",
  priority = false,
}: BrandLogoProps) {
  const isDark = theme === "dark";

  const fullWidthClasses: Record<string, string> = {
    xs: "w-[132px] sm:w-[148px]",
    sm: "w-[152px] sm:w-[176px]",
    md: "w-[164px] md:w-[196px] lg:w-[205px]",
    lg: "w-[180px] sm:w-[210px]",
    xl: "w-[205px] sm:w-[240px]",
  };

  const backingPadding: Record<string, string> = {
    xs: "px-2 py-1 rounded-lg",
    sm: "px-2 py-1 rounded-xl",
    md: "px-2.5 py-1.5 rounded-xl",
    lg: "px-3 py-1.5 rounded-2xl",
    xl: "px-3.5 py-2 rounded-2xl",
  };

  const content =
    variant === "icon" ? (
      <div className={`inline-flex items-center select-none ${className}`}>
        <BrandIcon size={size} decorative={false} />
      </div>
    ) : (
      <div
        className={`inline-flex items-center max-w-full shrink-0 select-none ${
          isDark
            ? `bg-[#f8fafc] border border-white/25 shadow-sm ${backingPadding[size]}`
            : ""
        } ${className}`}
      >
        <div className={`${fullWidthClasses[size]} max-w-full shrink-0`}>
          <Image
            src="/brand/reviewsmart-logo.webp"
            alt="ReviewSmart AI"
            width={FULL_LOGO_WIDTH}
            height={FULL_LOGO_HEIGHT}
            priority={priority}
            style={{ width: "100%", height: "auto" }}
            className="block"
          />
        </div>
      </div>
    );

  if (href) {
    return (
      <Link
        href={href}
        className="group hover:opacity-95 transition-opacity inline-flex items-center shrink-0 max-w-full"
      >
        {content}
      </Link>
    );
  }

  return content;
}
