const fs = require('fs');

function fix(file, usersVar) {
  if (!fs.existsSync(file)) return;
  let code = fs.readFileSync(file, 'utf8');
  
  // Replace standard block
  const pattern = new RegExp(`const getUserName = \\(serviceNumber\\) => \\{[\\s\\S]*?return[^;]+;\\s*\\};`, 'g');
  
  const replacement = `const getUserName = (serviceNumber) => {
    if (!serviceNumber || String(serviceNumber).trim() === '') return 'Unassigned';
    if (!Array.isArray(${usersVar})) return serviceNumber;
    const foundUser = ${usersVar}.find(
      (user) => String(user.service_number) === String(serviceNumber) || String(user.serviceNum) === String(serviceNumber)
    );
    return foundUser ? (foundUser.display_name || foundUser.user_name || foundUser.name || serviceNumber) : serviceNumber;
  };`;
  
  const newCode = code.replace(pattern, replacement);
  fs.writeFileSync(file, newCode);
  console.log('Fixed', file);
}

fix('src/pages/Admin/AdminMyTeamIncidentViewAll/AdminMyTeamIncidentViewAll.jsx', 'users');
fix('src/pages/Admin/AdminAllIncidents/AdminAllIncidents.jsx', 'users');
fix('src/pages/SuperAdmin/SuperAdminAllIncident/SuperAdminAllIncident.jsx', '(users || [])');
fix('src/pages/User/UserMyTeamIncidentViewAll/UserMyTeamIncidentViewAll.jsx', 'users');
fix('src/pages/Technician/TechnicianAllTeam/TechnicianAllTeam.jsx', 'allUsers');
fix('src/components/IncidentHistory/IncidentHistory.jsx', 'users');

