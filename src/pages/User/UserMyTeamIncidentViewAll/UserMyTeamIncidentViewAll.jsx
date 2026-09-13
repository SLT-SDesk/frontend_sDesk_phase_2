import React, { useState } from 'react';
import { FaHistory } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { FaSearch } from 'react-icons/fa';
import { UserMyTeamIncidentData } from './UserMyTeam_All_incident_data';
import './UserMyTeamIncidentViewAll.css';

const UserMyTeamIncidentViewAll = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const filteredData = UserMyTeamIncidentData.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const currentRows = filteredData;

    const renderTableRows = () => {
        return currentRows.map((row, idx) => (
            <tr key={idx}>
                <td className='team-refno'>{row.refNo}</td>
                <td>{row.assignedTo}</td>
                <td>{row.affectedUser}</td>
                <td>{row.category}</td>
                <td className='team-status-text'>{row.status}</td>
            </tr>
        ));
    };

    return (
        <div className="UserMyTeamIncidentViewAll-main-content">
            <div className="UserMyTeamIncidentViewAll-direction-bar">
                Incidents {'>'} My Team Incidents
            </div>
            <div className="UserMyTeamIncidentViewAll-content2">
                <div className="UserMyTeamIncidentViewAll-TitleBar">
                    <div className="UserMyTeamIncidentViewAll-TitleBar-NameAndIcon">
                        <FaHistory size={20} />
                        My Team - Incident Log
                    </div>
                    <div className="UserMyTeamIncidentViewAll-TitleBar-buttons">
                        <button className="UserMyTeamIncidentViewAll-TitleBar-buttons-ExportData">
                            <TiExportOutline />
                            Export Data
                        </button>
                    </div>
                </div>
                <div className="UserMyTeamIncidentViewAll-showSearchBar">
                    <div className="UserMyTeamIncidentViewAll-showSearchBar-Show">
                        Status:
                        <select
                            onChange={e => setStatusFilter(e.target.value)}
                            value={statusFilter}
                            className="UserMyTeamIncidentViewAll-showSearchBar-Show-select"
                        >
                            <option value="">All Status</option>
                            <option value="Open">Open</option>
                            <option value="Hold">Hold</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Closed">Closed</option>
                        </select>
                        Category:
                        <select
                            onChange={e => setCategoryFilter(e.target.value)}
                            value={categoryFilter}
                            className="UserMyTeamIncidentViewAll-showSearchBar-Show-select2"
                        >
                            <option value="">All Categories</option>
                            {[...new Set(UserMyTeamIncidentData.map(d => d.category))].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="UserMyTeamIncidentViewAll-showSearchBar-SearchBar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="UserMyTeamIncidentViewAll-showSearchBar-SearchBar-input"
                        />
                    </div>
                </div>
                <div className="UserMyTeamIncidentViewAll-table">
                    <table className="UserMyTeamIncidentViewAll-table-table">
                        <thead>
                            <tr>
                                <th>Ref No</th>
                                <th>Assigned To</th>
                                <th>Affected User</th>
                                <th>Category</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>
                <div className="UserMyTeamIncidentViewAll-content3">
                    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', paddingRight: '10px' }}>
                        <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>
                            Total incidents: {filteredData.length} entries
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMyTeamIncidentViewAll;