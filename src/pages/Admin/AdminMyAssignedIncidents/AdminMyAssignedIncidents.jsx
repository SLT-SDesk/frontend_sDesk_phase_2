import React, { useState, useEffect } from 'react';
import socket from '../../../utils/socket';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { IoIosArrowForward } from "react-icons/io";
import { useNavigate } from 'react-router-dom';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

import {
    fetchAssignedToMeRequest,
    updateIncidentInList,
    addIncidentToAssignedToMe
} from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { fetchCategoryItemsRequest } from '../../../redux/categories/categorySlice';
import { fetchLocationsRequest } from '../../../redux/location/locationSlice';
import TechnicianInsident from '../../Technician/TechnicianIncident/TechnicianInsident';
import './AdminMyAssignedIncidents.css';
import './IncidentPopup.css';

const AdminMyAssignedIncidents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [showIncidentPopup, setShowIncidentPopup] = useState(false);
    const [selectedIncident, setSelectedIncident] = useState(null);

    const { assignedToMe } = useSelector((state) => state.incident);
    const { user: loggedInUser } = useSelector((state) => state.auth);
    const { allUsers } = useSelector((state) => state.sltusers);
    const { categoryItems } = useSelector((state) => state.categories);
    const { locations } = useSelector((state) => state.location);

    const assignedUser = loggedInUser ? loggedInUser.serviceNumber : null;

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    // ---------------- FETCH DATA ----------------
    useEffect(() => {
        if (assignedUser) {
            dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
        }
        dispatch(fetchAllUsersRequest());
        dispatch(fetchCategoryItemsRequest());
        dispatch(fetchLocationsRequest());

        if (loggedInUser && socket.connected) {
            socket.emit("user_connected", {
                serviceNum: loggedInUser.serviceNumber || loggedInUser.serviceNum,
                userName: loggedInUser.userName || loggedInUser.name || loggedInUser.user_name,
                role: loggedInUser.role,
            });
        }
    }, [dispatch, assignedUser, loggedInUser]);

    // ---------------- SOCKET LISTENERS ----------------
    useEffect(() => {
        if (!assignedUser) return;

        const handleIncidentUpdated = (data) => {
            const updatedIncident = data.incident;
            dispatch(updateIncidentInList(updatedIncident));
            if (selectedIncident && selectedIncident.incident_number === updatedIncident.incident_number) {
                setSelectedIncident(updatedIncident);
            }
            dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
        };

        const handleIncidentUpdatedAssigned = (data) => {
            const updatedIncident = data.incident;
            dispatch(updateIncidentInList(updatedIncident));
            if (selectedIncident && selectedIncident.incident_number === updatedIncident.incident_number) {
                setSelectedIncident(updatedIncident);
            }
            dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
        };

        const handleIncidentAssignedTechnician = (data) => {
            const incident = data.incident;
            dispatch(addIncidentToAssignedToMe(incident));
            dispatch(fetchAssignedToMeRequest({ serviceNum: assignedUser }));
        };

        socket.on('incident_updated', handleIncidentUpdated);
        socket.on('incident_updated_assigned', handleIncidentUpdatedAssigned);
        socket.on('incident_assigned_technician', handleIncidentAssignedTechnician);

        return () => {
            socket.off('incident_updated', handleIncidentUpdated);
            socket.off('incident_updated_assigned', handleIncidentUpdatedAssigned);
            socket.off('incident_assigned_technician', handleIncidentAssignedTechnician);
        };
    }, [dispatch, assignedUser, selectedIncident]);

    // ---------------- HELPER FUNCTIONS ----------------
    const getCategoryName = (categoryNumber) => {
        const category = categoryItems.find(item => item.grandchild_category_number === categoryNumber);
        return category ? category.grandchild_category_name : categoryNumber;
    };

    const getUserName = (serviceNumber) => {
        if (!Array.isArray(allUsers)) return serviceNumber;
        const user = allUsers.find(u => u.service_number === serviceNumber || u.serviceNum === serviceNumber);
        return user ? (user.display_name || user.user_name || user.name) : serviceNumber;
    };

    const getLocationName = (locationNumber) => {
        const location = locations.find(loc => loc.loc_number === locationNumber || loc.id === locationNumber);
        return location ? (location.name || location.loc_name) : locationNumber;
    };

    // ---------------- FILTER TABLE ----------------
    const tableData = assignedToMe.map(item => ({
        refNo: item.incident_number,
        affectedUser: getUserName(item.informant),
        category: getCategoryName(item.category),
        status: item.status,
    }));

    const filteredData = tableData.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesCategory = categoryFilter ? item.category === getCategoryName(categoryFilter) : true;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    const currentRows = filteredData;

    const handleRowClick = (refNo) => {
        const incident = assignedToMe.find(item => item.incident_number === refNo);
        if (incident) {
            setSelectedIncident(incident);
            setShowIncidentPopup(true);
        }
    };

    // ---------------- EXPORT TO EXCEL ----------------
    const exportToExcel = () => {
        if (!filteredData || filteredData.length === 0) {
            alert("No data to export!");
            return;
        }

        // Convert table data to sheet
        const worksheet = XLSX.utils.json_to_sheet(filteredData);

        // Add custom header rows at the top
        const headerRows = [
            ["My Assigned Incidents Report"], // Title
            [`Generated By: ${loggedInUser?.userName || loggedInUser?.name || ""}`],
            [`Date: ${new Date().toLocaleString()}`],
            [`Total Incidents: ${tableData.length}`],
            [`Filtered Incidents: ${filteredData.length}`],
            [] // empty row before table
        ];
        XLSX.utils.sheet_add_aoa(worksheet, headerRows, { origin: 0 });

        // Create workbook and append sheet
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Assigned Incidents");

        // Export
        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const data = new Blob([excelBuffer], { type: "application/octet-stream" });
        saveAs(data, `My_Assigned_Incidents_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    const renderTableRows = () => {
        if (currentRows.length === 0) {
            return (
                <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        No incidents found.
                    </td>
                </tr>
            );
        }

        return currentRows.map((row, idx) => (
            <tr key={idx}>
                <td className='team-refno'>
                    <a
                        href="#"
                        className="refno-link"
                        onClick={(e) => {
                            e.preventDefault();
                            handleRowClick(row.refNo);
                        }}
                    >
                        {row.refNo}
                    </a>
                </td>
                <td>{row.affectedUser}</td>
                <td>{row.category}</td>
                <td className='team-status-text'>{row.status}</td>
            </tr>
        ));
    };

    const uniqueCategories = [...new Set(tableData.map(item => item.category))];

    return (
        <div className="AdminMyAssignedIncidents-main-content">
            <div className="AdminMyAssignedIncidents-tickets-creator flex flex-row items-center gap-2 whitespace-nowrap">
                <span className="AdminMyAssignedIncidents-svr-desk">Incidents</span>
                <IoIosArrowForward style={{ position: 'relative', top: '4px' }} />
                <span className="AdminMyAssignedIncidents-created-ticket">My Assigned Incidents</span>
            </div>
            <div className="AdminMyAssignedIncidents-content2">
                <div className="AdminMyAssignedIncidents-TitleBar">
                    <div className="AdminMyAssignedIncidents-TitleBar-NameAndIcon">
                        <FaHistory size={20} />
                        My Assigned Incidents - {loggedInUser ? (loggedInUser.userName || loggedInUser.name) : ''}
                    </div>
                    <div className="AdminMyAssignedIncidents-TitleBar-buttons">
                        <button
                            className="AdminMyAssignedIncidents-TitleBar-buttons-ExportData"
                            onClick={exportToExcel}
                        >
                            <TiExportOutline />
                            Export Data
                        </button>
                    </div>
                </div>

                {/* Search & Filter Bar */}
                <div className="AdminMyAssignedIncidents-showSearchBar flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
                    <div className="AdminMyAssignedIncidents-showSearchBar-Show flex flex-col sm:flex-row flex-wrap gap-2 w-full sm:w-auto">
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                            <span>Status:</span>
                            <select
                                onChange={e => setStatusFilter(e.target.value)}
                                value={statusFilter}
                                className="AdminMyAssignedIncidents-showSearchBar-Show-select2 w-full sm:w-32"
                            >
                                <option value="">All Status</option>
                                <option value="Open">Open</option>
                                <option value="Hold">Hold</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-2 sm:items-center w-full sm:w-auto">
                            <span>Category:</span>
                            <select
                                onChange={e => setCategoryFilter(e.target.value)}
                                value={categoryFilter}
                                className="AdminMyAssignedIncidents-showSearchBar-Show-select2 w-full sm:w-40"
                            >
                                <option value="">All Categories</option>
                                {uniqueCategories.map((cat, idx) => (
                                    <option key={idx} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="AdminMyAssignedIncidents-showSearchBar-SearchBar flex items-center gap-2 w-full sm:w-64">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="AdminMyAssignedIncidents-showSearchBar-SearchBar-input w-full"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="AdminMyAssignedIncidents-table">
                    <div className="hidden sm:block">
                        <table className="AdminMyAssignedIncidents-table-table w-full">
                            <thead>
                                <tr>
                                    <th>Ref No</th>
                                    <th>Affected User</th>
                                    <th>Category</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>{renderTableRows()}</tbody>
                        </table>
                    </div>
                </div>

                <div className='AdminMyAssignedIncidents-footer-content'>
                    <div className="AdminMyAssignedIncidents-content3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mt-4">
                        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px', paddingRight: '10px' }}>
                            <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#333' }}>
                                Total incidents: {filteredData.length} entries
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {showIncidentPopup && selectedIncident && (
                <div className="incident-popup-overlay">
                    <div className="incident-popup-content">
                        <button className="incident-popup-close-btn" onClick={() => setShowIncidentPopup(false)}>X</button>
                        <TechnicianInsident
                            incidentData={selectedIncident}
                            isPopup={true}
                            loggedInUser={loggedInUser}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminMyAssignedIncidents;
