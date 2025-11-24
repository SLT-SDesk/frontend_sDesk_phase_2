import { Box, Typography } from "@mui/material";
import { useState } from "react";
import AdminDateRangePopup from "../../../components/AdminDateRangePopup/DateRangePopup";
import ResolveRateCard from "../../../components/AdminSLA/Resolveratecard";
import ResponseTimeCard from "../../../components/AdminSLA/Responsetimecard";
import TeamSizeCard from "../../../components/AdminSLA/Teamsizecard";
import TotalIncidentsCard from "../../../components/AdminSLA/Totalincidentscard";
// import "SLASettingsPage.css";
import "./SlaSettings.css";

const SlaSettings = () => {
  const [range, setRange] = useState(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 6);
    return { start, end };
  });
  const [datePopupOpen, setDatePopupOpen] = useState(false);

  const openDatePopup = () => setDatePopupOpen(true);
  const closeDatePopup = () => setDatePopupOpen(false);

  const handleApplyDateRange = ({ selection, startDate, endDate }) => {
    // startDate and endDate are Date objects
    setRange({ start: startDate, end: endDate });
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
          <TeamSizeCard teamSize={3} activeMembers={3} />
          <TotalIncidentsCard total={56} critical={6} high={8} medium={42} />
          <ResponseTimeCard percentage={89} avgTime="9.7 min" />
          <ResolveRateCard percentage={77} avgTime="4.0 hrs" />
        </div>
      </div>
    </div>
  );
};

export default SlaSettings;
