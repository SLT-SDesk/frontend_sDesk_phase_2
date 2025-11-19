// Dummy incident data for KPI dashboard
// This data simulates incident records from the database structure shown in the schema

const generateIncidentData = () => {
  const teams = [
    'Team Alpha',
    'Team Beta', 
    'Team Gamma',
    'Team Delta',
    'Team Epsilon'
  ];

  const categories = [
    'IT Repair Center Tier 3',
    'E-Mail Lost',
    'MS Office Issue',
    'Printer Driver Installation',
    'Other Software Install',
    'Printer Sharing',
    'VDI Profile Not Loading',
    'MS Office Installation',
    'Computer Login Password - Reset',
    'Scanner Issue',
    'Software',
    'Static IP Request LAN',
    'Operating System Issue',
    'Email',
    'Printer Not Working'
  ];

  const statuses = ['Open', 'In Progress', 'Resolved', 'Closed'];
  const priorities = ['Low', 'Medium', 'High', 'Critical'];

  // Generate base incident data
  const incidents = [];
  let incidentId = 1;

  // Generate incidents for different date ranges
  const today = new Date();
  const dates = [];
  
  // Generate dates for last 3 months
  for (let i = 90; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    dates.push(date);
  }

  // Generate incidents
  for (let dateIndex = 0; dateIndex < dates.length; dateIndex++) {
    const currentDate = dates[dateIndex];
    const incidentsPerDay = Math.floor(Math.random() * 15) + 5; // 5-20 incidents per day

    for (let i = 0; i < incidentsPerDay; i++) {
      const team = teams[Math.floor(Math.random() * teams.length)];
      const category = categories[Math.floor(Math.random() * categories.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const priority = priorities[Math.floor(Math.random() * priorities.length)];
      
      // Create incident create date
      const createdAt = new Date(currentDate);
      createdAt.setHours(Math.floor(Math.random() * 24));
      createdAt.setMinutes(Math.floor(Math.random() * 60));

      // Create updated date (sometimes same as created, sometimes later)
      const updatedAt = new Date(createdAt);
      if (Math.random() > 0.3) { // 70% chance to have been updated
        updatedAt.setHours(createdAt.getHours() + Math.floor(Math.random() * 48));
      }

      incidents.push({
        id: `INC-${String(incidentId).padStart(6, '0')}`,
        incident_number: `INC${incidentId}`,
        informant: `user${Math.floor(Math.random() * 1000)}@company.com`,
        location: `Floor-${Math.floor(Math.random() * 10) + 1}`,
        handler: team,
        update_by: `admin${Math.floor(Math.random() * 20) + 1}`,
        category: category,
        update_on: updatedAt,
        status: status,
        priority: priority,
        description: `Incident related to ${category.toLowerCase()}`,
        notify_informant: Math.random() > 0.5,
        attachment: Math.random() > 0.7 ? `attachment_${incidentId}.pdf` : null,
        attachmentFilename: Math.random() > 0.7 ? `document_${incidentId}.pdf` : null,
        attachmentOriginalName: Math.random() > 0.7 ? `original_${incidentId}.pdf` : null,
        createdAt: createdAt,
        team: team
      });

      incidentId++;
    }
  }

  return incidents;
};

// Function to filter incidents by date range
export const filterIncidentsByDateRange = (incidents, startDate, endDate) => {
  return incidents.filter(incident => {
    const incidentDate = new Date(incident.createdAt);
    return incidentDate >= startDate && incidentDate <= endDate;
  });
};

// Function to get team statistics from incidents
export const getTeamStatistics = (incidents) => {
  const teamStats = {};
  
  // Initialize team stats
  incidents.forEach(incident => {
    if (!teamStats[incident.team]) {
      teamStats[incident.team] = {
        team: incident.team,
        totalIncidents: 0,
        clearedIncidents: 0,
        unclearedIncidents: 0
      };
    }
  });

  // Calculate statistics
  incidents.forEach(incident => {
    teamStats[incident.team].totalIncidents++;
    
    if (incident.status === 'Resolved' || incident.status === 'Closed') {
      teamStats[incident.team].clearedIncidents++;
    } else {
      teamStats[incident.team].unclearedIncidents++;
    }
  });

  // Convert to array and add "All Teams" summary
  const teamArray = Object.values(teamStats);
  const totalStats = teamArray.reduce((acc, team) => ({
    totalIncidents: acc.totalIncidents + team.totalIncidents,
    clearedIncidents: acc.clearedIncidents + team.clearedIncidents,
    unclearedIncidents: acc.unclearedIncidents + team.unclearedIncidents
  }), { totalIncidents: 0, clearedIncidents: 0, unclearedIncidents: 0 });

  // Add "All Teams" row at the beginning
  return [
    {
      team: 'All Teams',
      totalIncidents: totalStats.totalIncidents,
      clearedIncidents: totalStats.clearedIncidents,
      unclearedIncidents: totalStats.unclearedIncidents
    },
    ...teamArray
  ];
};

// Function to get team distribution for pie chart
export const getTeamDistribution = (incidents) => {
  const teamCounts = {};
  
  incidents.forEach(incident => {
    teamCounts[incident.team] = (teamCounts[incident.team] || 0) + 1;
  });

  const total = incidents.length;
  
  return Object.entries(teamCounts).map(([team, count]) => ({
    name: team,
    value: total > 0 ? Math.round((count / total) * 100) : 0,
    count: count
  }));
};

// Generate and export the dummy data
export const dummyIncidentData = generateIncidentData();

// Export utility functions
export default {
  dummyIncidentData,
  filterIncidentsByDateRange,
  getTeamStatistics,
  getTeamDistribution
};