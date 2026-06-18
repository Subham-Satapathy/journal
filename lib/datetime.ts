/** Indian Standard Time helpers — store UTC in DB, display/group in IST */

export const IST_TIMEZONE = "Asia/Kolkata";
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/** Shift a UTC instant to an IST "wall clock" Date (use UTC getters on result). */
export function toIST(date: Date): Date {
  return new Date(date.getTime() + IST_OFFSET_MS);
}

/** Detect if a date string includes timezone info. */
export function hasTimezoneInfo(val: string): boolean {
  const s = val.trim();
  if (/Z$/i.test(s)) return true;
  if (/[+-]\d{2}:?\d{2}$/.test(s)) return true;
  if (/\b(UTC|GMT|IST)\b/i.test(s)) return true;
  return false;
}

/** Broker CSV/Excel exports datetimes in UTC+2 without a timezone suffix. */
const BROKER_TZ = "+02:00";

/**
 * Parse trade date from sheet/import.
 * - Excel serial → UTC instant
 * - String with timezone (Z, +05:30, IST, etc.) → parsed as-is
 * - Plain datetime without timezone → broker server time (UTC+2)
 *   Stored as UTC; displayed/grouped in IST via Asia/Kolkata helpers.
 */
export function parseTradeDate(val: string | null | undefined): Date {
  if (!val) return new Date();
  const s = String(val).trim();
  if (!s) return new Date();

  const num = Number(s);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    return new Date((num - 25569) * 86400 * 1000);
  }

  if (hasTimezoneInfo(s)) {
    const normalized = s.replace(/\bIST\b/gi, "+05:30");
    const d = new Date(normalized);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  const normalized = s.includes("T") ? s : s.replace(" ", "T");
  const d = new Date(normalized + BROKER_TZ);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function getISTHour(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "numeric",
    hour12: false,
  }).formatToParts(date);
  return Number(parts.find((p) => p.type === "hour")?.value ?? 0);
}

/** 0 = Sunday … 6 = Saturday (IST) */
export function getISTDay(date: Date): number {
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    weekday: "short",
  }).formatToParts(date);
  const wd = parts.find((p) => p.type === "weekday")?.value ?? "Sun";
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return map[wd] ?? 0;
}

/** yyyy-MM-dd in IST */
export function getISTDateKey(date: Date): string {
  const ist = toIST(date);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const d = String(ist.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Monday-start week key yyyy-MM-dd in IST */
export function getISTWeekKey(date: Date): string {
  const ist = toIST(date);
  const dow = ist.getUTCDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(ist.getTime());
  monday.setUTCDate(ist.getUTCDate() + mondayOffset);
  const y = monday.getUTCFullYear();
  const m = String(monday.getUTCMonth() + 1).padStart(2, "0");
  const d = String(monday.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** yyyy-MM in IST */
export function getISTMonthKey(date: Date): string {
  const ist = toIST(date);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

/** UTC range covering a full IST calendar day (for DB queries). */
export function istDayRangeUTC(dateKey: string): { from: Date; to: Date } {
  const [y, m, d] = dateKey.split("-").map(Number);
  const from = new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0) - IST_OFFSET_MS);
  const to = new Date(from.getTime() + 24 * 60 * 60 * 1000 - 1);
  return { from, to };
}

export function formatTimeIST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}

export function formatDateIST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: IST_TIMEZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

/** Format an IST calendar date key (yyyy-MM-dd) for display. */
export function formatISTDateKey(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return formatDateIST(new Date(Date.UTC(y, m - 1, d, 6, 30, 0)));
}

/** e.g. Jun 17, 26 20:45 */
export function formatDateTimeIST(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const ist = toIST(d);
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const mo = months[ist.getUTCMonth()];
  const day = ist.getUTCDate();
  const yr = String(ist.getUTCFullYear()).slice(-2);
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const mm = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${mo} ${day}, ${yr} ${hh}:${mm}`;
}

/** e.g. 2026-06-17 20:45 (IST) */
export function formatDateTimeISTExport(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const ist = toIST(d);
  const y = ist.getUTCFullYear();
  const m = String(ist.getUTCMonth() + 1).padStart(2, "0");
  const day = String(ist.getUTCDate()).padStart(2, "0");
  const hh = String(ist.getUTCHours()).padStart(2, "0");
  const mm = String(ist.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm}`;
}
