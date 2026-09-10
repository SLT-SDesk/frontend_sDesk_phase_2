import { Box, Typography } from "@mui/material";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import AdminDateRangePopup from "../../../components/AdminDateRangePopup/DateRangePopup";
import SeverityCard from "../../../components/AdminSLA/SeverityCard";
import TeamSizeCard from "../../../components/AdminSLA/Teamsizecard";
import TotalIncidentsCard from "../../../components/AdminSLA/Totalincidentscard";
import "./SlaSettings.css";

// technician performance component
import TechnicianPerformance from "../../../components/TechnicianPerformance/TechnicianPerformance";

// popup
import TechnicianDetailsPopup from "../../../components/Technician_details_popup/TechnicianPopup";

//incident slice
import {
  fetchAllIncidentsRequest,
  fetchIncidentsByMainCategoryCodeRequest,
  fetchTechnicianPerformanceRequest,
} from "../../../redux/incident/incidentSlice";

import { fetchTechniciansRequest } from "../../../redux/technicians/technicianSlice";

import { aggregateIncidentCounts } from "../../../utils/aggregateIncidentCounts";
import { aggregateSeverityData } from "../../../utils/aggregateSeverityData";
import { aggregateTeamData } from "../../../utils/aggregateTeamData";

const SlaSettings = () => {
  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start, end };
  });

  const { user } = useSelector((state) => state.auth);
  const currentAdmin = user;

  //Incident summary data begin
  const [teamIncidents, setTeamIncidents] = useState([]);
  const [teamTechnicians, setTeamTechnicians] = useState([]);

  const dispatch = useDispatch();
  const { incidents, incidentsByMainCategory, performances } = useSelector(
    (state) => state.incident
  );
  const { technicians } = useSelector((state) => state.technicians);

  // Decide which data source to use based on role
  const isSuperAdmin = user?.role?.toLowerCase() === "superadmin" || user?.role?.toLowerCase() === "super admin";
  const sourceIncidents = isSuperAdmin ? incidents : incidentsByMainCategory;

  //filtered incidents by date range - MEMOIZED to prevent infinite loop
  const filteredIncidents = useMemo(() => {
    return (sourceIncidents || []).filter((incident) => {
      const incidentDate = new Date(incident.update_on || incident.createdAt);

      const start = new Date(range.start);
      const end = new Date(range.end);

      // normalize to date-only
      incidentDate.setHours(0, 0, 0, 0);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      return incidentDate >= start && incidentDate <= end;
    });
  }, [sourceIncidents, range]);


  useEffect(() => {
    const fetchData = () => {
      dispatch(fetchAllIncidentsRequest());
      if (currentAdmin?.teamId) {
        dispatch(fetchIncidentsByMainCategoryCodeRequest(currentAdmin.teamId));
      }
      dispatch(fetchTechnicianPerformanceRequest());
      dispatch(fetchTechniciansRequest());
    };

    fetchData(); // initial load

    const intervalId = setInterval(fetchData, 30000); // poll every 30 seconds

    // Add event listeners for direct user actions
    const handleInstantUpdate = () => {
      fetchData();
    };

    window.addEventListener("incident-transferred", handleInstantUpdate);
    window.addEventListener("incident-popup-close", handleInstantUpdate);

    return () => {
      clearInterval(intervalId); // cleanup on unmount
      window.removeEventListener("incident-transferred", handleInstantUpdate);
      window.removeEventListener("incident-popup-close", handleInstantUpdate);
    };
  }, [dispatch, currentAdmin?.teamId]);

  useEffect(() => {
    const incidentCounts = aggregateIncidentCounts(filteredIncidents);
    const teamTechs = aggregateTeamData(
      currentAdmin?.teamId
        ? technicians.filter((tech) => tech.teamId === currentAdmin.teamId)
        : technicians
    );
    setTeamTechnicians(teamTechs);
    setTeamIncidents(incidentCounts);
  }, [filteredIncidents, technicians, currentAdmin?.teamId]);

  const dataSla = useMemo(() => {
    return aggregateSeverityData(filteredIncidents, performances);
  }, [filteredIncidents, performances]);

  // console.log('Incident by Main Category Code Data:', teamIncidents);
  console.log("Filtered Incidents:", filteredIncidents);
  console.log("Technician Performance Data:", performances);
  console.log("Technicians Data:", technicians);
  console.log("teamTechnicians Data:", teamTechnicians);
  //Incident summary data end

  const [datePopupOpen, setDatePopupOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const handleRowClick = useCallback((tech) => {
    // console.log('Row clicked, technician:', tech);
    setSelectedTechnician(tech);
    setPopupOpen(true);
  }, []);

  const openDatePopup = () => setDatePopupOpen(true);
  const closeDatePopup = () => setDatePopupOpen(false);

  const handleApplyDateRange = ({ selection, startDate, endDate }) => {
    setRange({ start: startDate, end: endDate });
  };

  // useEffect(() => {
  //   let mounted = true;
  //   const load = async () => {
  //     setLoading(true);
  //     try {
  //       const user = JSON.parse(localStorage.getItem("user") || "{}");
  //       const teamId = user.teamId || user.team || undefined;
  //       const resp = await fetchSlaData({
  //         start: range.start,
  //         end: range.end,
  //         teamId,
  //       });
  //       if (mounted) {
  //         // console.log('Fetched SLA Data:', resp);
  //         setData(resp);
  //       }
  //     } catch (e) {
  //       // console.error("Failed to load SLA data", e);
  //     } finally {
  //       if (mounted) setLoading(false);
  //     }
  //   };
  //   load();
  //   return () => {
  //     mounted = false;
  //   };
  // }, [range]);

  return (
    <div className="sla-settings-page">
      <div className="sla-header">
        <Typography variant="h4" className="sla-title">
          SLA Setting
        </Typography>
      </div>

      <div className="sla-content">
        <div className="sla-top-bar">
          <div className="team-metrics-label">
            <Box className="icon-wrapper">
              <span className="team-icon">👥</span>
            </Box>
            <Typography variant="body1" className="metrics-text">
              Team Performance & Metrics
            </Typography>
          </div>

          <div className="sla-date-wrapper">
            <button
              type="button"
              onClick={openDatePopup}
              className="sla-date-button"
            >
              {`${new Date(range.start).toLocaleDateString()} - ${new Date(
                range.end
              ).toLocaleDateString()}`}
            </button>

            <AdminDateRangePopup
              open={datePopupOpen}
              onClose={closeDatePopup}
              onApply={handleApplyDateRange}
              selectedRange={{ startDate: range.start, endDate: range.end }}
            />
          </div>
        </div>

        <div className="metrics-grid">
          <div className="team-section">
            <TeamSizeCard
              teamSize={teamTechnicians.teamSize}
              activeMembers={teamTechnicians.activeMembers}
            />
            <TotalIncidentsCard
              total={teamIncidents.total ?? (loading ? "..." : 0)}
              critical={teamIncidents.critical ?? (loading ? "..." : 0)}
              high={teamIncidents.high ?? (loading ? "..." : 0)}
              medium={teamIncidents.medium ?? (loading ? "..." : 0)}
            />
          </div>

          <SeverityCard
            severity="critical"
            totalIncidents={dataSla.response.critical.total}
            responseTime={{
              percentage: dataSla.response.critical.percent,
              avg: dataSla.response.critical.avgMinutes,
              onTimeCount: dataSla.response.critical.onTimeCount,
            }}
            resolveRate={{
              percentage: dataSla.resolve.critical.percent,
              avg: dataSla.resolve.critical.avgHours,
              onTimeCount: dataSla.resolve.critical.onTimeCount,
            }}
          />

          <SeverityCard
            severity="high"
            totalIncidents={dataSla.response.high.total}
            responseTime={{
              percentage: dataSla.response.high.percent,
              avg: dataSla.response.high.avgMinutes,
              onTimeCount: dataSla.response.high.onTimeCount,
            }}
            resolveRate={{
              percentage: dataSla.resolve.high.percent,
              avg: dataSla.resolve.high.avgHours,
              onTimeCount: dataSla.resolve.high.onTimeCount,
            }}
          />

          <SeverityCard
            severity="medium"
            totalIncidents={dataSla.response.medium.total}
            responseTime={{
              percentage: dataSla.response.medium.percent,
              avg: dataSla.response.medium.avgMinutes,
              onTimeCount: dataSla.response.medium.onTimeCount,
            }}
            resolveRate={{
              percentage: dataSla.resolve.medium.percent,
              avg: dataSla.resolve.medium.avgHours,
              onTimeCount: dataSla.resolve.medium.onTimeCount,
            }}
          />
        </div>

        {/* Technician Performance */}
        <TechnicianPerformance dateRange={range} onRowClick={handleRowClick} />

        {/* Popup */}
        <TechnicianDetailsPopup
          isOpen={popupOpen}
          onClose={() => {
            console.log("Closing popup");
            setPopupOpen(false);
            setSelectedTechnician(null);
          }}
          technician={selectedTechnician}
        />
      </div>
    </div>
  );
};

export default SlaSettings;
