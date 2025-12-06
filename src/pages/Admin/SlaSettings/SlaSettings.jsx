import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AdminDateRangePopup from "../../../components/AdminDateRangePopup/DateRangePopup";
import TeamSizeCard from "../../../components/AdminSLA/Teamsizecard";
import TotalIncidentsCard from "../../../components/AdminSLA/Totalincidentscard";
import SeverityCard from "../../../components/AdminSLA/SeverityCard";
import fetchSlaData from "../../../utils/slaDummyData";
import "./SlaSettings.css";

// technician performance component
import TechnicianPerformance from "../../../components/TechnicianPerformance/TechnicianPerformance";

// popup
import TechnicianDetailsPopup from "../../../components/Technician_details_popup/TechnicianPopup";

const SlaSettings = () => {
  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start, end };
  });

  const [datePopupOpen, setDatePopupOpen] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState(null);

  const handleRowClick = (tech) => {
    console.log('Row clicked, technician:', tech);
    setSelectedTechnician(tech);
    setPopupOpen(true);
  };

  const openDatePopup = () => setDatePopupOpen(true);
  const closeDatePopup = () => setDatePopupOpen(false);

  const handleApplyDateRange = ({ selection, startDate, endDate }) => {
    setRange({ start: startDate, end: endDate });
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const teamId = user.teamId || user.team || undefined;
        const resp = await fetchSlaData({
          start: range.start,
          end: range.end,
          teamId,
        });
        if (mounted) {
          console.log('Fetched SLA Data:', resp);
          setData(resp);
        }
      } catch (e) {
        console.error("Failed to load SLA data", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [range]);

  // Helper function to get severity-specific data
  const getSeverityData = (severity) => {
    const severityKey = severity.toLowerCase();
    
    const totalIncidents = data?.incidents?.[severityKey] ?? (loading ? "..." : 0);
    const responseData = data?.response?.[severityKey];
    const resolveData = data?.resolve?.[severityKey];
    
    console.log(`${severity} Severity Data:`, {
      totalIncidents,
      responseData,
      resolveData
    });
    
    return {
      totalIncidents,
      responseTime: {
        percentage: responseData?.percent ?? (loading ? "..." : 0),
        avg: responseData?.avgMinutes 
          ? `${responseData.avgMinutes} min`
          : loading ? "..." : "—",
        onTimeCount: responseData?.onTimeCount ?? (loading ? "..." : 0)
      },
      resolveRate: {
        percentage: resolveData?.percent ?? (loading ? "..." : 0),
        avg: resolveData?.avgHours
          ? `${resolveData.avgHours} hrs`
          : loading ? "..." : "—",
        onTimeCount: resolveData?.onTimeCount ?? (loading ? "..." : 0)
      }
    };
  };

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
              teamSize={data?.teamInfo?.size ?? (loading ? "..." : 3)}
              activeMembers={data?.teamInfo?.active ?? (loading ? "..." : 3)}
            />
            <TotalIncidentsCard
              total={data?.incidents?.total ?? (loading ? "..." : 0)}
              critical={data?.incidents?.critical ?? 0}
              high={data?.incidents?.high ?? 0}
              medium={data?.incidents?.medium ?? 0}
            />
          </div>
          
          <SeverityCard
            severity="critical"
            {...getSeverityData("critical")}
          />
          
          <SeverityCard
            severity="high"
            {...getSeverityData("high")}
          />
          
          <SeverityCard
            severity="medium"
            {...getSeverityData("medium")}
          />
        </div>

        {/* Technician Performance */}
        <TechnicianPerformance dateRange={range} onRowClick={handleRowClick} />

        {/* Popup */}
        <TechnicianDetailsPopup
          isOpen={popupOpen}
          onClose={() => {
            console.log('Closing popup');
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