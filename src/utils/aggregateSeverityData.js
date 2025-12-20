import { formatMinutesToHM } from "./timeFormatter";

export function aggregateSeverityData(incidents, performances) {
  const SLA = {
    Critical: { response: 15, resolve: 120 },   // minutes
    High: { response: 30, resolve: 720 },
    Medium: { response: 240, resolve: 960 }
  };

  // ---------- Performance lookup ----------
  const performanceMap = performances.reduce((acc, p) => {
    acc[p.incidentNumber] = p;
    return acc;
  }, {});

  // ---------- Buckets ----------
  const result = {
    critical: initSeverity(),
    high: initSeverity(),
    medium: initSeverity()
  };

  // ---------- Aggregate ----------
  incidents.forEach((incident) => {
    const severityKey = incident.priority?.toLowerCase();
    if (!result[severityKey]) return;

    const perf = performanceMap[incident.incident_number];
    if (!perf) return;

    const bucket = result[severityKey];
    const sla = SLA[incident.priority];

    bucket.totalIncidents += 1;

    // ===== RESPONSE =====
    const responseMinutes = Number(perf.responseTimeMinutes ?? 0);
    bucket.response.totalMinutes += responseMinutes;

    if (responseMinutes <= sla.response) {
      bucket.response.onTime += 1;
    } else {
      bucket.response.late += 1;
    }

    // ===== RESOLVE =====
    const resolveMinutes = Number(perf.resolveTimeMinutes ?? 0);
    bucket.resolve.totalMinutes += resolveMinutes;

    if (resolveMinutes <= sla.resolve) {
      bucket.resolve.onTime += 1;
    } else {
      bucket.resolve.late += 1;
    }
  });

  // ---------- Calculate totals across all severities ----------
  const totals = calculateTotals(result);

  // ---------- Final calculations and format for component ----------
  const formattedResult = {
    response: {
      // Overall response metrics
      percent: totals.response.percentage,
      avgMinutes: totals.response.avg,
      onTimeCount: totals.response.onTime,
      lateCount: totals.response.late,
      
      // Severity-specific response data
      critical: formatSeverityData(result.critical, 'response', '15 min'),
      high: formatSeverityData(result.high, 'response', '30 min'),
      medium: formatSeverityData(result.medium, 'response', '4 hrs')
    },
    resolve: {
      // Overall resolve metrics
      percent: totals.resolve.percentage,
      avgHours: totals.resolve.avg,
      onTimeCount: totals.resolve.onTime,
      lateCount: totals.resolve.late,
      
      // Severity-specific resolve data
      critical: formatSeverityData(result.critical, 'resolve', '2 hrs'),
      high: formatSeverityData(result.high, 'resolve', '12 hrs'),
      medium: formatSeverityData(result.medium, 'resolve', '16 hrs')
    }
  };

  return formattedResult;
}

// ---------- Helper to calculate totals ----------
function calculateTotals(result) {
  const totals = {
    totalIncidents: 0,
    response: { onTime: 0, late: 0, totalMinutes: 0 },
    resolve: { onTime: 0, late: 0, totalMinutes: 0 }
  };

  Object.values(result).forEach((bucket) => {
    totals.totalIncidents += bucket.totalIncidents;
    totals.response.onTime += bucket.response.onTime;
    totals.response.late += bucket.response.late;
    totals.response.totalMinutes += bucket.response.totalMinutes;
    totals.resolve.onTime += bucket.resolve.onTime;
    totals.resolve.late += bucket.resolve.late;
    totals.resolve.totalMinutes += bucket.resolve.totalMinutes;
  });

  // Calculate percentages and averages
  if (totals.totalIncidents > 0) {
    totals.response.percentage = Math.round(
      (totals.response.onTime / totals.totalIncidents) * 100
    );
    totals.resolve.percentage = Math.round(
      (totals.resolve.onTime / totals.totalIncidents) * 100
    );
    totals.response.avg = formatMinutesToHM(
      totals.response.totalMinutes / totals.totalIncidents
    );
    totals.resolve.avg = formatMinutesToHM(
      totals.resolve.totalMinutes / totals.totalIncidents
    );
  } else {
    totals.response.percentage = 0;
    totals.resolve.percentage = 0;
    totals.response.avg = "0m";
    totals.resolve.avg = "0m";
  }

  return totals;
}

// ---------- Helper to format severity data ----------
function formatSeverityData(bucket, type, target) {
  const total = bucket.totalIncidents;
  const data = bucket[type];

  if (total === 0) {
    return {
      total: 0,
      percent: 0,
      avgMinutes: "0m",
      avgHours: "0m",
      onTimeCount: 0,
      lateCount: 0,
      target
    };
  }

  const percentage = Math.round((data.onTime / total) * 100);
  const avgTime = formatMinutesToHM(data.totalMinutes / total);

  return {
    total,
    percent: percentage,
    avgMinutes: avgTime,
    avgHours: avgTime,
    onTimeCount: data.onTime,
    lateCount: data.late,
    target
  };
}

// ---------- Helper ----------
function initSeverity() {
  return {
    totalIncidents: 0,
    response: {
      onTime: 0,
      late: 0,
      totalMinutes: 0,
      percentage: 0,
      avg: "0m"
    },
    resolve: {
      onTime: 0,
      late: 0,
      totalMinutes: 0,
      percentage: 0,
      avg: "0m"
    }
  };
}