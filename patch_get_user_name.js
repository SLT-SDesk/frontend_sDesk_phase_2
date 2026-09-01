const fs = require('fs');

const files = [
  'src/pages/SuperAdmin/SuperAdminAllIncident/SuperAdminAllIncident.jsx',
  'src/pages/Admin/AdminMyAssignedIncidents/AdminMyAssignedIncidents.jsx',
  'src/pages/Admin/AdminAllIncidents/AdminAllIncidents.jsx',
  'src/pages/Admin/AdminMyTeamIncidentViewAll/AdminMyTeamIncidentViewAll.jsx',
  'src/pages/Admin/AdminViewIncident/AdminViewIncident.jsx',
  'src/pages/Admin/AdminUpdateIncident/AdminUpdateIncident.jsx',
  'src/pages/User/UserUpdateIncident/UserUpdateIncident.jsx',
  'src/pages/Technician/TechnicianMyAssignedIncidents/TechnicianMyAssignedIncidents.jsx',
  'src/pages/Technician/TechnicianMyReportedUpdate/TechnicianMyReportedUpdate.jsx',
  'src/pages/Technician/TechnicianAllTeam/TechnicianAllTeam.jsx',
  'src/components/IncidentHistory/IncidentHistory.jsx'
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');

  // Regex to find things like:
  // const getUserName = (serviceNumber) => { ... };
  // Which can span multiple lines.

  // Instead of a complex regex, we can do it more reliably string replacing common patterns.
  // We'll replace:
  // "return foundUser ? foundUser.user_name : serviceNumber;"
  // with
  // "if (!serviceNumber) return 'Unassigned';\n    return foundUser ? (foundUser.display_name || foundUser.user_name || foundUser.name || serviceNumber) : serviceNumber;"

  content = content.replace(/const getUserName = \(serviceNumber\) => \{\s+const foundUser = ([a-zA-Z0-9_\.]+)\??\.find\(\s+\(([a-zA-Z0-9_]+)\) => \2\.service_number === serviceNumber(\s+| \|\| \2\.serviceNum === serviceNumber)?\);\s+return foundUser \? foundUser\.user_name : serviceNumber;\s+\};/g, 
  `const getUserName = (serviceNumber) => {
    if (!serviceNumber || String(serviceNumber).trim() === '') return "Unassigned";
    const foundUser = $1?.find(
      (user) => String(user.service_number) === String(serviceNumber) || String(user.serviceNum) === String(serviceNumber)
    );
    return foundUser ? (foundUser.display_name || foundUser.user_name || foundUser.name || serviceNumber) : serviceNumber;
  };`);

  fs.writeFileSync(file, content);
  console.log('Patched', file);
});
