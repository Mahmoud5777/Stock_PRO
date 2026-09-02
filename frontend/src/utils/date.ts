export function formatDate(value?: string | Date | null, withTime = false): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";

  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" };

  return new Intl.DateTimeFormat("en-GB", opts).format(date);
}

export function timeAgo(value?: string | Date | null): string {
  if (!value) return "-";
  const date = typeof value === "string" ? new Date(value) : value;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  const ranges: [number, string][] = [
    [60, "second"],
    [60, "minute"],
    [24, "hour"],
    [30, "day"],
    [12, "month"],
  ];
  let unitSeconds = seconds;
  let label = "second";
  let divisor = 1;
  for (const [range, unit] of ranges) {
    if (unitSeconds < range) {
      label = unit;
      break;
    }
    unitSeconds = Math.floor(unitSeconds / range);
    divisor *= range;
  }
  const val = Math.floor(seconds / divisor);
  return `${val} ${label}${val > 1 ? "s" : ""} ago`;
}
