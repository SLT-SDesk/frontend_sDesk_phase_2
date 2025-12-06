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

  // Incidents - Generate counts per severity
  const perDay = teamId ? 1.5 + rand * 2.5 : 4 + rand * 6;
  const total = Math.max(0, Math.round(perDay * days));

  const critical = Math.round(total * clamp(0.05 + rand * 0.08, 0, 0.3));
  const high = Math.round(total * clamp(0.18 + (1 - rand) * 0.15, 0, 0.6));
  const medium = Math.max(0, total - critical - high);

  // ========== CRITICAL SEVERITY METRICS ==========
  // Response Time for Critical (Target: Within 15 minutes)
  const criticalResponsePercent = Math.round(
    clamp(75 + rand * 20 + (7 - days) * 0.8, 50, 99)
  );
  const criticalAvgMinutes = Number(
    clamp(3 + (1 - rand) * 7 - days * 0.15, 1, 15).toFixed(1)
  );
  const criticalResponseOnTime = Math.round(critical * (criticalResponsePercent / 100));
  const criticalResponseLate = critical - criticalResponseOnTime;
  
  // Resolution Time for Critical (Target: Within 2 hours)
  const criticalResolvePercent = Math.round(
    clamp(65 + rand * 25 - days * 0.3, 40, 99)
  );
  const criticalAvgHours = Number(
    clamp(1 + (1 - rand) * 4 + days * 0.1, 0.5, 8).toFixed(1)
  );
  const criticalResolveOnTime = Math.round(critical * (criticalResolvePercent / 100));
  const criticalResolveLate = critical - criticalResolveOnTime;

  // ========== HIGH SEVERITY METRICS ==========
  // Response Time for High (Target: Within 30 minutes)
  const highResponsePercent = Math.round(
    clamp(70 + rand * 20 + (7 - days) * 0.6, 45, 99)
  );
  const highAvgMinutes = Number(
    clamp(5 + (1 - rand) * 10 - days * 0.1, 2, 25).toFixed(1)
  );
  const highResponseOnTime = Math.round(high * (highResponsePercent / 100));
  const highResponseLate = high - highResponseOnTime;
  
  // Resolution Time for High (Target: Within 12 hours)
  const highResolvePercent = Math.round(
    clamp(60 + rand * 25 - days * 0.35, 35, 99)
  );
  const highAvgHours = Number(
    clamp(2 + (1 - rand) * 6 + days * 0.15, 1, 12).toFixed(1)
  );
  const highResolveOnTime = Math.round(high * (highResolvePercent / 100));
  const highResolveLate = high - highResolveOnTime;

  // ========== MEDIUM SEVERITY METRICS ==========
  // Response Time for Medium (Target: Within 4 hours)
  const mediumResponsePercent = Math.round(
    clamp(65 + rand * 25 + (7 - days) * 0.5, 40, 99)
  );
  const mediumAvgMinutes = Number(
    clamp(8 + (1 - rand) * 15 - days * 0.08, 3, 40).toFixed(1)
  );
  const mediumResponseOnTime = Math.round(medium * (mediumResponsePercent / 100));
  const mediumResponseLate = medium - mediumResponseOnTime;
  
  // Resolution Time for Medium (Target: Within 16 hours)
  const mediumResolvePercent = Math.round(
    clamp(55 + rand * 30 - days * 0.4, 30, 99)
  );
  const mediumAvgHours = Number(
    clamp(4 + (1 - rand) * 12 + days * 0.2, 2, 24).toFixed(1)
  );
  const mediumResolveOnTime = Math.round(medium * (mediumResolvePercent / 100));
  const mediumResolveLate = medium - mediumResolveOnTime;

  // ========== OVERALL METRICS (Aggregated) ==========
  // Calculate overall response metrics (weighted by severity)
  const totalResponseOnTime = criticalResponseOnTime + highResponseOnTime + mediumResponseOnTime;
  const totalResponseLate = criticalResponseLate + highResponseLate + mediumResponseLate;
  const responsePercent = total > 0 ? Math.round((totalResponseOnTime / total) * 100) : 0;
  
  // Weighted average response time
  const avgMinutes = total > 0 
    ? Number(((critical * criticalAvgMinutes + high * highAvgMinutes + medium * mediumAvgMinutes) / total).toFixed(1))
    : 0;

  // Calculate overall resolve metrics (weighted by severity)
  const totalResolveOnTime = criticalResolveOnTime + highResolveOnTime + mediumResolveOnTime;
  const totalResolveLate = criticalResolveLate + highResolveLate + mediumResolveLate;
  const resolvePercent = total > 0 ? Math.round((totalResolveOnTime / total) * 100) : 0;
  
  // Weighted average resolution time
  const avgHours = total > 0
    ? Number(((critical * criticalAvgHours + high * highAvgHours + medium * mediumAvgHours) / total).toFixed(1))
    : 0;

  return {
    teamInfo: { 
      size: baseTeamSize, 
      active,
      inactive: baseTeamSize - active
    },
    incidents: { 
      total, 
      critical, 
      high, 
      medium 
    },
    response: { 
      // Overall response metrics
      percent: responsePercent, 
      avgMinutes,
      onTimeCount: totalResponseOnTime,
      lateCount: totalResponseLate,
      
      // Severity-specific response data
      critical: {
        total: critical,
        percent: criticalResponsePercent,
        avgMinutes: criticalAvgMinutes,
        onTimeCount: criticalResponseOnTime,
        lateCount: criticalResponseLate,
        target: '15 min'
      },
      high: {
        total: high,
        percent: highResponsePercent,
        avgMinutes: highAvgMinutes,
        onTimeCount: highResponseOnTime,
        lateCount: highResponseLate,
        target: '30 min'
      },
      medium: {
        total: medium,
        percent: mediumResponsePercent,
        avgMinutes: mediumAvgMinutes,
        onTimeCount: mediumResponseOnTime,
        lateCount: mediumResponseLate,
        target: '4 hrs'
      }
    },
    resolve: { 
      // Overall resolve metrics
      percent: resolvePercent, 
      avgHours,
      onTimeCount: totalResolveOnTime,
      lateCount: totalResolveLate,
      
      // Severity-specific resolve data
      critical: {
        total: critical,
        percent: criticalResolvePercent,
        avgHours: criticalAvgHours,
        onTimeCount: criticalResolveOnTime,
        lateCount: criticalResolveLate,
        target: '2 hrs'
      },
      high: {
        total: high,
        percent: highResolvePercent,
        avgHours: highAvgHours,
        onTimeCount: highResolveOnTime,
        lateCount: highResolveLate,
        target: '12 hrs'
      },
      medium: {
        total: medium,
        percent: mediumResolvePercent,
        avgHours: mediumAvgHours,
        onTimeCount: mediumResolveOnTime,
        lateCount: mediumResolveLate,
        target: '16 hrs'
      }
    },
  };
}


// ========== TECHNICIAN DATA GENERATOR ==========

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

  // Same seed logic as SLA data – ensures SAME team size
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
    
    // Response metrics
    const responsePercent = clamp(0.65 + individualSeed * 0.25, 0.5, 0.95);
    const responseOnTime = Math.round(totalIncidents * responsePercent);
    const responseLate = totalIncidents - responseOnTime;
    const avgResponseTime = Number(clamp(5 + (1 - individualSeed) * 15, 2, 30).toFixed(1));
    
    // Resolution metrics
    const resolutionPercent = clamp(0.6 + individualSeed * 0.3, 0.5, 0.9);
    const resolutionOnTime = Math.round(totalIncidents * resolutionPercent);
    const resolutionLate = totalIncidents - resolutionOnTime;
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
      
      // Response metrics
      responseOnTime,
      responseLate,
      responsePercent: Math.round(responsePercent * 100),
      avgResponseTime,
      
      // Resolution metrics
      resolutionOnTime,
      resolutionLate,
      resolutionPercent: Math.round(resolutionPercent * 100),
      avgResolutionTime,
      
      // Date range
      date: `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`
    };
  });

  return technicians;
}

export default fetchSlaData;