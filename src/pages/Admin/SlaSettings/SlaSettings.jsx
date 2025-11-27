import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import AdminDateRangePopup from "../../../components/AdminDateRangePopup/DateRangePopup";
import ResolveRateCard from "../../../components/AdminSLA/Resolveratecard";
import ResponseTimeCard from "../../../components/AdminSLA/Responsetimecard";
import TeamSizeCard from "../../../components/AdminSLA/Teamsizecard";
import TotalIncidentsCard from "../../../components/AdminSLA/Totalincidentscard";
import fetchSlaData from "../../../utils/slaDummyData";
// import "SLASettingsPage.css";
import "./SlaSettings.css";
// technician performance component
import TechnicianPerformance from "../../../components/TechnicianPerformance/TechnicianPerformance";

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

  const openDatePopup = () => setDatePopupOpen(true);
  const closeDatePopup = () => setDatePopupOpen(false);

  const handleApplyDateRange = ({ selection, startDate, endDate }) => {
    // startDate and endDate are Date objects
    setRange({ start: startDate, end: endDate });
  };

  // load SLA data when range changes
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
        if (mounted) setData(resp);
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
          <ResponseTimeCard
            percentage={data?.response?.percent ?? (loading ? "..." : 0)}
            avgTime={
              data?.response?.avgMinutes
                ? `${data.response.avgMinutes} min`
                : loading
                  ? "..."
                  : "—"
            }
          />
          <ResolveRateCard
            percentage={data?.resolve?.percent ?? (loading ? "..." : 0)}
            avgTime={
              data?.resolve?.avgHours
                ? `${data.resolve.avgHours} hrs`
                : loading
                  ? "..."
                  : "—"
            }
          />
        </div>
        {/* Technician Performance*/}
        <TechnicianPerformance dateRange={range} />

      </div>
    </div>
  );
};

export default SlaSettings;
