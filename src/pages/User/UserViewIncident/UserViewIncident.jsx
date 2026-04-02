import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { FaHistory, FaSearch } from "react-icons/fa";
import { TiExportOutline } from "react-icons/ti";
import * as XLSX from 'xlsx';
import {
  fetchAssignedByMeRequest,
  fetchCategoriesRequest,
} from "../../../redux/incident/incidentSlice";
import { fetchAllUsersRequest } from "../../../redux/sltusers/sltusersSlice";
import UserUpdateIncident from "../UserUpdateIncident/UserUpdateIncident";
import "./UserViewIncident.css";

const UserViewIncident = () => {
  
  const dispatch = useDispatch();

  // Get data from Redux store
  const { user } = useSelector((state) => state.auth);
  const { assignedByMe, loading, error, incidentHistory } = useSelector(
    (state) => state.incident
  );
  


  // State for filters and pagination
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter] = useState("all");
  const [categoryFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState(""); // Define searchTerm state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showUpdatePopup, setShowUpdatePopup] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Fetch incidents and categories from the backend
  useEffect(() => {
    if (user && user.serviceNum) {
      dispatch(fetchAssignedByMeRequest({ serviceNum: user.serviceNum }));
    }
    dispatch(fetchCategoriesRequest());
    dispatch(fetchAllUsersRequest());
  }, [dispatch, user]);

  useEffect(() => {
    // Ensure assignedByMe is not null/undefined before filtering
    const incidentsToFilter = assignedByMe || [];
    const filtered = incidentsToFilter.filter((incident) => {
      const statusMatch =
        statusFilter === "all" || incident.status === statusFilter;
      const priorityMatch =
        priorityFilter === "all" || incident.priority === priorityFilter;
      const categoryMatch =
        categoryFilter === "all" || incident.category === categoryFilter;
      const searchMatch = 
        !searchTerm ||
        Object.values(incident).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

      return statusMatch && priorityMatch && categoryMatch && searchMatch;
    });

    setFilteredIncidents(filtered);
  }, [assignedByMe, statusFilter, priorityFilter, categoryFilter, searchTerm]); // Add searchTerm to dependency array

  // Handle loading and error states
  if (loading && !assignedByMe?.length) return <div>Loading incidents...</div>;
  if (error) {
    return (
      <div className="UserViewIncident-main-content">
        <div className="UserViewIncident-direction-bar">
          Incidents {'>'} My Incidents
        </div>
        <div className="UserViewIncident-content2">
          <div className="error-container">
            <p>Error loading incidents: {error}</p>
            <button onClick={() => dispatch(fetchAssignedByMeRequest({ informant: user.serviceNum }))}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!user) return <div>Loading user data...</div>;

  // Pagination calculations
  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentRows = filteredIncidents.slice(indexOfFirst, indexOfLast);

  const handleExport = () => {
    const dataToExport = currentRows.map(incident => {
        

        return {
            'Ref No': incident.incident_number,
            'Category': incident.category,
            'Status': incident.status,
            'Priority': incident.priority,
            
        };
    });

    const wb = XLSX.utils.book_new();

    // Description data
    const description = [
      ['User View Incidents Report'],
      [''],
      ['User: ' + (user.name || user.email)], // Using 'user' from Redux state
      ['Service Number: ' + user.serviceNum], // Using 'user.serviceNum' from Redux state
      ['Generated on: ' + new Date().toLocaleString()],
      ['Total Records: ' + filteredIncidents.length],
      [''],
      ['Description: This report provides a detailed list of incidents viewed by the user, including incident details, reported user information, and assigned technical officer information.'],
      [''],
    ];

    // Convert dataToExport to array of arrays for easier concatenation
    const header = Object.keys(dataToExport[0] || {});
    const dataRows = dataToExport.map(item => Object.values(item));

    // Combine description, header, and data rows
    const combinedData = [...description, header, ...dataRows];

    const ws = XLSX.utils.aoa_to_sheet(combinedData);

    // Apply autofilter to the data portion (excluding description and header)
    // if (dataToExport.length > 0) {
    //     const dataStartRow = description.length + 1; // +1 for the header row
    //     const range = XLSX.utils.decode_range(ws['!ref']);
    //     range.s.r = dataStartRow; // Start row for autofilter
    //     ws['!autofilter'] = { ref: XLSX.utils.encode_range(range) };
    // }
    XLSX.utils.book_append_sheet(wb, ws, "UserViewIncidents");
    
    const today = new Date();
    const dateString = `${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;
    XLSX.writeFile(wb, `UserViewIncidentData_${dateString}.xlsx`);
};

  // Popup open handler
  const handleRefNoClick = (incident) => {
    setSelectedIncident(incident);
    setShowUpdatePopup(true);
  };

  // Render pagination buttons (assuming this function is correct from previous steps)
  const renderPaginationButtons = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={currentPage === i ? "active" : ""}
        >
          {i}
        </button>
      );
    }
    return buttons;
  };

  return (
    <div className="UserViewIncident-main-content">
      <div className="UserViewIncident-direction-bar">
        Incidents
      </div>
      <div className="UserViewIncident-content2">
        <div className="UserViewIncident-TitleBar">
          <div className="UserViewIncident-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            My Incidents - {user.name || user.email} 
          </div>
          <div className="UserViewIncident-TitleBar-buttons">
            <button className="UserViewIncident-TitleBar-buttons-ExportData" onClick={handleExport}>
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>
        <div className="UserViewIncident-showSearchBar">
          <div className="UserViewIncident-showSearchBar-Show">
            Status:
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
              className="UserViewIncident-showSearchBar-Show-select"
            >
              <option value="all">All Status</option>
              <option value="Open">Open</option>
              <option value="Hold">Hold</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
          <div className="UserViewIncident-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="UserViewIncident-showSearchBar-SearchBar-input"
            />
          </div>
        </div>
        <div className="UserViewIncident-table">
          <table className="UserViewIncident-table-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {currentRows.length > 0 ? (
                currentRows.map((incident) => {
                  // Find all history for this incident
                  const historyForIncident = (incidentHistory || []).filter(
                    h => h.incidentNumber === incident.incident_number
                  );
                  // Get latest status (last item, or fallback to incident.status)
                  const latestStatus = historyForIncident.length > 0
                    ? historyForIncident[historyForIncident.length - 1].status
                    : incident.status;
                  return (
                    <tr
                      key={incident.incident_number}
                    >
                      <td
                        className="UserViewIncident-refno"
                        style={{ cursor: "pointer", color: "black", textDecoration: "none" }}
                        onClick={() => handleRefNoClick(incident)}
                      >
                        {incident.incident_number}
                      </td>
                      <td>{incident.category}</td>
                      <td className="UserViewIncident-status-text">{latestStatus}</td>
                      <td>{incident.priority}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4">No incidents found in here.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="UserViewIncident-content3">
          <span className="UserViewIncident-content3-team-entry-info">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredIncidents.length)} of{" "}
            {filteredIncidents.length} entries
          </span>
          <div className="UserViewIncident-content3-team-pagination-buttons">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            {renderPaginationButtons()}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {/* Popup/modal for UserUpdateIncident */}
      {showUpdatePopup && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <UserUpdateIncident
              incidentData={selectedIncident}
              isPopup={true}
              onClose={() => setShowUpdatePopup(false)}
              loggedInUser={user}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserViewIncident;