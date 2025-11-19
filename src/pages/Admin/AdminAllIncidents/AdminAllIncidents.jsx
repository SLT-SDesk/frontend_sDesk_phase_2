import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import { useNavigate } from 'react-router-dom';
import { fetchAllIncidentsRequest } from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import { fetchCategoryItemsRequest } from '../../../redux/categories/categorySlice';
import { fetchLocationsRequest } from '../../../redux/location/locationSlice';
import './AdminAllIncidents.css';

const AdminAllIncidents = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    // Redux state
    const { incidents, loading, error } = useSelector((state) => state.incident);
    const { allUsers } = useSelector((state) => state.sltusers);
    const { categoryItems } = useSelector((state) => state.categories);
    const { locations } = useSelector((state) => state.location);
    
    // Local state
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [teamFilter, setTeamFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    // Fetch all data on component mount
    useEffect(() => {
        dispatch(fetchAllIncidentsRequest());
        dispatch(fetchAllUsersRequest());
        dispatch(fetchCategoryItemsRequest());
        dispatch(fetchLocationsRequest());
    }, [dispatch]);

    // Loading and error states
    if (loading) {
        return (
            <div className="AdminAllIncidents-main-content">
                <div className="AdminAllIncidents-direction-bar">
                    Incidents {'>'} All Incidents
                </div>
                <div className="AdminAllIncidents-content2">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading incidents...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="AdminAllIncidents-main-content">
                <div className="AdminAllIncidents-direction-bar">
                    Incidents {'>'} All Incidents
                </div>
                <div className="AdminAllIncidents-content2">
                    <div className="error-container">
                        <p>Error loading incidents: {error}</p>
                        <button onClick={() => dispatch(fetchAllIncidentsRequest())}>
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Get category name (grandchild) for display
    const getCategoryName = (categoryNumber) => {
        const category = categoryItems.find(item => item.grandchild_category_number === categoryNumber);
        return category ? category.grandchild_category_name : categoryNumber;
    };

    // Get team name (parent category) for an incident's category
    const getTeamName = (categoryNumber) => {
        const category = categoryItems.find(item => item.grandchild_category_number === categoryNumber);
        return category ? category.parent_category_name : 'Unknown';
    };

    // Get subcategory name (child category) for an incident's category
    const getSubcategoryName = (categoryNumber) => {
        const category = categoryItems.find(item => item.grandchild_category_number === categoryNumber);
        return category ? category.child_category_name : 'Unknown';
    };

    const getUserName = (serviceNumber) => {
        const user = allUsers.find(user => user.service_number === serviceNumber);
        return user ? user.user_name : serviceNumber;
    };

    const getLocationName = (locationNumber) => {
        const location = locations.find(loc => loc.loc_number === locationNumber);
        return location ? location.loc_name : locationNumber;
    };    // Prepare table data from Redux incidents
    const tableData = incidents.map(incident => ({
        refNo: incident.incident_number,
        assignedTo: getUserName(incident.handler),
        affectedUser: getUserName(incident.informant),
        category: getCategoryName(incident.category), // Grandchild category name for display
        subcategory: getSubcategoryName(incident.category), // Child category name for filtering
        team: getTeamName(incident.category),
        status: incident.status,
        rawCategory: incident.category, // Keep raw category number for reference
    }));

    // Filter data based on search, status, category (subcategory), and team
    const filteredData = tableData.filter(item => {
        const matchesSearch = Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        );
        const matchesStatus = statusFilter ? item.status === statusFilter : true;
        const matchesCategory = categoryFilter ? item.subcategory === categoryFilter : true;
        const matchesTeam = teamFilter ? item.team === teamFilter : true;
        return matchesSearch && matchesStatus && matchesCategory && matchesTeam;
    });

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const indexOfLast = currentPage * rowsPerPage;
    const indexOfFirst = indexOfLast - rowsPerPage;
    const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

    const handleRowClick = (refNo) => {
        const incident = incidents.find(item => item.incident_number === refNo);
        if (incident) {
            const informant = allUsers.find(user => user.service_number === incident.informant);
            if (informant) {
                navigate('/admin/AdminUpdateIncident', {
                    state: {
                        formData: {
                            serviceNo: informant.service_number,
                            tpNumber: informant.tp_number,
                            name: informant.user_name,
                            designation: informant.designation,
                            email: informant.email,
                        },
                        incidentDetails: {
                            refNo: incident.incident_number,
                            category: getCategoryName(incident.category),
                            location: getLocationName(incident.location),
                            priority: incident.priority,
                        },
                    },
                });
            }
        }
    };

    const renderTableRows = () => {
        return currentRows.map((row, idx) => (
            <tr
                key={idx}
                onClick={() => handleRowClick(row.refNo)}
                style={{ cursor: 'pointer' }}
            >
                <td className='team-refno'>{row.refNo}</td>
                <td>{row.assignedTo}</td>
                <td>{row.affectedUser}</td>
                <td>{row.category}</td>
                <td>{row.team}</td>
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

    // Get subcategories for the selected team
    const getSubcategoriesForTeam = (teamName) => {
        if (!teamName) {
            // If no team is selected, return all subcategories
            return categoryItems
                .flatMap(parent => parent.subcategories)
                .map(sub => ({
                    number: sub.child_category_number,
                    name: sub.child_category_name,
                }))
                .filter((v, i, a) => a.findIndex(t => t.number === v.number) === i);
        }

        const selectedTeam = categoryItems.find(
            parent => parent.parent_category_name === teamName
        );
        return selectedTeam
            ? selectedTeam.subcategories.map(sub => ({
                  number: sub.child_category_number,
                  name: sub.child_category_name,
              }))
            : [];
    };

    // Get unique subcategories for the category dropdown
    const uniqueSubcategories = getSubcategoriesForTeam(teamFilter);

    return (
        <div className="AdminAllIncidents-main-content">
            <div className="AdminAllIncidents-direction-bar">
                Incidents {'>'} All Incidents
            </div>
            <div className="AdminAllIncidents-content2">
                <div className="AdminAllIncidents-TitleBar">
                    <div className="AdminAllIncidents-TitleBar-NameAndIcon">
                        <FaHistory size={20} />
                        Incident Log
                    </div>
                    <div className="AdminAllIncidents-TitleBar-buttons">
                        <button className="AdminAllIncidents-TitleBar-buttons-ExportData">
                            <TiExportOutline />
                            Export Data
                        </button>
                    </div>
                </div>
                <div className="AdminAllIncidents-showSearchBar">
                    <div className="AdminAllIncidents-showSearchBar-Show">
                        Entries:
                        <select
                            onChange={e => setRowsPerPage(Number(e.target.value))}
                            value={rowsPerPage}
                            className="AdminAllIncidents-showSearchBar-Show-select"
                        >
                            {[10, 20, 50, 100].map(size => (
                                <option key={size} value={size}>{size} entries</option>
                            ))}
                        </select>
                        Status:
                        <select
                            onChange={e => setStatusFilter(e.target.value)}
                            value={statusFilter}
                            className="AdminAllIncidents-showSearchBar-Show-select"
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
                            className="AdminAllIncidents-showSearchBar-Show-select2"
                        >
                            <option value="">All Categories</option>
                            {uniqueSubcategories.map(sub => (
                                <option key={sub.number} value={sub.name}>
                                    {sub.name}
                                </option>
                            ))}
                        </select>
                        Team:
                        <select
                            onChange={e => {
                                setTeamFilter(e.target.value);
                                setCategoryFilter(''); // Reset category filter when team changes
                            }}
                            value={teamFilter}
                            className="AdminAllIncidents-showSearchBar-Show-select"
                        >
                            <option value="">All Teams</option>
                            {categoryItems.map(parent => (
                                <option key={parent.parent_category_number} value={parent.parent_category_name}>
                                    {parent.parent_category_name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="AdminAllIncidents-showSearchBar-SearchBar">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="AdminAllIncidents-showSearchBar-SearchBar-input"
                        />
                    </div>
                </div>
                <div className="AdminAllIncidents-table">
                    <table className="AdminAllIncidents-table-table">
                        <thead>
                            <tr>
                                <th>Ref No</th>
                                <th>Assigned To</th>
                                <th>Affected User</th>
                                <th>Category</th>
                                <th>Team</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>
                <div className="AdminAllIncidents-content3">
                    <span className="AdminAllIncidents-content3-team-entry-info">
                        Showing {indexOfFirst + 1} to {Math.min(indexOfLast, filteredData.length)} of {filteredData.length} entries
                    </span>
                    <div className="AdminAllIncidents-content3-team-pagination-buttons">
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

export default AdminAllIncidents;