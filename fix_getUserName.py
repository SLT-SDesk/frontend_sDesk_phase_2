import os, re

files = {
    'src/pages/Admin/AdminMyTeamIncidentViewAll/AdminMyTeamIncidentViewAll.jsx': 'users',
    'src/pages/Admin/AdminAllIncidents/AdminAllIncidents.jsx': 'users',
    'src/pages/SuperAdmin/SuperAdminAllIncident/SuperAdminAllIncident.jsx': '(users || [])',
    'src/pages/User/UserMyTeamIncidentViewAll/UserMyTeamIncidentViewAll.jsx': 'users',
    'src/pages/Technician/TechnicianAllTeam/TechnicianAllTeam.jsx': 'allUsers',
    'src/components/IncidentHistory/IncidentHistory.jsx': 'users',
    'src/pages/Admin/AdminViewIncident/AdminViewIncident.jsx': 'users',
    'src/pages/Technician/TechnicianMyAssignedIncidents/TechnicianMyAssignedIncidents.jsx': 'allUsers'
}

for path, var_name in files.items():
    if not os.path.exists(path):
        continue
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    replacement = f"""const getUserName = (serviceNumber) => {{
    if (!serviceNumber || String(serviceNumber).trim() === '') return 'Unassigned';
    if (!Array.isArray({var_name})) return serviceNumber;
    const foundUser = {var_name}.find(
      (user) => String(user.service_number) === String(serviceNumber) || String(user.serviceNum) === String(serviceNumber)
    );
    return foundUser ? (foundUser.display_name || foundUser.user_name || foundUser.name || serviceNumber) : serviceNumber;
  }};"""
    
    new_content = re.sub(r'const getUserName = \(serviceNumber\) => \{[\s\S]*?return[\s\S]*?\};', replacement, content)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print(f'Fixed {path}')
