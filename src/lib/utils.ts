import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Build full media URL for paths returned by API.
 * If value is already absolute (http/https) return as-is.
 * Otherwise prepend the configured VITE_API_URL (with any trailing /api stripped)
 * or fallback to the known backend root.
 */
export function buildMediaUrl(path?: string | null) {
  if (!path) return undefined;
  // If already absolute URL (http/https) or browser blob/data URL, return as-is
  if (/^https?:\/\//i.test(path) || /^blob:|^data:/i.test(path)) return path;

  // Determine base URL from env; strip trailing /api if present
  const raw = (import.meta.env.VITE_API_URL as string) || "https://video-backend-769.azurewebsites.net";
  const base = raw.replace(/\/api\/?$/i, "");

  // Ensure leading slash on path
  const cleanedPath = path.startsWith("/") ? path : `/${path}`;

  return `${base.replace(/\/$/, "")}${cleanedPath}`;
}
