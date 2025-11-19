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
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const filteredData = UserMyTeamIncidentData.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

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

    const renderPaginationButtons = () => {
        const maxButtons = 7;
        const buttons = [];
        
        if (totalPages <= maxButtons) {
            return Array.from({ length: totalPages }, (_, i) => (
                <button
                    key={i + 1}
                    onClick={() => setCurrentPage(i + 1)}
                    className={currentPage === i + 1 ? 'active' : ''}
                >
                    {i + 1}
                </button>
            ));
        }

        buttons.push(
            <button
                key={1}
                onClick={() => setCurrentPage(1)}
                className={currentPage === 1 ? 'active' : ''}
            >
                1
            </button>,
            <button
                key={2}
                onClick={() => setCurrentPage(2)}
                className={currentPage === 2 ? 'active' : ''}
            >
                2
            </button>
        );

        if (currentPage > 3) {
            buttons.push(<span key="ellipsis1">...</span>);
        }

        if (currentPage > 3 && currentPage < totalPages - 2) {
            buttons.push(
                <button
                    key={currentPage}
                    onClick={() => setCurrentPage(currentPage)}
                    className="active"
                >
                    {currentPage}
                </button>
            );
        }

        if (currentPage < totalPages - 2) {
            buttons.push(<span key="ellipsis2">...</span>);
        }

        buttons.push(
            <button
                key={totalPages - 1}
                onClick={() => setCurrentPage(totalPages - 1)}
                className={currentPage === totalPages - 1 ? 'active' : ''}
            >
                {totalPages - 1}
            </button>,
            <button
                key={totalPages}
                onClick={() => setCurrentPage(totalPages)}
                className={currentPage === totalPages ? 'active' : ''}
            >
                {totalPages}
            </button>
        );

        return buttons;
    };

    return (
        <div className="UserMyTeamIncidentViewAll-main-content">
            <div className="UserMyTeamIncidentViewAll-direction-bar">
                Incidents {'>'} My Team Incidents
            </div>
            <div className="UserMyTeamIncidentViewAll-content2">
                <div className="UserMyTeamIncidentViewAll-TitleBar">
                    <div className="UserMyTeamIncidentViewAll-TitleBar-NameAndIcon">
                        <FaHistory size={20}/>
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
                        Entries:
                        <select
                            onChange={e => setRowsPerPage(Number(e.target.value))} 
                            value={rowsPerPage}
                            className="UserMyTeamIncidentViewAll-showSearchBar-Show-select"
                        >
                            {[10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size} entries</option>
                            ))}
                        </select>
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
                    <span className="UserMyTeamIncidentViewAll-content3-team-entry-info">
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <div className="UserMyTeamIncidentViewAll-content3-team-pagination-buttons">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        {renderPaginationButtons()}
                        <button 
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserMyTeamIncidentViewAll;