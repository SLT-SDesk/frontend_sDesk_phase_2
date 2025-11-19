import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory } from "react-icons/fa";
import { TiExportOutline } from 'react-icons/ti';
import { FaSearch } from 'react-icons/fa';
import './UserMyAssignedIncidents.css';
import { getAssignedToMeRequest, updateIncidentRequest, clearError } from '../../../redux/incident/incidentSlice';

const UserMyAssignedIncidents = () => {
    const dispatch = useDispatch();
    const { assignedToMe, loading, error } = useSelector((state) => state.incident);
    
    // Get current user's service number (you might get this from auth state)
    const currentUserServiceNumber = 'SV002'; // Replace with actual user data
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [showUpdateModal, setShowUpdateModal] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);
    const [updateForm, setUpdateForm] = useState({
        status: '',
        priority: '',
        handler: '',
        update_on: new Date().toISOString()
    });

    useEffect(() => {
        dispatch(getAssignedToMeRequest({ handler: currentUserServiceNumber }));
        return () => {
            dispatch(clearError());
        };
    }, [dispatch, currentUserServiceNumber]);

    const filteredData = assignedToMe.filter(item => {
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
                <td className='team-refno'>{row.incident_number}</td>
                <td>{row.informant}</td>
                <td>{row.category}</td>
                <td className='team-status-text'>
                    <span className={`status-badge status-${row.status.toLowerCase().replace(' ', '-')}`}>
                        {row.status}
                    </span>
                </td>
                <td>
                    <span className={`priority-badge priority-${row.priority.toLowerCase()}`}>
                        {row.priority}
                    </span>
                </td>
                <td>{row.location}</td>
                <td>{row.update_on}</td>                <td>
                    <button className="view-btn" onClick={() => console.log('View incident:', row.incident_number)}>
                        View
                    </button>
                    <button className="update-btn" onClick={() => handleUpdateClick(row)}>
                        Update
                    </button>
                </td>
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
            <button key={1} onClick={() => setCurrentPage(1)} className={currentPage === 1 ? 'active' : ''}>1</button>,
            <button key={2} onClick={() => setCurrentPage(2)} className={currentPage === 2 ? 'active' : ''}>2</button>
        );

        if (currentPage > 3) buttons.push(<span key="ellipsis1">...</span>);
        
        if (currentPage > 3 && currentPage < totalPages - 2) {
            buttons.push(
                <button key={currentPage} onClick={() => setCurrentPage(currentPage)} className="active">{currentPage}</button>
            );
        }

        if (currentPage < totalPages - 2) buttons.push(<span key="ellipsis2">...</span>);

        buttons.push(
            <button key={totalPages - 1} onClick={() => setCurrentPage(totalPages - 1)} className={currentPage === totalPages - 1 ? 'active' : ''}>{totalPages - 1}</button>,
            <button key={totalPages} onClick={() => setCurrentPage(totalPages)} className={currentPage === totalPages ? 'active' : ''}>{totalPages}</button>
        );

        return buttons;
    };

    const handleUpdateClick = (incident) => {
        setSelectedIncident(incident);
        setUpdateForm({
            status: incident.status,
            priority: incident.priority,
            handler: incident.handler,
            update_on: new Date().toISOString()
        });
        setShowUpdateModal(true);
    };

    const handleUpdateSubmit = (e) => {
        e.preventDefault();
        if (selectedIncident) {
            dispatch(updateIncidentRequest({
                incident_number: selectedIncident.incident_number,
                data: updateForm
            }));
            setShowUpdateModal(false);
            setSelectedIncident(null);
        }
    };

    const handleModalClose = () => {
        setShowUpdateModal(false);
        setSelectedIncident(null);
        setUpdateForm({
            status: '',
            priority: '',
            handler: '',
            update_on: new Date().toISOString()
        });
    };

    const exportToCSV = () => {
        const headers = ['Incident Number', 'Informant', 'Category', 'Status', 'Priority', 'Location', 'Updated On'];
        const csvContent = [
            headers.join(','),
            ...filteredData.map(row => 
                [row.incident_number, row.informant, row.category, row.status, row.priority, row.location, row.update_on].join(',')
            )
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'assigned_incidents.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="UserMyAssignedIncidents-main-content">
            <div className="UserMyAssignedIncidents-direction-bar">
                Incidents {'>'} My Assigned Incidents
            </div>
            <div className="UserMyAssignedIncidents-content2">
                <div className="UserMyAssignedIncidents-TitleBar">
                    <div className="UserMyAssignedIncidents-TitleBar-NameAndIcon">
                        <FaHistory size={20}/>
                        My Assigned Incidents
                    </div>
                    <div className="UserMyAssignedIncidents-TitleBar-buttons">
                        <button className="UserMyAssignedIncidents-TitleBar-buttons-ExportData" onClick={exportToCSV}>
                            <TiExportOutline />
                            Export Data
                        </button>
                    </div>
                </div>
                <div className="UserMyAssignedIncidents-showSearchBar">
                    <div className="UserMyAssignedIncidents-showSearchBar-Show">
                        Entries:
                        <select
                            onChange={e => setRowsPerPage(Number(e.target.value))} 
                            value={rowsPerPage}
                            className="UserMyAssignedIncidents-showSearchBar-Show-select"
                        >
                            {[10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size} entries</option>
                            ))}
                        </select>
                        Status:
                        <select 
                            onChange={e => setStatusFilter(e.target.value)} 
                            value={statusFilter}
                            className="UserMyAssignedIncidents-showSearchBar-Show-select"
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
                            className="UserMyAssignedIncidents-showSearchBar-Show-select2"
                        >
                            <option value="">All Categories</option>
                            {[...new Set(UserMyAssignedincidentData.map(d => d.category))].map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    <div className="UserMyAssignedIncidents-showSearchBar-SearchBar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="UserMyAssignedIncidents-showSearchBar-SearchBar-input"
                        />
                    </div>
                </div>
                <div className="UserMyAssignedIncidents-table">
                    <table className="UserMyAssignedIncidents-table-table">
                        <thead>
                            <tr>
                                <th>Ref No</th>
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
                <div className="UserMyAssignedIncidents-content3">
                    <span className="UserMyAssignedIncidents-content3-team-entry-info">
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <div className="UserMyAssignedIncidents-content3-team-pagination-buttons">
                        <button 
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                            disabled={currentPage === 1}                        >
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
            
            {/* Update Modal */}
            {showUpdateModal && (
                <div className="modal-overlay">
                    <div className="modal-content update-modal">
                        <div className="modal-header">
                            <h3>Update Incident: {selectedIncident?.incident_number}</h3>
                            <button className="modal-close" onClick={handleModalClose}>×</button>
                        </div>
                        <form onSubmit={handleUpdateSubmit} className="update-form">
                            <div className="form-group">
                                <label>Status:</label>
                                <select 
                                    value={updateForm.status} 
                                    onChange={(e) => setUpdateForm({...updateForm, status: e.target.value})}
                                    required
                                >
                                    <option value="Open">Open</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Priority:</label>
                                <select 
                                    value={updateForm.priority} 
                                    onChange={(e) => setUpdateForm({...updateForm, priority: e.target.value})}
                                    required
                                >
                                    <option value="Low">Low</option>
                                    <option value="Medium">Medium</option>
                                    <option value="High">High</option>
                                    <option value="Critical">Critical</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Handler:</label>
                                <input 
                                    type="text" 
                                    value={updateForm.handler} 
                                    onChange={(e) => setUpdateForm({...updateForm, handler: e.target.value})}
                                    placeholder="Enter handler service number"
                                    required
                                />
                            </div>
                            <div className="form-buttons">
                                <button type="button" onClick={handleModalClose} className="cancel-btn">
                                    Cancel
                                </button>
                                <button type="submit" className="submit-btn" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Incident'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMyAssignedIncidents;