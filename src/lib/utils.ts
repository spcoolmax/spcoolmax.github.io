import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Extract first image URL from Markdown content
export function extractFirstImageFromMarkdown(md: string): string | null {
  const mdImg = /!\[[^\]]*\]\(([^)\s]+)(?:\s+\"[^\"]*\")?\)/.exec(md);
  if (mdImg && mdImg[1]) return sanitizeUrl(mdImg[1]);
  const htmlImg = /<img[^>]+src=["']([^"']+)["'][^>]*>/i.exec(md);
  if (htmlImg && htmlImg[1]) return sanitizeUrl(htmlImg[1]);
  return null;
}

function sanitizeUrl(url: string): string {
  const cleaned = url.replace(/[)"']+$/g, "");
  if (cleaned.startsWith("/")) return cleaned;
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return cleaned;
}
