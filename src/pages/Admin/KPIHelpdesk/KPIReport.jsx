/* eslint-disable no-unused-vars */
import Dialog from "@mui/material/Dialog";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import DateRangePopup from "../../../components/AdminDateRangePopup/DateRangePopup";
import BarChartComponent from "../../../components/BarChartComponent/BarChartComponent";
import CategorySelector from "../../../components/CategorySelector/CategorySelector";
import CategoryItemTble from "../../../components/CategoryTable/CategoryItemTble";
import DistributionTable from "../../../components/DistributionTable/DistributionTable";
import MonthlyIncidentSummary from "../../../components/MonthlyIncidentSummary/MonthlyIncidentSummary";
import { filterIncidentsByDateRange } from "../../../data/dummyIncidentData.js";
import {
  fetchCategoryItemsRequest,
  fetchMainCategoriesRequest,
  fetchSubCategoriesRequest,
} from "../../../redux/categories/categorySlice.js";
import { fetchAllIncidentsRequest } from "../../../redux/incident/incidentSlice.js";
import {
  getBarChartData,
  getDistributionTableAllData,
  getDistributionTableData,
  getSelectedCategoryItemsDatabyCategoryId,
} from "../../../utils/dataAggregator.js";
import "./KPIReport.css";

const KPIReport = ({ selectedDateRange: propDateRange }) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const [datePopupOpen, setDatePopupOpen] = useState(false);
  const [selectedDateRange, setSelectedDateRange] = useState(
    propDateRange || {
      selection: "Last 30 Days",
      startDate: new Date(new Date().setDate(new Date().getDate() - 30)),
      endDate: new Date(),
      key: "selection",
    }
  );
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState("All Teams");
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [filteredIncidentsNew, setFilteredIncidentsNew] = useState([]);
  const [monthlyData, setMonthlyData] = useState({
    BF: [],
    Reported: [],
    Cleared: [],
    CF: [],
  });
  const [barChartData, setBarChartData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [distributionTableAllData, setDistributionTableAllData] = useState([]);
  const [selectedCategoryItems, setSelectedCategoryItems] = useState([]);

  const dispatch = useDispatch();
  const incidents = useSelector((state) => state.incident.incidents);
  const mainCategories = useSelector(
    (state) => state.categories.mainCategories
  );
  const subCategories = useSelector((state) => state.categories.subCategories);
  const categoryItems = useSelector((state) => state.categories.categoryItems);
  useEffect(() => {
    dispatch(fetchAllIncidentsRequest());
    dispatch(fetchMainCategoriesRequest());
    dispatch(fetchSubCategoriesRequest());
    dispatch(fetchCategoryItemsRequest());
  }, [dispatch]);

  // New Filtered
  useEffect(() => {
    setFilteredIncidentsNew(
      incidents.filter((i) => {
        const date = new Date(i.update_on); // adjust property if needed
        return (
          date >= selectedDateRange.startDate &&
          date <= selectedDateRange.endDate
        );
      })
    );
    setDistributionData(
      getDistributionTableData({
        incidents: filteredIncidentsNew,
        categories: subCategories,
        categoryItems,
        selectedTeam,
      })
    );
    setBarChartData(
      getBarChartData({
        incidents: filteredIncidentsNew,
        categories: subCategories,
        categoryItems,
        selectedTeam,
      })
    );
    setDistributionTableAllData(
      getDistributionTableAllData({
        incidents: filteredIncidentsNew,
        categories: subCategories,
        categoryItems,
        selectedTeam,
      })
    );

    // setMonthlyData(
    //   getMonthlySummary({
    //     incidents: filteredIncidentsNew,
    //     mainCategories,
    //     categoryItems,
    //     months
    //   })
    // );
  }, [
    incidents,
    selectedDateRange,
    subCategories,
    categoryItems,
    selectedTeam,
  ]);
  // console.log(barChartData);
  // console.log(monthlyData);
  //New filtered end

  // Filter incidents based on date range and team selection
  useEffect(() => {
    let filtered = filterIncidentsByDateRange(
      filteredIncidentsNew,
      selectedDateRange.startDate,
      selectedDateRange.endDate
    );

    // Apply team filter if a specific team is selected
    // if (selectedTeam && selectedTeam !== "All Teams") {
    //   setFilteredIncidentsNew(
    //     filterIncidentsByMainCategory(
    //     {incidents: filteredIncidentsNew,
    //     mainCategories,
    //     categoryItems,
    //     selectedTeam}
    //   )      )
    // }

    setFilteredIncidents(filtered);

    // Calculate monthly incident data
    const monthlyStats = calculateMonthlyData(filtered);
    setMonthlyData(monthlyStats);

    // Calculate subcategory distribution for bar chart
    const subcategoryStats = calculateSubcategoryData(filtered);
    // setBarChartData();

    // Calculate distribution data for table
    const distStats = calculateDistributionData(filtered);
    // setDistributionData(distStats);
  }, [selectedDateRange]);

  // Update selected date range when prop changes
  useEffect(() => {
    if (propDateRange) {
      setSelectedDateRange(propDateRange);
    }
  }, [selectedDateRange, propDateRange]);

  const calculateMonthlyData = (filtered) => {
    const currentYear = new Date().getFullYear();
    const monthlyStats = {
      BF: new Array(12).fill(0),
      Reported: new Array(12).fill(0),
      Cleared: new Array(12).fill(0),
      CF: new Array(12).fill(0),
    };

    // Count reported incidents by month
    incidents.forEach((filteredIncidentsNe) => {
      const incidentDate = new Date(filteredIncidentsNe.update_on);
      if (incidentDate.getFullYear() === currentYear) {
        const month = incidentDate.getMonth();
        monthlyStats.Reported[month]++;
      }
    });

    // Count cleared incidents by month (using resolvedAt or similar field)
    incidents.forEach((filteredIncidentsNe) => {
      if (filteredIncidentsNe.status === "Closed") {
        const resolvedDate = new Date(filteredIncidentsNe.update_on);
        if (resolvedDate.getFullYear() === currentYear) {
          const month = resolvedDate.getMonth();
          monthlyStats.Cleared[month]++;
        }
      }
    });

    // Calculate BF (Brought Forward) and CF (Carried Forward)
    let currentBF = 0;
    for (let i = 0; i < 12; i++) {
      monthlyStats.BF[i] = currentBF;
      const cf = currentBF + monthlyStats.Reported[i] - monthlyStats.Cleared[i];
      monthlyStats.CF[i] = cf;
      currentBF = cf;
    }

    return monthlyStats;
  };

  const calculateSubcategoryData = (incidents) => {
    const subcategoryCount = {};

    incidents.forEach((incident) => {
      const subcategory = incident.subcategory || incident.category || "Other";
      subcategoryCount[subcategory] = (subcategoryCount[subcategory] || 0) + 1;
    });

    return Object.entries(subcategoryCount)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 subcategories
  };

  const calculateDistributionData = (incidents) => {
    const categoryCount = {};
    const totalIncidents = incidents.length;

    incidents.forEach((incident) => {
      const category = incident.category || "Other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    });

    return Object.entries(categoryCount)
      .map(([category, incidentCount]) => ({
        category,
        incidentCount,
        percentage:
          totalIncidents > 0
            ? Math.round((incidentCount / totalIncidents) * 100)
            : 0,
      }))
      .sort((a, b) => b.incidentCount - a.incidentCount);
  };

  const handleDateApply = (range) => {
    setSelectedDateRange(range);
    setDatePopupOpen(false);
  };

  const handleTeamChange = (team) => {
    setSelectedTeam(team);
  };

  const handleRowClick = (categoryId, categoryName) => {
    setSelectedCategoryItems(
      getSelectedCategoryItemsDatabyCategoryId({
        incidents: filteredIncidentsNew,
        categories: subCategories,
        categoryItems,
        categoryId: categoryId,
      })
    );
    setSelectedCategory(categoryName);
    setPopupOpen(true);
  };

  const formatDateRange = () => {
    const start = selectedDateRange.startDate.toLocaleDateString();
    const end = selectedDateRange.endDate.toLocaleDateString();
    return `${start} - ${end}`;
  };

  const getReportTitle = () => {
    if (selectedTeam === "All Teams") {
      return "KPI Report - All Teams";
    }
    return `KPI Report - ${selectedTeam}`;
  };

  console.log(distributionTableAllData);

  return (
    <div className="kpi-report-container">
      <div className="kpi-report-header">
        <div>
          <h2 className="kpi-report-title">{getReportTitle()}</h2>
          <div className="kpi-report-subtitle">
            View and analyze key performance indicators for incident management
            ({formatDateRange()})
          </div>
        </div>
        <CategorySelector
          onChange={handleTeamChange}
          selectedDateRange={selectedDateRange}
          mode="team"
        />
      </div>

      <div className="kpi-report-summary">
        <MonthlyIncidentSummary months={months} data={monthlyData} />
      </div>

      {selectedTeam !== "All Teams" && (
        <>
          <div className="kpi-report-section">
            <button
              onClick={() => setDatePopupOpen(true)}
              className="kpi-report-daterange-btn"
            >
              Select Date Range ({formatDateRange()})
            </button>

            <DateRangePopup
              open={datePopupOpen}
              onClose={() => setDatePopupOpen(false)}
              onApply={handleDateApply}
              selectedRange={selectedDateRange}
            />

            <h3 className="kpi-report-bar-heading">
              Incidents by SubCategory
              {selectedTeam !== "All Teams" && ` - ${selectedTeam} Team`}
            </h3>
            <BarChartComponent data={barChartData} />
          </div>

          <div style={{ margin: "40px 0", width: "100%" }}>
            <DistributionTable
              data={distributionTableAllData}
              onRowClick={handleRowClick}
              selectedTeam={selectedTeam}
            />
          </div>

          <Dialog
            open={popupOpen}
            onClose={() => setPopupOpen(false)}
            maxWidth="md"
            fullWidth
          >
            {selectedCategory && (
              <CategoryItemTble
                data={selectedCategoryItems}
                categoryName={selectedCategory}
                selectedDateRange={selectedDateRange}
                selectedTeam={selectedTeam}
              />
            )}
          </Dialog>
        </>
      )}
    </div>
  );
};

export default KPIReport;
