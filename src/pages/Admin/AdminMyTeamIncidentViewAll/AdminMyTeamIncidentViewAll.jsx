import React, { useState, useEffect } from "react";
import TechnicianInsident from "../../Technician/TechnicianIncident/TechnicianInsident";
import { FaHistory, FaSearch } from "react-icons/fa";
import { TiExportOutline } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAdminTeamDataRequest,
} from "../../../redux/incident/incidentSlice";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./AdminMyTeamIncidentViewAll.css";

const AdminMyTeamIncidentViewAll = () => {
  const [showIncidentPopup, setShowIncidentPopup] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const {
    incidents,
    mainCategories,
    categoryItems,
    users,
    locations,
    loading,
    error,
  } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth);

  const currentAdmin = user;

  useEffect(() => {
    dispatch(fetchAdminTeamDataRequest());
  }, [dispatch, user, currentAdmin]);

  if (!user) {
    return <div>Error: User not found. Please login again.</div>;
  }

  if (!currentAdmin) {
    return <div>Error: Admin user not found.</div>;
  }

  const adminTeam = currentAdmin.parent_category_name || "All Team";

  const getMainCategoryNameFromDatabase = (categoryItemCode) => {
    const transformedCategories = categoryItems.map((item) => ({
      grandchild_category_number: item.category_code,
      grandchild_category_name: item.name,
      child_category_name: item.subCategory?.name || "Unknown Sub",
      child_category_number: item.subCategory?.category_code || "Unknown",
      parent_category_number:
        item.subCategory?.mainCategory?.category_code || "Unknown",
      parent_category_name: item.subCategory?.mainCategory?.name || "Unknown",
      category_code: item.category_code,
      name: item.name,
    }));

    const categoryItem = transformedCategories.find(
      (cat) => cat.grandchild_category_number === categoryItemCode
    );
    if (categoryItem) return categoryItem.parent_category_name;

    const categoryByName = transformedCategories.find(
      (cat) =>
        cat.grandchild_category_name &&
        cat.grandchild_category_name.toLowerCase() ===
          categoryItemCode.toLowerCase()
    );
    if (categoryByName) return categoryByName.parent_category_name;

    const mainCategory = mainCategories.find(
      (mainCat) =>
        mainCat.category_code === categoryItemCode ||
        mainCat.parent_category_number === categoryItemCode
    );
    if (mainCategory) {
      return mainCategory.name || mainCategory.parent_category_name;
    }
    return "Unknown";
  };

  const getUserName = (serviceNumber) => {
    const foundUser = users.find(
      (user) => user.service_number === serviceNumber
    );
    return foundUser ? foundUser.user_name : serviceNumber;
  };

  const getLocationName = (locationCode) => {
    const location = locations.find((loc) => loc.loc_number === locationCode);
    return location ? location.loc_name : locationCode;
  };

  const incidentsToUse = incidents || [];
  const processedIncidents = [];

  if (incidentsToUse && incidentsToUse.length > 0) {
    incidentsToUse.forEach((dbIncident) => {
      const processedIncident = {
        incident_number: dbIncident.incident_number,
        informant: dbIncident.informant,
        location: dbIncident.location,
        handler: dbIncident.handler,
        update_by: dbIncident.update_by,
        category: dbIncident.category,
        update_on: dbIncident.update_on,
        status: dbIncident.status,
        priority: dbIncident.priority,
        description: dbIncident.description,
        notify_infromant: dbIncident.notify_informant,
        Attachment: dbIncident.Attachment,
      };
      processedIncidents.push(processedIncident);
    });
  }

  const transformedTeamIncidents = processedIncidents;

  const tableData = transformedTeamIncidents.map((incident) => ({
    "Reference No": incident.incident_number,
    "Assigned To": getUserName(incident.handler),
    "Affected User": getUserName(incident.informant),
    "Category": incident.category,
    "Main Category": getMainCategoryNameFromDatabase(incident.category),
    "Location": getLocationName(incident.location),
    "Status": incident.status,
    "Priority": incident.priority,
  }));

  const filteredData = tableData.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter ? item.Status === statusFilter : true;
    const matchesCategory = categoryFilter
      ? item["Main Category"] === categoryFilter
      : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  const handleRowClick = (refNo) => {
    const incident = transformedTeamIncidents.find(
      (item) => item.incident_number === refNo
    );
    if (incident) {
      setSelectedIncident(incident);
      setShowIncidentPopup(true);
    }
  };

  // 🟢 UPDATED Excel Export Function with Header Info
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data to export!");
      return;
    }

    const generatedDate = new Date().toLocaleString();
    const totalRecords = filteredData.length;

    // Header info
    const headerInfo = [
      [`Report: My Team Incidents`],
      [`Team: ${adminTeam}`],
      [`Name: ${user?.name || user?.user_name || "N/A"}`],
      [`Service Number: ${user?.service_number || user?.serviceNum || "N/A"}`],
      [`Role: ${user?.role || "N/A"}`],
      [`Generated: ${generatedDate}`],
      [`Total Records: ${totalRecords}`],
      [],
    ];

    // Table headers
    const tableHeaders = [
      [
        "Reference No",
        "Assigned To",
        "Affected User",
        "Category",
        "Main Category",
        "Location",
        "Status",
        "Priority",
      ],
    ];

    // Table rows
    const tableRows = filteredData.map((item) => [
      item["Reference No"],
      item["Assigned To"],
      item["Affected User"],
      item["Category"],
      item["Main Category"],
      item["Location"],
      item["Status"],
      item["Priority"],
    ]);

    const finalData = [...headerInfo, ...tableHeaders, ...tableRows];

    const worksheet = XLSX.utils.aoa_to_sheet(finalData);
    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "My Team Incidents");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `My_Team_Incidents_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const renderTableRows = () => {
    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan="6" style={{ textAlign: "center", padding: "20px" }}>
            No incidents found.
          </td>
        </tr>
      );
    }
    return currentRows.map((row, idx) => (
      <tr
        key={idx}
        onClick={() => handleRowClick(row["Reference No"])}
        style={{ cursor: "pointer" }}
      >
        <td>{row["Reference No"]}</td>
        <td>{row["Assigned To"]}</td>
        <td>{row["Affected User"]}</td>
        <td>{row["Category"]}</td>
        <td>{row["Location"]}</td>
        <td>{row["Status"]}</td>
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
      <button key={1} onClick={() => setCurrentPage(1)} className={currentPage === 1 ? "active" : ""}>
        1
      </button>,
      <button key={2} onClick={() => setCurrentPage(2)} className={currentPage === 2 ? "active" : ""}>
        2
      </button>
    );

    if (currentPage > 3) buttons.push(<span key="ellipsis1">...</span>);
    if (currentPage > 3 && currentPage < totalPages - 2) {
      buttons.push(
        <button key={currentPage} onClick={() => setCurrentPage(currentPage)} className="active">
          {currentPage}
        </button>
      );
    }
    if (currentPage < totalPages - 2) buttons.push(<span key="ellipsis2">...</span>);
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

  if (error) {
    return (
      <div className="AdminincidentViewAll-main-content">
        <div className="AdminincidentViewAll-direction-bar">
          Incidents {">"} My Team Incidents
        </div>
        <div className="AdminincidentViewAll-content2">
          <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
            Error loading incidents: {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminincidentViewAll-main-content">
      <div className="AdminincidentViewAll-direction-bar">
        Incidents {">"} My Team Incidents
      </div>
      <div className="AdminincidentViewAll-content2">
        <div className="AdminincidentViewAll-TitleBar">
          <div className="AdminincidentViewAll-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            {adminTeam} - Incident Log
          </div>
          <div className="AdminincidentViewAll-TitleBar-buttons">
            <button
              className="AdminincidentViewAll-TitleBar-buttons-ExportData"
              onClick={exportToExcel}
            >
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>

        <div className="AdminincidentViewAll-showSearchBar">
          <div className="AdminincidentViewAll-showSearchBar-Show">
            Entries:
            <select
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              value={rowsPerPage}
              className="AdminincidentViewAll-showSearchBar-Show-select"
            >
              {[10, 20, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size} entries
                </option>
              ))}
            </select>
            Status:
            <select
              onChange={(e) => setStatusFilter(e.target.value)}
              value={statusFilter}
              className="AdminincidentViewAll-showSearchBar-Show-select"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="Hold">Hold</option>
              <option value="In Progress">In Progress</option>
              <option value="Closed">Closed</option>
            </select>
            Category:
            <select
              onChange={(e) => setCategoryFilter(e.target.value)}
              value={categoryFilter}
              className="AdminincidentViewAll-showSearchBar-Show-select2"
            >
              <option value="">All Categories</option>
              {mainCategories.map((category) => (
                <option
                  key={
                    category.category_code || category.parent_category_number
                  }
                  value={category.name || category.parent_category_name}
                >
                  {category.name || category.parent_category_name}
                </option>
              ))}
            </select>
          </div>
          <div className="AdminincidentViewAll-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="AdminincidentViewAll-showSearchBar-SearchBar-input"
            />
          </div>
        </div>

        <div className="AdminincidentViewAll-table">
          <div className="AdminincidentViewAll-table-wrapper">
            <table className="AdminincidentViewAll-table-table">
              <thead>
                <tr>
                  <th>Ref No</th>
                  <th>Assigned To</th>
                  <th>Affected User</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>{renderTableRows()}</tbody>
            </table>
          </div>
        </div>

        <div className="AdminincidentViewAll-content3">
          <span className="AdminincidentViewAll-content3-team-entry-info">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="AdminincidentViewAll-content3-team-pagination-buttons">
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

        {showIncidentPopup && selectedIncident && (
          <div className="incident-popup-overlay">
            <div className="incident-popup-content">
              <button
                className="incident-popup-close-btn"
                onClick={() => setShowIncidentPopup(false)}
              >
                X
              </button>
              <TechnicianInsident
                incidentData={selectedIncident}
                isPopup={true}
                loggedInUser={user}
                updateBy={user?.userName}
                showUpdateStatus={true}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMyTeamIncidentViewAll;
