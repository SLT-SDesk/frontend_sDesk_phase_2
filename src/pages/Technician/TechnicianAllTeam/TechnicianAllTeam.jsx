/* eslint-disable react-hooks/rules-of-hooks */

import React, { useState, useEffect } from "react";
import { FaHistory, FaSearch } from "react-icons/fa";

import { TiExportOutline } from "react-icons/ti";
import * as XLSX from "xlsx";

import { IoIosArrowForward } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllIncidentsRequest,
  fetchCurrentTechnicianRequest,
  fetchIncidentHistoryRequest,
} from "../../../redux/incident/incidentSlice";
import { fetchCategoryItemsRequest } from "../../../redux/categories/categorySlice";
import { fetchAllUsersRequest } from "../../../redux/sltusers/sltusersSlice";
import { fetchLocationsRequest } from "../../../redux/location/locationSlice";
import AffectedUserDetail from "../../../components/AffectedUserDetail/AffectedUserDetail";
import IncidentHistory from "../../../components/IncidentHistory/IncidentHistory";
import "./TechnicianAllTeam.css";

const TechnicianAllTeam = () => {
  const dispatch = useDispatch();

  // Redux state
  const { incidents, currentTechnician, loading, error, incidentHistory } =
    useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth);
  const allUsers = useSelector((state) => state.sltusers.users);
  const { locations } = useSelector((state) => state.location);
  const { categoryItems } = useSelector((state) => state.categories);

  // Local state for UI
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [teamIncidents, setTeamIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Check if user is technician
  if (!user || user.role !== "technician") {
    return (
      <div className="TechnicianAllTeam-main-content">
        <div className="TechnicianAllTeam-tickets-creator">
          <span className="TechnicianAllTeam-svr-desk">Incidents</span>
          <IoIosArrowForward />
          <span className="TechnicianAllTeam-created-ticket">All Team</span>
        </div>
        <div className="TechnicianAllTeam-content2">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <h3>Access Denied</h3>
            <p>This page is only accessible to technical officers.</p>
            <p>
              Your current role: <strong>{user?.role || "Unknown"}</strong>
            </p>
            <p>Contact your administrator if you believe this is an error.</p>
          </div>
        </div>
      </div>
    );
  }

  useEffect(() => {
    // Fetch all incidents
    dispatch(fetchAllIncidentsRequest());

    // Fetch current technician data
    if (user && user.serviceNum) {
      dispatch(fetchCurrentTechnicianRequest({ serviceNum: user.serviceNum }));
    }

    // Fetch categories, users, and locations
    dispatch(fetchCategoryItemsRequest());
    dispatch(fetchAllUsersRequest());
    dispatch(fetchLocationsRequest());
  }, [dispatch, user]);

  // Filter team incidents when incidents or technician data changes
  useEffect(() => {
    if (
      incidents &&
      incidents.length > 0 &&
      currentTechnician &&
      categoryItems.length > 0
    ) {
      const teamCategories = categoryItems.filter((cat) => {
        const mainCategoryId = cat.subCategory?.mainCategory?.id;
        const mainCategoryName = cat.subCategory?.mainCategory?.name;
        return (
          mainCategoryId === currentTechnician.team ||
          mainCategoryName === currentTechnician.team
        );
      });

      const teamCategoryNames = teamCategories.map((cat) => cat.name);

      const filteredIncidents = incidents.filter((incident) =>
        teamCategoryNames.includes(incident.category)
      );

      setTeamIncidents(filteredIncidents);
    }
  }, [incidents, currentTechnician, categoryItems]);

  // Helper functions
  const getCategoryName = (categoryName) => {
    return categoryName || "Unknown Category";
  };

  const getUserName = (serviceNumber) => {
    if (!serviceNumber || String(serviceNumber).trim() === '') return 'Unassigned';
    if (!Array.isArray(allUsers)) return serviceNumber;
    const foundUser = allUsers.find(
      (user) => String(user.service_number) === String(serviceNumber) || String(user.serviceNum) === String(serviceNumber)
    );
    return foundUser ? (foundUser.display_name || foundUser.user_name || foundUser.name || serviceNumber) : serviceNumber;
  };

  const getLocationName = (locationId) => {
    const location = locations.find(
      (loc) => loc.id === locationId || loc.loc_number === locationId
    );
    return location ? location.name || location.loc_name : locationId;
  };

  // Process incidents data for table display
  const tableData = [...teamIncidents]
    .sort((a, b) => String(b.incident_number).localeCompare(String(a.incident_number), undefined, { numeric: true }))
    .map((incident) => ({
      refNo: incident.incident_number,
      assignedTo: getUserName(incident.handler),
      affectedUser: getUserName(incident.informant),
      category: getCategoryName(incident.category),
      status: incident.status,
      rawCategory: incident.category,
      location: getLocationName(incident.location),
      priority: incident.priority,
    }));

  const filteredData = tableData.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter
      ? item.rawCategory === categoryFilter
      : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  const handleRowClick = (refNo) => {
    const incident = teamIncidents.find(
      (item) => item.incident_number === refNo
    );
    if (incident) {
      setSelectedIncident(incident);
      setIsPopupVisible(true);
      dispatch(fetchIncidentHistoryRequest({ incident_number: refNo }));
    }
  };

  const renderTableRows = () => {
    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="text-center text-muted py-4">No incidents found.</td>
        </tr>
      );
    }
    return currentRows.map((row, idx) => (
      <tr
        key={idx}
        onClick={() => handleRowClick(row.refNo)}
        style={{ cursor: "pointer" }}
      >
        <td className="team-refno">{row.refNo}</td>
        <td>{row.assignedTo}</td>
        <td>{row.affectedUser}</td>
        <td>{row.category}</td>
        <td className="team-status-text">{row.status}</td>
        <td>{row.location}</td>
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
          className={currentPage === i + 1 ? "active" : ""}
        >
          {i + 1}
        </button>
      ));
    }

    buttons.push(
      <button
        key={1}
        onClick={() => setCurrentPage(1)}
        className={currentPage === 1 ? "active" : ""}
      >
        1
      </button>,
      <button
        key={2}
        onClick={() => setCurrentPage(2)}
        className={currentPage === 2 ? "active" : ""}
      >
        2
      </button>
    );

    if (currentPage > 3) buttons.push(<span key="ellipsis1">...</span>);

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

    if (currentPage < totalPages - 2)
      buttons.push(<span key="ellipsis2">...</span>);

    buttons.push(
      <button
        key={totalPages - 1}
        onClick={() => setCurrentPage(totalPages - 1)}
        className={currentPage === totalPages - 1 ? "active" : ""}
      >
        {totalPages - 1}
      </button>,
      <button
        key={totalPages}
        onClick={() => setCurrentPage(totalPages)}
        className={currentPage === totalPages ? "active" : ""}
      >
        {totalPages}
      </button>
    );

    return buttons;
  };

  const renderPopup = () => {
    // Only show popup if visible and incident is selected
    if (!isPopupVisible || !selectedIncident) {
      return null;
    }

    // Prepare affected user details (informant)
    let informantUser = null;
    if (Array.isArray(allUsers)) {
      informantUser = allUsers.find(
        (u) =>
          String(u.serviceNum).trim() ===
          String(selectedIncident.informant).trim() ||
          String(u.service_number).trim() ===
          String(selectedIncident.informant).trim()
      );
    }
    let formData;
    if (informantUser) {
      formData = {
        serviceNo:
          informantUser.serviceNum || informantUser.service_number || "",
        tpNumber: informantUser.tp_number || informantUser.tpNumber || informantUser.contactNumber || "",
        name:
          informantUser.display_name ||
          informantUser.user_name ||
          informantUser.name ||
          informantUser.email ||
          "",
        designation: informantUser.designation || informantUser.role || "",
        email: informantUser.email || "",
      };
    } else if (selectedIncident && selectedIncident.informant) {
      // Always try to get user from allUsers by service number for fallback
      let fallbackUser = null;
      if (Array.isArray(allUsers)) {
        fallbackUser = allUsers.find(
          (u) =>
            String(u.serviceNum).trim() ===
            String(selectedIncident.informant).trim() ||
            String(u.service_number).trim() ===
            String(selectedIncident.informant).trim()
        );
      }
      formData = {
        serviceNo: selectedIncident.informant,
        tpNumber: fallbackUser?.tp_number || fallbackUser?.tpNumber || fallbackUser?.contactNumber || "",
        name:
          fallbackUser?.display_name ||
          fallbackUser?.user_name ||
          fallbackUser?.name ||
          fallbackUser?.email ||
          "",
        designation: fallbackUser?.designation || fallbackUser?.role || "",
        email: fallbackUser?.email || "",
      };
    } else {
      formData = {
        serviceNo: "",
        tpNumber: "",
        name: "",
        designation: "",
        email: "",
      };
    }

    // Prepare incident details (TechnicianMyReportedUpdate style)
    const incidentDetails = {
      refNo: selectedIncident.incident_number,
      category: getCategoryName(selectedIncident.category),
      location: getLocationName(selectedIncident.location),
      priority: selectedIncident.priority,
      status: selectedIncident.status,
      assignedTo: getUserName(selectedIncident.handler),
      updateBy: getUserName(selectedIncident.update_by),
      updatedOn: selectedIncident.update_on,
      comments: selectedIncident.description,
    };

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button
            className="popup-close"
            onClick={() => setIsPopupVisible(false)}
          >
            X
          </button>
          <br />
          <br />
          <div className="TechnicianMyReportedUpdate-content2">
            <AffectedUserDetail formData={formData} />
            <IncidentHistory
              refNo={incidentDetails.refNo}
              category={incidentDetails.category}
              location={incidentDetails.location}
              priority={incidentDetails.priority}
              status={incidentDetails.status}
              assignedTo={incidentDetails.assignedTo}
              updateBy={incidentDetails.updateBy}
              updatedOn={incidentDetails.updatedOn}
              comments={incidentDetails.comments}
              historyData={incidentHistory}
              users={allUsers}
            />
          </div>
        </div>
      </div>
    );
  };
  // Show loading state
  if (loading) {
    return (
      <div className="TechnicianAllTeam-main-content">
        <div className="TechnicianAllTeam-tickets-creator">
          <span className="TechnicianAllTeam-svr-desk">Incidents</span>
          <IoIosArrowForward />
          <span className="TechnicianAllTeam-created-ticket">All Team</span>
        </div>
        <div className="TechnicianAllTeam-content2">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              fontSize: "18px",
            }}
          >
            Loading team incidents...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="TechnicianAllTeam-main-content">
        <div className="TechnicianAllTeam-tickets-creator">
          <span className="TechnicianAllTeam-svr-desk">Incidents</span>
          <IoIosArrowForward />
          <span className="TechnicianAllTeam-created-ticket">All Team</span>
        </div>
        <div className="TechnicianAllTeam-content2">
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "300px",
              textAlign: "center",
            }}
          >
            <h3 style={{ color: "#d32f2f" }}>Error Loading Team Incidents</h3>
            <p>{error}</p>
            <button
              onClick={() => dispatch(fetchAllIncidentsRequest())}
              style={{
                padding: "8px 16px",
                backgroundColor: "#1976d2",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleExport = () => {
    const dataToExport = filteredData.map((item) => {
      const assignedToUser = (allUsers || []).find(u => u.service_number === item.assignedTo || u.user_name === item.assignedTo);
      const affectedUser = (allUsers || []).find(u => u.service_number === item.affectedUser || u.user_name === item.affectedUser);

      return {
        "Ref No": item.refNo,
        "Assigned To Service No": assignedToUser ? (assignedToUser.service_number || assignedToUser.serviceNum) : 'N/A',
        "Assigned To Name": item.assignedTo,
        "Affected User Service No": affectedUser ? (affectedUser.service_number || affectedUser.serviceNum) : 'N/A',
        "Affected User Name": item.affectedUser,
        "Category": item.category,
        "Status": item.status,
        "Location": item.location,
        "Priority": item.priority,
      };
    });

    const wb = XLSX.utils.book_new();

    // Description data
    const description = [
      ['Technical Officer All Team Incidents Report'],
      [''],
      ['Technical Officer: ' + (user.name || user.email)], // Using 'user' from Redux state
      ['Service Number: ' + user.serviceNum], // Using 'user.serviceNum' from Redux state
      ['Role: Technical Officer'],
      ['Generated on: ' + new Date().toLocaleString()],
      ['Total Records: ' + filteredData.length],
      [''],
      ['Description: This report provides a detailed list of all team incidents, including incident details, assigned technical officer information, and affected user information.'],
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
    XLSX.utils.book_append_sheet(wb, ws, "TechnicianAllTeam");

    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const fileName = `TechnicianAllTeamData_${date}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const uniqueCategories = categoryItems
    .map((cat) => ({
      number: cat.name,
      name: cat.name,
    }))
    .filter((v, i, a) => a.findIndex((t) => t.number === v.number) === i);

  return (
    <div className="TechnicianAllTeam-main-content">
      {renderPopup()}
      <div className="TechnicianAllTeam-tickets-creator">
        <span className="TechnicianAllTeam-svr-desk">Incidents</span>
        <IoIosArrowForward />
        <span className="TechnicianAllTeam-created-ticket">All Team</span>
      </div>
      <div className="TechnicianAllTeam-content2">
        <div className="TechnicianAllTeam-TitleBar">
          <div className="TechnicianAllTeam-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            Incident History - {user?.team || "Team"}
          </div>
          <div className="TechnicianAllTeam-TitleBar-buttons">
            <button className="TechnicianAllTeam-TitleBar-buttons-ExportData" onClick={handleExport}>
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>
        <div className="TechnicianAllTeam-showSearchBar">
          <div className="TechnicianAllTeam-showSearchBar-Show">
            <span>Entries:</span>
            <select
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              value={rowsPerPage}
              className="TechnicianAllTeam-showSearchBar-Show-select"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} entries
                </option>
              ))}
            </select>
            <span>Status:</span>
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
              className="TechnicianAllTeam-showSearchBar-Show-select"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Hold">Hold</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            <span>Category:</span>
            <select
              onChange={(e) => setCategoryFilter(e.target.value)}
              value={categoryFilter}
              className="TechnicianAllTeam-showSearchBar-Show-select2"
            >
              <option value="">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat.number} value={cat.number}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="TechnicianAllTeam-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="TechnicianAllTeam-showSearchBar-SearchBar-input"
            />
          </div>
        </div>
        <div className="TechnicianAllTeam-table">
          <div className="TechnicianAllTeam-table-wrapper">
            <table className="TechnicianAllTeam-table-table">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Assigned To</th>
                  <th>Affected User</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Location</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        </div>
        <div className="TechnicianAllTeam-content3">
          <span className="TechnicianAllTeam-content3-team-entry-info">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="TechnicianAllTeam-content3-team-pagination-buttons">
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
    </div>
  );
};

export default TechnicianAllTeam;