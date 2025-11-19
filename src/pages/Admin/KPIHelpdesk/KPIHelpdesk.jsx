/* eslint-disable no-unused-vars */
import React, { useState, useEffect, use } from 'react';
import './KPIHelpdesk.css';
import { DateRangePicker } from 'react-date-range';
import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';
import { IoMdArrowDropdown } from "react-icons/io";
import { FaCaretUp } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import DateRangePopup from '../../../components/AdminDateRangePopup/DateRangePopup';
import KPITable from '../../../components/AdminKPITable/KPITable';
import PieChartComponent from '../../../components/PieChartComponent/PieChartComponent.jsx';
import KPIReport from './KPIReport'; // Import the KPIReport component
import { 
  dummyIncidentData, 
  filterIncidentsByDateRange, 
  getTeamStatistics, 
  getTeamDistribution 
} from '../../../data/dummyIncidentData.js';
import {getCategoryitemWiseSummary, aggregateIncidentData, getTeamWiseSummary , getMainCategoryWiseSummary, getPieChartData} from '../../../utils/dataAggregator.js';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAllIncidentsRequest } from '../../../redux/incident/incidentSlice.js';
import {fetchMainCategoriesRequest, fetchSubCategoriesRequest, fetchCategoryItemsRequest} from '../../../redux/categories/categorySlice.js';

function KPIHelpdesk() {

  const dispatch = useDispatch();
  const incidents = useSelector(state => state.incident.incidents);
  const mainCategories = useSelector(state => state.categories.mainCategories);
  const subCategories = useSelector(state => state.categories.subCategories);
  const categoryItems = useSelector(state => state.categories.categoryItems);
  useEffect(() => {
    dispatch(fetchAllIncidentsRequest());
    dispatch(fetchMainCategoriesRequest());
    dispatch(fetchSubCategoriesRequest());
    dispatch(fetchCategoryItemsRequest());
  }, [dispatch]);

  const aggregatedData = aggregateIncidentData({
    incidents,
    mainCategories,
    categories: subCategories,
    categoryItems,
  });

  // const mainCategoryWiseSummary = getMainCategoryWiseSummary({ incidents, mainCategories, categories: subCategories, categoryItems });

  // const pieChartData1 = getPieChartData({incidents, mainCategories, categories: subCategories, categoryItems});

  const [openDate, setOpenDate] = useState(false);
   
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showReport, setShowReport] = useState(false); // State to control report view
  
  // Initialize with last 30 days
  const [selectedDateRange, setSelectedDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    key: 'selection',
  });

  //Filtered
  const [mainCategoryWiseSummary, setMainCategoryWiseSummary] = useState([]);
  const [pieChartData1, setPieChartData1] = useState([]);

  useEffect(() => {
  // Filter incidents from Redux by date range
  const filtered = incidents.filter(i => {
    const date = new Date(i.update_on); // adjust property if needed
    return date >= selectedDateRange.startDate && date <= selectedDateRange.endDate;
  });

  // Update summaries using filtered incidents
  setMainCategoryWiseSummary(
    getMainCategoryWiseSummary({
      incidents: filtered,
      mainCategories,
      categories: subCategories,
      categoryItems,
    })
  );
  setPieChartData1(
    getPieChartData({
      incidents: filtered,
      mainCategories,
      categories: subCategories,
      categoryItems,
    })
  );
}, [selectedDateRange, incidents, mainCategories, subCategories, categoryItems]);
// Filtered

  // const [teamData, setTeamData] = useState([]);
  // const [pieChartData, setPieChartData] = useState([]);
   
  // const [filteredIncidents, setFilteredIncidents] = useState([]);

  // // Update data when date range changes
  // useEffect(() => {
  //   const filtered = filterIncidentsByDateRange(
  //     dummyIncidentData, 
  //     selectedDateRange.startDate, 
  //     selectedDateRange.endDate
  //   );
    
  //   setFilteredIncidents(filtered);
    
  //   // Update team statistics
  //   const teamStats = getTeamStatistics(filtered);
  //   setTeamData(teamStats);
    
  //   // Update pie chart data with team distribution
  //   const teamDistribution = getTeamDistribution(filtered);
  //   setPieChartData(teamDistribution);
  // }, [selectedDateRange]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setCurrentDate(new Date());
  //   }, 600000);
  //   return () => clearInterval(interval);
  // }, []);

  const [date, setDate] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
    endDate: new Date(),
    key: 'selection',
  });

  const handleDateRangeApply = (dateRange) => {
    setSelectedDateRange(dateRange);
    console.log('Selected date range:', dateRange);
  };

  const handleChange = (ranges) => {
    setDate(ranges.selection);
  };

  const handleClick = () => {
    setOpenDate(!openDate);
  };

  // Handle View Report button click
  const handleViewReport = () => {
    setShowReport(true);
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setShowReport(false);
  };

  // Format date range for display
  const formatDateRange = () => {
    const start = selectedDateRange.startDate.toLocaleDateString();
    const end = selectedDateRange.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  // If showing report, render KPIReport component
  if (showReport) {
    return (
      <div className="kpi-main-content">
        <div className="kpi-direction-bar">
          <span 
            onClick={handleBackToDashboard} 
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Dashboard
          </span> 
          {' > KPI Helpdesk > Report'}
        </div>
        <KPIReport selectedDateRange={selectedDateRange} />
      </div>
    );
  }

  return (
    <div className="kpi-main-content">
      <div className="kpi-direction-bar">
        Dashboard {'>'} KPI Helpdesk
      </div>
      <div className="kpi-header-section">
        <h1 className="kpi-report-title">KPI Report Overview</h1>
        <button className="kpi-view-report-btn" onClick={handleViewReport}>
          View Report
        </button>
      </div>
      <div className="kpi-time-date-container">
        <div onClick={handleClick} className="kpi-calender"> 
          <SlCalender className="kpi-calender-icon" />
          <span className="kpi-date-range-text">
            Select Date Range
          </span>
          {openDate ? (<FaCaretUp className="kpi-down-up-icon"/>) 
          : (<IoMdArrowDropdown className="kpi-down-up-icon" />)}
        </div>
        
        <DateRangePopup 
          open={openDate}
          onClose={() => setOpenDate(false)}
          onApply={handleDateRangeApply}
          selectedRange={selectedDateRange}
        />
      </div>
      
      <div className="kpi-content2" style={{ display: 'flex', gap: '20px' }}>
        <div className="kpi-left-container" style={{ flex: '1', width: '50%' }}>
          <KPITable data={mainCategoryWiseSummary} />
        </div>
        <div className="kpi-right-container" style={{ flex: '1', width: '50%' }}>
          <div className="kpi-chart-container">
            <div className="kpi-distribution-table-container">
              <PieChartComponent data={pieChartData1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KPIHelpdesk;