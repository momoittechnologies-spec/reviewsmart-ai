import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export function formatRating(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return "0.0";
  return val.toFixed(1);
}

export function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL && process.env.NEXT_PUBLIC_APP_URL.trim() !== "") {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL && process.env.VERCEL_PROJECT_PRODUCTION_URL.trim() !== "") {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL.replace(/\/$/, "")}`;
  }
  return "https://reviewsmart.online";
}

export interface ParsedPhone {
  raw: string;
  display: string;
  tel: string;
  clean10: string;
}

export function parsePhoneNumbers(phoneStr: string | null | undefined): ParsedPhone[] {
  if (!phoneStr) return [];
  // Split on delimiters like '/', ',', '&', '|', or words like 'and', ';'
  const parts = phoneStr
    .split(/[\/,;&|]+|\s+and\s+/i)
    .map((p) => p.trim())
    .filter(Boolean);

  const results: ParsedPhone[] = [];
  const seen = new Set<string>();

  for (const part of parts) {
    const digits = part.replace(/\D/g, "");
    if (digits.length < 7) continue;

    const clean10 = digits.length >= 10 ? digits.slice(-10) : digits;
    if (seen.has(clean10)) continue;
    seen.add(clean10);

    let telNumber = digits;
    if (telNumber.length === 10 && !part.startsWith("+")) {
      telNumber = `+91${telNumber}`;
    } else if (part.startsWith("+")) {
      telNumber = `+${digits}`;
    }

    let display = part;
    if (digits.length === 10 && !part.startsWith("+")) {
      display = `+91 ${digits}`;
    }

    results.push({
      raw: part,
      display,
      tel: `tel:${telNumber}`,
      clean10,
    });
  }

  return results;
}
