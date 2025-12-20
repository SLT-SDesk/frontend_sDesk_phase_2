export function aggregateTeamData(technicians) {
  // Initialize counters
  const teamData = {
    teamSize: 0,
    activeMembers: 0
  };

  // Count total team members and active members
  technicians.forEach((technician) => {
    teamData.teamSize += 1;
    
    if (technician.active === true) {
      teamData.activeMembers += 1;
    }
  });

  return teamData;
}