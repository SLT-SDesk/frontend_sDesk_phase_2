import React from 'react';
import { FaCog, FaWrench, FaUser, FaUsers } from 'react-icons/fa';
import './AdminUserDashBoard.css';

function AdminUserDashBoard({ userCounts = {} }) {
  const roles = [
    { name: 'Admin', color: '#3498db', icon: FaCog },
    { name: 'Technician', color: '#2ecc71', icon: FaWrench },
    { name: 'Employee', color: '#f1c40f', icon: FaUser },
    { name: 'Team Leader', color: '#9b59b6', icon: FaUsers },
  ];

  const defaultUserCounts = {
    admin: 1,
    technician: 20,
    employee: 100,
    teamleader: 5,
  };

  const counts = {
    ...defaultUserCounts,
    ...userCounts,
  };

  return (
    <div className="AdminUserDashBoard-main-content">
        <div className="AdminUserDashBoard-direction-bar">
            User
        </div>
        <div className="AdminUserDashBoard-content2">
            <div className="AdminUserDashBoard-content2-RoleCardGrid">
              {
                roles.map((role) => (
                  <div className="AdminUserDashBoard-content2-RoleCardGrid-RoleCard" key={role.name}>
                    <role.icon className="AdminUserDashBoard-content2-RoleCardGrid-RoleCard-Icon" style={{color: role.color}}/>
                    <div className="AdminUserDashBoard-content2-RoleCardGrid-RoleCard-Info">
                      <h3 className="AdminUserDashBoard-content2-RoleCardGrid-RoleCard-Name" style = {{color: role.color}}>
                        {role.name}
                      </h3>
                      <p className="AdminUserDashBoard-content2-RoleCardGrid-RoleCard-Count">
                        {counts[role.name.toLowerCase()] || 0}
                      </p>
                    </div>
                  </div>
                ))
              }
          </div>
        </div>
    </div>
  );
}
export default AdminUserDashBoard;