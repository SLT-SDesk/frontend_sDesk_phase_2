import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";

dayjs.extend(duration);

export function calculateIncidentTimes({
  refNo,
  status,
  postedAt,
  openedAt,
  resolvedAt,
}) {
  const safeStatus = status || "";

  const created = parseDate(postedAt);
  const opened = parseDate(openedAt);
  const resolved = parseDate(resolvedAt);

  let responseTimeMs = null;
  let responseTimeLabel = "--";
  let resolutionTimeMs = null;
  let resolutionTimeLabel = "--";

  // Response time: posted -> opened (Open / In Progress / Hold / Closed)
  if (created && opened) {
    const diff = opened.diff(created);
    if (diff >= 0) {
      responseTimeMs = diff;
      responseTimeLabel = formatDuration(diff);
    }
  }

  // Resolution time: opened -> resolved (Closed only)
  if (safeStatus === "Closed" && opened && resolved) {
    const diff = resolved.diff(opened);
    if (diff >= 0) {
      resolutionTimeMs = diff;
      resolutionTimeLabel = formatDuration(diff);
    }
  }

  return {
    refNo: refNo || "",
    status: safeStatus,
    responseTimeMs,
    responseTimeLabel,
    resolutionTimeMs,
    resolutionTimeLabel,
  };
}

function parseDate(value) {
  if (!value) return null;
  const d = dayjs(value);
  return d.isValid() ? d : null;
}

export function formatDuration(ms) {
  if (ms == null || ms <= 0) return "0m";

  const d = dayjs.duration(ms);
  const parts = [];

  if (d.days()) parts.push(`${d.days()}d`);
  if (d.hours()) parts.push(`${d.hours()}h`);
  if (d.minutes()) parts.push(`${d.minutes()}m`);

  return parts.length ? parts.join(" ") : "0m";
}
