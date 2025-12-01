// src/utils/slaDummyData.js
// Simple dummy SLA data generator. Exports `fetchSlaData` which returns
// an object shaped for the SLA cards: { teamInfo, incidents, response, resolve }
// Data varies with the date range and teamId so changing the range will change results.

export function daysBetween(start, end) {
  const s = new Date(start).setHours(0, 0, 0, 0);
  const e = new Date(end).setHours(0, 0, 0, 0);
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.max(1, Math.round((e - s) / msPerDay) + 1);
}

function hashStringTo01(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return (h % 1000) / 1000; // → between 0–1
}

function clamp(v, lo, hi) {
  return Math.max(lo, Math.min(hi, v));
}


// DUMMY SLA DATA GENERATOR


export async function fetchSlaData({ start, end, teamId } = {}) {
  await new Promise((r) => setTimeout(r, 120));

  const days = daysBetween(start, end);
  const seedStr = `${start?.toString() || ""}-${end?.toString() || ""}-${teamId || "all"}`;
  const rand = hashStringTo01(seedStr);

  // Team sizing
  const baseTeamSize = teamId ? 3 + Math.round(rand * 4) : 8 + Math.round(rand * 6);
  const active = Math.max(1, Math.round(baseTeamSize * (0.6 + 0.3 * rand)));

  // Incidents
  const perDay = teamId ? 1.5 + rand * 2.5 : 4 + rand * 6;
  const total = Math.max(0, Math.round(perDay * days));

  const critical = Math.round(total * clamp(0.05 + rand * 0.08, 0, 0.3));
  const high = Math.round(total * clamp(0.18 + (1 - rand) * 0.15, 0, 0.6));
  const medium = Math.max(0, total - critical - high);

  // Response
  const responsePercent = Math.round(
    clamp(60 + (1 - rand) * 30 + (7 - days) * 0.6, 20, 99)
  );
  const avgMinutes = Number(
    clamp(5 + (1 - rand) * 12 - days * 0.1, 1, 180).toFixed(1)
  );

  // Resolve
  const resolvePercent = Math.round(
    clamp(50 + rand * 35 - days * 0.4, 10, 99)
  );
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


// newly added part eka - sasini

const namePool = [
  "Nilupul Tharanga",
  "Santhush Dewmith",
  "Chamal Jayawardana",
  "Chamika Perera",
  "Tharushi Madushani",
  "Udari Hansika",
  "Sewwandi Dissanayake",
  "Malsha Wickramasinghe",
  "Ravindu Perera",
  "Sandun Liyanage",
  "Kasun Jayawardena",
  "Lakshan Fernando",
  "Sahan Madusanka",
  "Nuwan Karunaratne",
  "Mithila Senevirathne",
  "Tharushi Dissanayake",
  "Sandaruwan Abeysinghe",
  "Kasun Chathuranga",
  "Nimasha Ruwandika",
  "Dulaj Siriwardena"
];

function padSvc(n) {
  return `SVC-${2000 + n}`;
}

export async function fetchTechnicianData({ start, end, teamId }) {
  await new Promise((r) => setTimeout(r, 120));

  // Same seed logic as SLA data — ensures SAME team size
  const days = daysBetween(start, end);
  const seedStr = `${start}-${end}-${teamId || "all"}`;
  const rand = hashStringTo01(seedStr);

  const baseTeamSize = teamId
    ? 3 + Math.round(rand * 4)
    : 8 + Math.round(rand * 6);

  const activeCount = Math.max(
    1,
    Math.round(baseTeamSize * (0.6 + 0.3 * rand))
  );

  const technicians = Array.from({ length: baseTeamSize }).map((_, i) => {
    const individualSeed = hashStringTo01(seedStr + i);
    const name = namePool[i % namePool.length];
    const serviceNumber = padSvc(i + 1);
    
    // Generate detailed metrics for the popup
    const totalIncidents = Math.round(individualSeed * days * 2);
    const critical = Math.round(totalIncidents * clamp(0.1 + individualSeed * 0.1, 0, 0.3));
    const high = Math.round(totalIncidents * clamp(0.2 + individualSeed * 0.15, 0, 0.4));
    const medium = Math.max(0, totalIncidents - critical - high);
    
    const responseOnTime = Math.round(totalIncidents * clamp(0.65 + individualSeed * 0.25, 0.5, 0.95));
    const avgResponseTime = Number(clamp(5 + (1 - individualSeed) * 15, 2, 30).toFixed(1));
    
    const resolutionOnTime = Math.round(totalIncidents * clamp(0.6 + individualSeed * 0.3, 0.5, 0.9));
    const avgResolutionTime = Number(clamp(1 + individualSeed * 8, 0.5, 12).toFixed(1));

    return {
      id: i + 1,
      name,
      serviceNumber,
      status: i < activeCount ? "Active" : "Inactive",
      incidents: totalIncidents,
      // Detailed metrics for popup
      totalIncidents,
      critical,
      high,
      medium,
      responseOnTime,
      avgResponseTime,
      resolutionOnTime,
      avgResolutionTime,
      date: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    };
  });

  return technicians;
}
export default fetchSlaData;
