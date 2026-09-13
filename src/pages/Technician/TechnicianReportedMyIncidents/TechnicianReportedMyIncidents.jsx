import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { FaHistory, FaSearch } from 'react-icons/fa';
import { TiExportOutline } from 'react-icons/ti';
import * as XLSX from 'xlsx';
import { IoIosArrowForward } from 'react-icons/io';
import { fetchAssignedByMeRequest, fetchIncidentHistoryRequest } from '../../../redux/incident/incidentSlice';
import { fetchAllUsersRequest } from '../../../redux/sltusers/sltusersSlice';
import AffectedUserDetail from '../../../components/AffectedUserDetail/AffectedUserDetail';
import IncidentHistory from '../../../components/IncidentHistory/IncidentHistory';
import './TechnicianReportedMyIncidents.css';

const TechnicianReportedMyIncidents = () => {

  const dispatch = useDispatch();
  const location = useLocation(); // re-fetch whenever user navigates to this page

  // Redux state
  const { assignedByMe, loading, error, incidentHistory } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth); // Get logged-in user from auth slice
  const { allUsers } = useSelector((state) => state.sltusers);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Fetch on every navigation to this page
  useEffect(() => {
    if (user && (user.role === 'technician' || user.role === 'teamLeader') && user.serviceNum) {
      dispatch(fetchAssignedByMeRequest({ serviceNum: user.serviceNum }));
    }
    dispatch(fetchAllUsersRequest());
  }, [dispatch, user, location.pathname]);

  if (loading) {
    return (
      <div className="TechnicianReportedMyIncidents-main-content">
        <div className="TechnicianReportedMyIncidents-direction-bar">
          Incidents {'>'} My Reported Incidents
        </div>
        <div className="TechnicianReportedMyIncidents-content2">
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading reported incidents...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="TechnicianReportedMyIncidents-main-content">
        <div className="TechnicianReportedMyIncidents-direction-bar">
          Incidents {'>'} My Reported Incidents
        </div>
        <div className="TechnicianReportedMyIncidents-content2">
          <div className="error-container">
            <p>Error loading reported incidents: {error}</p>
            <button onClick={() => dispatch(fetchAssignedByMeRequest({ serviceNum: user.serviceNum }))}>
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const tableData = (assignedByMe || []).map(item => ({
    refNo: item.incident_number,
    category: item.category, // Category name from backend
    status: item.status,
    priority: item.priority,
    informant: item.informant, // service_number of the reporter
  }));

  const filteredData = tableData.filter(item => {
    const matchesSearch = Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesStatus = statusFilter ? item.status === statusFilter : true;
    const matchesCategory = categoryFilter ? item.category === categoryFilter : true;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const currentRows = filteredData;

  const handleRowClick = (refNo) => {
    const incident = assignedByMe.find(item => item.incident_number === refNo);
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
          <td colSpan="4" className="text-center text-muted py-4">No incidents found.</td>
        </tr>
      );
    }
    return currentRows.map((row, idx) => (
      <tr key={idx}>
        <td className='TechnicianReportedMyIncidents-refno'>
          <a
            href="#"
            onClick={e => {
              e.preventDefault();
              handleRowClick(row.refNo);
            }}
            style={{ color: '#222', textDecoration: 'none', cursor: 'pointer' }}
          >
            {row.refNo}
          </a>
        </td>
        <td>{row.category}</td>
        <td className='TechnicianReportedMyIncidents-status-text'>{row.status}</td>
        <td>{row.priority}</td>
      </tr>
    ));
  };

  const handleExport = () => {
    const dataToExport = filteredData.map(item => {

      // Assuming 'item' also contains information about the affected user's service number, if not, you might need to adjust how you get this.
      // For now, let's assume the affected user is the same as the informant if not specified.
      // Placeholder, adjust if affected user is different

      return {
        "Ref No": item.refNo,
        "Category": item.category,
        "Status": item.status,
        "Priority": item.priority,

      };
    });

    const wb = XLSX.utils.book_new();

    // Description data
    const description = [
      ['My Reported Incidents Report'],
      [''],
      ['Technical Officer: ' + (user.name || user.email)], // Using 'user' from Redux state
      ['Service Number: ' + user.serviceNum], // Using 'user.serviceNum' from Redux state
      ['Role: Technical Officer'],
      ['Generated on: ' + new Date().toLocaleString()],
      ['Total Records: ' + filteredData.length],
      [''],
      ['Description: This report provides a detailed list of incidents reported by the technical officer, including incident details, reported user information, and affected user information.'],
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
    XLSX.utils.book_append_sheet(wb, ws, "MyReportedIncidents");

    const today = new Date();
    const date = today.toISOString().split('T')[0];
    const fileName = `MyReportedIncidentsData_${date}.xlsx`;

    XLSX.writeFile(wb, fileName);
  };

  const uniqueCategories = [...new Set(tableData.map(item => item.category))];

  const renderPopup = () => {
    if (!isPopupVisible || !selectedIncident) {
      return null;
    }

    const formData = {
      serviceNo: user.serviceNum,
      tpNumber: user.tp_number || user.tpNumber || user.contactNumber || '',
      name: user.user_name || user.name || user.email,
      designation: user.designation || user.role || '',
      email: user.email,
    };

    const incidentDetails = {
      refNo: selectedIncident.incident_number,
      category: selectedIncident.category,
      location: selectedIncident.location,
      priority: selectedIncident.priority,
      status: selectedIncident.status,
    };

    return (
      <div className="popup-overlay">
        <div className="popup-content">
          <button className="popup-close" onClick={() => setIsPopupVisible(false)}>X</button>

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
              historyData={incidentHistory}
              users={allUsers}
            />
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return <div>Loading user data...</div>;
  }
  if (!user.serviceNum) {
    return <div>User data missing serviceNum. Please contact admin.</div>;
  }
  if (user.role !== 'technician' && user.role !== 'teamLeader') {
    return <div>Unauthorized: Only technical officers can view this page.</div>;
  }

  return (
    <div className="TechnicianReportedMyIncidents-main-content">
      {renderPopup()}
      <div className="TechnicianReportedMyIncidents-tickets-creator">
        <span className="TechnicianReportedMyIncidents-svr-desk">Incidents</span>
        <IoIosArrowForward />
        <span className="TechnicianReportedMyIncidents-created-ticket">Reported My</span>
      </div>

      <div className="TechnicianReportedMyIncidents-content2">
        <div className="TechnicianReportedMyIncidents-TitleBar">
          <div className="TechnicianReportedMyIncidents-TitleBar-NameAndIcon">
            <FaHistory size={20} />
            My Incidents - {user.name || user.email}
          </div>
          <div className="TechnicianReportedMyIncidents-TitleBar-buttons">
            <button className="TechnicianReportedMyIncidents-TitleBar-buttons-ExportData" onClick={handleExport}>
              <TiExportOutline />
              Export Data
            </button>
          </div>
        </div>

        <div className="TechnicianReportedMyIncidents-showSearchBar container-fluid p-0">
          <div className="row m-0 w-100">
            <div className="col-md-7 col-lg-8 p-0">
              <div className="TechnicianReportedMyIncidents-showSearchBar-Show d-flex flex-wrap align-items-center">
                <div className="d-flex align-items-center me-3 mb-2 mb-sm-0">
                  Status:
                  <select
                    onChange={e => setStatusFilter(e.target.value)}
                    value={statusFilter}
                    className="TechnicianReportedMyIncidents-showSearchBar-Show-select ms-2"
                  >
                    <option value="">All Status</option>
                    <option value="Open">Open</option>
                    <option value="Hold">Hold</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>
                <div className="d-flex align-items-center mb-2 mb-sm-0">
                  Category:
                  <select
                    onChange={e => setCategoryFilter(e.target.value)}
                    value={categoryFilter}
                    className="TechnicianReportedMyIncidents-showSearchBar-Show-select2 ms-2"
                  >
                    <option value="">All Categories</option>
                    {uniqueCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="col-md-5 col-lg-4 p-0 d-flex justify-content-md-end justify-content-start mt-2 mt-md-0">
              <div className="TechnicianReportedMyIncidents-showSearchBar-SearchBar">
                <FaSearch />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="TechnicianReportedMyIncidents-showSearchBar-SearchBar-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="TechnicianReportedMyIncidents-table">
          <table className="TechnicianReportedMyIncidents-table-table">
            <thead>
              <tr>
                <th>Ref No</th>
                <th>Category</th>
                <th>Status</th>
                <th>Priority</th>
              </tr>
            </thead>
            <tbody>
              {renderTableRows()}
            </tbody>
          </table>
        </div>
        <div className="TechnicianReportedMyIncidents-content3">
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

export default TechnicianReportedMyIncidents;
