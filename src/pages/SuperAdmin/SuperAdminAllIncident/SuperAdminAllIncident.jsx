import React, { useState, useEffect } from "react";
import TechnicianInsident from "../../Technician/TechnicianIncident/TechnicianInsident";
import { FaHistory, FaSearch, FaRegClock } from "react-icons/fa";
import { TiExportOutline } from "react-icons/ti";
import { useDispatch, useSelector } from "react-redux";
import { fetchAdminTeamDataRequest } from "../../../redux/incident/incidentSlice";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "./SuperAdminAllIncident.css";
import IncidentTimelineDialog from "../../../components/IncidentTimelinePopup/IncidentTimelineDialog"; // ⭐ use popup

const SuperAdminAllIncident = () => {
  const [showIncidentPopup, setShowIncidentPopup] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  //  state for Incident Timeline popup (SLA inside component)
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [timelineData, setTimelineData] = useState({
    refNo: "",
    status: "",
    priority: "",
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    incidents,
    loading,
    error,
    mainCategories,
    categoryItems,
    users,
    locations,
  } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth);

  console.log("Raw Incidents from Redux:", incidents);


  useEffect(() => {
    dispatch(fetchAdminTeamDataRequest());

    const intervalId = setInterval(() => {
      dispatch(fetchAdminTeamDataRequest());
    }, 30000);

    return () => clearInterval(intervalId);
  }, [dispatch, user]);

  if (!user) return <div>Error: User not found. Please login again.</div>;

  // ✅ Helper functions
  const getMainCategoryNameFromDatabase = (categoryItemCode) => {
    const transformedCategories =
      categoryItems?.map((item) => ({
        grandchild_category_number: item.category_code,
        grandchild_category_name: item.name,
        child_category_name: item.subCategory?.name || "Unknown Sub",
        child_category_number: item.subCategory?.category_code || "Unknown",
        parent_category_number:
          item.subCategory?.mainCategory?.category_code || "Unknown",
        parent_category_name: item.subCategory?.mainCategory?.name || "Unknown",
      })) || [];

    const found = transformedCategories.find(
      (cat) =>
        cat.grandchild_category_number === categoryItemCode ||
        cat.grandchild_category_name === categoryItemCode
    );
    if (found) return found.parent_category_name;

    const mainCategory = mainCategories?.find(
      (mainCat) =>
        mainCat.category_code === categoryItemCode ||
        mainCat.parent_category_number === categoryItemCode
    );
    return mainCategory ? mainCategory.name || "Unknown" : "Unknown";
  };

  const getCategoryName = (categoryNumber) => {
    const category = categoryItems?.find(
      (cat) => cat.category_code === categoryNumber
    );
    return category ? category.name : categoryNumber;
  };

  const getSubcategoryName = (categoryNumber) => {
    const category = categoryItems?.find(
      (cat) => cat.category_code === categoryNumber
    );
    return category ? category.subCategory?.name || "Unknown" : "Unknown";
  };

  const getUserName = (serviceNumber) => {
    if (!serviceNumber || String(serviceNumber).trim() === '') return 'Unassigned';
    if (!Array.isArray((users || []))) return serviceNumber;
    const foundUser = (users || []).find(
      (user) => String(user.service_number) === String(serviceNumber) || String(user.serviceNum) === String(serviceNumber)
    );
    return foundUser ? (foundUser.display_name || foundUser.user_name || foundUser.name || serviceNumber) : serviceNumber;
  };

  const getLocationName = (locationCode) => {
    const location = locations?.find((loc) => loc.loc_number === locationCode);
    return location ? location.loc_name : locationCode;
  };

  // ✅ Process incident data
  const tableData =
    [...(incidents || [])]
      .sort((a, b) => String(b.incident_number).localeCompare(String(a.incident_number), undefined, { numeric: true }))
      .map((incident) => ({
        refNo: incident.incident_number,
        assignedTo: incident.handler,
        affectedUser: incident.informant,
        category: getCategoryName(incident.category),
        subcategory: getSubcategoryName(incident.category),
        mainCategory: getMainCategoryNameFromDatabase(incident.category),
        status: incident.status,
        location: getLocationName(incident.location),
        priority: incident.priority || "", //  use priority for SLA
        rawCategory: incident.category,
      })) || [];

  // ✅ Filtering logic
  const filteredData = tableData.filter((item) => {
    const matchesSearch = Object.values(item).some((val) =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter
      ? (() => {
        const match = item.mainCategory?.toLowerCase()?.trim() === categoryFilter?.toLowerCase()?.trim();
        console.log(`Checking incident ${item.refNo}:`, {
          itemMainCategory: item.mainCategory,
          filter: categoryFilter,
          match
        });
        return match;
      })()
      : true;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // ✅ Pagination logic
  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirst, indexOfLast);

  const handleRowClick = (refNo) => {
    const incident = incidents.find((item) => item.incident_number === refNo);
    if (incident) {
      setSelectedIncident(incident);
      setShowIncidentPopup(true);
    }
  };

  //  open timeline popup – SLA logic inside IncidentTimelineDialog
  const handleViewTimeline = (refNo, status, priority) => {
    setTimelineData({
      refNo,
      status,
      priority,
    });
    setTimelineOpen(true);
  };

  // ✅ UPDATED Export to Excel with header details
  const exportToExcel = () => {
    if (filteredData.length === 0) {
      alert("No data to export!");
      return;
    }

    const generatedDate = new Date().toLocaleString();
    const totalRecords = filteredData.length;

    // Header info rows
    const headerInfo = [
      [`Report: All Incidents`],
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
        "Sub Category",
        "Main Category",
        "Location",
        "Status",
        "Priority",
      ],
    ];

    // Table rows
    const tableRows = filteredData.map((item) => [
      item.refNo,
      getUserName(item.assignedTo),
      getUserName(item.affectedUser),
      item.category,
      item.subcategory,
      item.mainCategory,
      item.location,
      item.status,
      item.priority,
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
      { wch: 25 },
      { wch: 15 },
      { wch: 15 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "All Incidents");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });
    saveAs(blob, `All_Incidents_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // ✅ Render table rows
  const renderTableRows = () => {
    if (currentRows.length === 0) {
      return (
        <tr>
          <td colSpan="7" style={{ textAlign: "center", padding: "20px" }}>
            No incidents found.
          </td>
        </tr>
      );
    }

    return currentRows.map((row, idx) => (
      <tr
        key={idx}
        onClick={() => handleRowClick(row.refNo)}
        style={{ cursor: "pointer" }}
      >
        <td className="team-refno">
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
        <td>{getUserName(row.assignedTo)}</td>
        <td>{getUserName(row.affectedUser)}</td>
        <td>{row.category}</td>
        <td>{row.mainCategory}</td>
        <td>{row.location}</td>
        <td className="team-status-text">{row.status}</td>
        <td>
          <button
            className="incident-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleViewTimeline(row.refNo, row.status, row.priority);
            }}
          >
            <FaRegClock size={12} />
            &nbsp;View Timeline
          </button>
        </td>
      </tr>
    ));
  };

  // ✅ Render pagination buttons
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

  if (error) {
    return (
      <div className="SuperAdminincidentViewAll-main-content">
        <div className="SuperAdminincidentViewAll-direction-bar">
          Incidents {">"} All Incidents
        </div>
        <div className="SuperAdminincidentViewAll-content2">
          <div style={{ textAlign: "center", padding: "20px", color: "red" }}>
            Error loading incidents: {error}
          </div>
        </div>
      </div>
    );
  }

  // ✅ Final UI
  return (
    <div className="SuperAdminincidentViewAll-main-content">
      <div className="SuperAdminincidentViewAll-direction-bar">
        Incidents {">"} All Incidents
      </div>
      <div className="SuperAdminincidentViewAll-content2">
        <div className="SuperAdminincidentViewAll-TitleBar">
          <div className="SuperAdminincidentViewAll-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            All Incidents Log
          </div>
          <div className="SuperAdminincidentViewAll-TitleBar-buttons">
            <button
              className="SuperAdminincidentViewAll-TitleBar-buttons-ExportData"
              onClick={exportToExcel}
            >
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>

        {/* ✅ Search & Filter */}
        <div className="SuperAdminincidentViewAll-showSearchBar">
          <div className="SuperAdminincidentViewAll-showSearchBar-Show">
            Entries:
            <select
              onChange={(e) => setRowsPerPage(Number(e.target.value))}
              value={rowsPerPage}
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
            >
              <option value="">All Categories</option>
              {mainCategories &&
                mainCategories.map((cat) => (
                  <option
                    key={cat.category_code || cat.parent_category_number}
                    value={cat.name || cat.parent_category_name}
                  >
                    {cat.name || cat.parent_category_name}
                  </option>
                ))}
            </select>
          </div>
          <div className="SuperAdminincidentViewAll-showSearchBar-SearchBar">
            <FaSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* ✅ Table */}
        <div className="SuperAdminincidentViewAll-table">
          <table>
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Assigned To</th>
                <th>Affected User</th>
                <th>Category</th>
                <th>Main Category</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>
        </div>

        {/* ✅ Pagination */}
        <div className="SuperAdminincidentViewAll-content3">
          <span>
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredData.length)} of{" "}
            {filteredData.length} entries
          </span>
          <div className="SuperAdminincidentViewAll-content3-team-pagination-buttons">
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

        {/* ✅ Popup */}
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
                updateBy={
                  user?.name ||
                  user?.user_name ||
                  user?.display_name ||
                  user?.email
                }
                affectedUserDetails={(() => {
                  const affectedUser = users?.find(
                    (u) =>
                      u.service_number === selectedIncident?.informant ||
                      u.serviceNum === selectedIncident?.informant
                  );
                  return {
                    serviceNo: selectedIncident?.informant,
                    name:
                      affectedUser?.display_name ||
                      affectedUser?.user_name ||
                      "",
                    designation: affectedUser?.role || "",
                    email: affectedUser?.email || "",
                  };
                })()}
              />
            </div>
          </div>
        )}
        <IncidentTimelineDialog
          open={timelineOpen}
          onClose={() => setTimelineOpen(false)}
          incidentRef={timelineData.refNo}
          status={timelineData.status}
          priority={timelineData.priority}
        />
      </div>
    </div>
  );
};

export default SuperAdminAllIncident;
