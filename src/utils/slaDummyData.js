// src/utils/slaDummyData.js
// Simple dummy SLA data generator. Exports `fetchSlaData` which returns
// an object shaped for the SLA cards: { teamInfo, incidents, response, resolve }
// Data varies with the date range and teamId so changing the range will change results.

function daysBetween(start, end) {
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((e - s) / msPerDay) + 1);
}

function hashStringTo01(s) {
  // very small deterministic hash -> [0,1)
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h % 1000) / 1000;
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}

export async function fetchSlaData({ start, end, teamId } = {}) {
  // simulate network latency
  await new Promise((r) => setTimeout(r, 120));

  const days = daysBetween(start, end);
  const seedStr = `${start?.toString() || ""}-${end?.toString() || ""}-${
    teamId || "all"
  }`;
  const rand = hashStringTo01(seedStr);

  // Team sizing
  const baseTeamSize = teamId
    ? 3 + Math.round(rand * 4)
    : 8 + Math.round(rand * 6);
  const active = Math.max(1, Math.round(baseTeamSize * (0.6 + 0.3 * rand)));

  // Incident generation - larger teams produce more incidents per day
  const perDay = teamId ? 1.5 + rand * 2.5 : 4 + rand * 6;
  const total = Math.max(0, Math.round(perDay * days));

  // Severity split (some variation)
  const critical = Math.round(total * clamp(0.05 + rand * 0.08, 0, 0.3));
  const high = Math.round(total * clamp(0.18 + (1 - rand) * 0.15, 0, 0.6));
  const medium = Math.max(0, total - critical - high);

  // Response metrics
  // responsePercent increases slightly for shorter ranges and with better random seed
  const responsePercent = Math.round(
    clamp(60 + (1 - rand) * 30 + (7 - days) * 0.6, 20, 99)
  );
  const avgMinutes = Number(
    clamp(5 + (1 - rand) * 12 - days * 0.1, 1, 180).toFixed(1)
  );

  // Resolve metrics
  const resolvePercent = Math.round(clamp(50 + rand * 35 - days * 0.4, 10, 99));
  const avgHours = Number(
    clamp(2 + (1 - rand) * 10 + days * 0.2, 0.5, 240).toFixed(1)
  );

  return {
    teamInfo: { size: baseTeamSize, active },
    incidents: { total, critical, high, medium },
    response: { percent: responsePercent, avgMinutes },
    resolve: { percent: resolvePercent, avgHours },
  };
}

export default fetchSlaData;
