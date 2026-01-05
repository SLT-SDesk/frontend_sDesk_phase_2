export function aggregateIncidentCounts(incidents) {
  // Initialize counters
  const counts = {
    total: 0,
    critical: 0,
    high: 0,
    medium: 0
  };

  // Count incidents by priority
  incidents.forEach((incident) => {
    const priority = incident.priority?.toLowerCase();
    
    counts.total += 1;
    
    if (priority === 'critical') {
      counts.critical += 1;
    } else if (priority === 'high') {
      counts.high += 1;
    } else if (priority === 'medium') {
      counts.medium += 1;
    }
  });

  return counts;
}