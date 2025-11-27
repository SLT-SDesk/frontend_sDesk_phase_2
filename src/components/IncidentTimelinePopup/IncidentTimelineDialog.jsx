import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import styled from "styled-components"; 

//  SLA logic (Critical / High / Medium) 

const getSlaForPriority = (priority) => {
  const p = (priority || "").toLowerCase();

  switch (p) {
    case "critical":
      return {
        responseLabel: "15 minutes",
        resolutionLabel: "2 hours",
      };
    case "high":
      return {
        responseLabel: "30 minutes",
        resolutionLabel: "12 hours",
      };
    case "medium":
      return {
        responseLabel: "4 hours",
        resolutionLabel: "16 hours",
      };
    default:
      return {
        responseLabel: "--",
        resolutionLabel: "--",
      };
  }
};



// Dialog wrapper – control paper style
const StyledDialog = styled(Dialog)`
  & .MuiPaper-root {
    border-radius: 16px;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 18px 45px rgba(15, 23, 42, 0.18);
    font-family: "Inter", system-ui, -apple-system, BlinkMacSystemFont,
      "Segoe UI", sans-serif;
  }
`;

const TitleRow = styled(DialogTitle)`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const TitleText = styled(Typography)`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const Content = styled(DialogContent)`
  padding: 16px 20px 18px 20px !important;
  background-color: #ffffff;
`;

const Subtitle = styled(Typography)`
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 14px !important;
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  background-color: #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const RefBox = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const StatusBox = styled(RefBox)``;

const SmallLabel = styled(Typography)`
  font-size: 11px !important;
  font-weight: 500 !important;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const RefValue = styled(Typography)`
  font-size: 14px !important;
  font-weight: 600 !important;
  color: #111827;
`;

// status chip colours
const statusToken = (status) => {
  switch (status) {
    case "open":
      return { bg: "#f43b5c", border: "#f43b5c", color: "#ffffff" }; // red
    case "in progress":
      return { bg: "#f3f4f6", border: "#e5e7eb", color: "#374151" }; // light grey
    case "hold":
      return { bg: "#f3f4f6", border: "#e5e7eb", color: "#374151" }; // light grey
    case "closed":
      return { bg: "#111827", border: "#111827", color: "#ffffff" }; // dark
    default:
      return { bg: "#f3f4f6", border: "#e5e7eb", color: "#374151" };
  }
};

const StatusChip = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 12px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 500;
  border-width: 1px;
  border-style: solid;

  ${({ $status }) => {
    const s = statusToken($status);
    return `
      background-color: ${s.bg};
      border-color: ${s.border};
      color: ${s.color};
    `;
  }}
`;

const CardsWrapper = styled.div`
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

// card background + border by variant
const Card = styled.div`
  display: flex;
  align-items: stretch;
  border-radius: 12px;
  padding: 12px 14px;
  border-width: 1px;
  border-style: solid;

  ${({ $variant }) => {
    if ($variant === "primary") {
      return `
        background-color: #eef2ff;
        border-color: #e0e7ff;
      `;
    }
    if ($variant === "success") {
      return `
        background-color: #ecfdf3;
        border-color: #bbf7d0;
      `;
    }
    // muted
    return `
      background-color: #f9fafb;
      border-color: #e5e7eb;
    `;
  }}
`;

const IconCircle = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;

  ${({ $variant }) => {
    if ($variant === "primary") {
      return `
        background-color: #e0e7ff;
        color: #4f46e5;
      `;
    }
    if ($variant === "success") {
      return `
        background-color: #dcfce7;
        color: #16a34a;
      `;
    }
    return `
      background-color: #e5e7eb;
      color: #9ca3af;
    `;
  }}
`;

const CardText = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CardTitle = styled(Typography)`
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #111827;
  margin-bottom: 2px !important;
`;

const CardMainValue = styled(Typography)`
  font-size: 14px !important;
  font-weight: 600 !important;
  margin-bottom: 1px !important;

  ${({ $variant }) => {
    if ($variant === "success") {
      return `color: #16a34a;`; // green
    }
    return `color: #2563eb;`; // blue
  }}
`;

const CardSubText = styled(Typography)`
  font-size: 11px !important;
  color: #6b7280;
`;

const FooterRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
`;

const FooterButton = styled.button`
  min-width: 80px;
  padding: 7px 16px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: background-color 0.15s ease, box-shadow 0.15s ease;

  &:hover {
    background-color: #f3f4f6;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
  }
`;

// optional export: styled button for table "View Timeline"
export const ViewTimelineButton = styled.button`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background-color: #ffffff;
  color: #374151;
  cursor: pointer;
  gap: 4px;
  transition: background-color 0.12s ease, border-color 0.12s ease,
    box-shadow 0.12s ease;

  & svg {
    font-size: 12px;
  }

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.12);
  }
`;

//  main component 

const IncidentTimelineDialog = ({
  open,
  onClose,
  incidentRef,
  status,
  priority,
}) => {
  const normalizedStatus = (status || "").toLowerCase();
  const { responseLabel, resolutionLabel } = getSlaForPriority(priority);

  const headerSubtitle =
    "View the response and resolution times for the selected incident.";

  const renderBodyByStatus = () => {
    // CLOSED – response + resolution
    if (normalizedStatus === "closed") {
      return (
        <>
          <Card $variant="primary">
            <IconCircle $variant="primary">
              <AccessTimeIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Response Time</CardTitle>
              <CardMainValue $variant="primary">
                {responseLabel}
              </CardMainValue>
              <CardSubText>
                Time taken to respond to the incident.
              </CardSubText>
            </CardText>
          </Card>

          <Card $variant="success">
            <IconCircle $variant="success">
              <CheckCircleOutlineIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Resolution Time</CardTitle>
              <CardMainValue $variant="success">
                {resolutionLabel}
              </CardMainValue>
              <CardSubText>
                Total time taken to resolve the incident.
              </CardSubText>
            </CardText>
          </Card>
        </>
      );
    }

    // HOLD – response time + resolution pending
    if (normalizedStatus === "hold") {
      return (
        <>
          <Card $variant="primary">
            <IconCircle $variant="primary">
              <AccessTimeIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Response Time</CardTitle>
              <CardMainValue $variant="primary">
                {responseLabel}
              </CardMainValue>
              <CardSubText>
                Expected time to respond based on priority.
              </CardSubText>
            </CardText>
          </Card>

          <Card $variant="muted">
            <IconCircle $variant="muted">
              <HourglassEmptyIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Resolution Pending</CardTitle>
              <CardSubText>
                Incident is on hold. Resolution time will be calculated when it
                is closed.
              </CardSubText>
            </CardText>
          </Card>
        </>
      );
    }

    // IN PROGRESS – response time + resolution pending
    if (normalizedStatus === "in progress") {
      return (
        <>
          <Card $variant="primary">
            <IconCircle $variant="primary">
              <AccessTimeIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Response Time</CardTitle>
              <CardMainValue $variant="primary">
                {responseLabel}
              </CardMainValue>
              <CardSubText>
                Expected time to respond based on priority.
              </CardSubText>
            </CardText>
          </Card>

          <Card $variant="muted">
            <IconCircle $variant="muted">
              <HourglassEmptyIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Resolution Pending</CardTitle>
              <CardSubText>
                This incident is still being worked on.
              </CardSubText>
            </CardText>
          </Card>
        </>
      );
    }

    // OPEN – response time + resolution pending
    if (normalizedStatus === "open") {
      return (
        <>
          <Card $variant="primary">
            <IconCircle $variant="primary">
              <AccessTimeIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Response Time</CardTitle>
              <CardMainValue $variant="primary">
                {responseLabel}
              </CardMainValue>
              <CardSubText>
                Expected time to respond based on priority.
              </CardSubText>
            </CardText>
          </Card>

          <Card $variant="muted">
            <IconCircle $variant="muted">
              <HourglassEmptyIcon />
            </IconCircle>
            <CardText>
              <CardTitle>Resolution Pending</CardTitle>
              <CardSubText>
                This incident has been opened but not yet resolved.
              </CardSubText>
            </CardText>
          </Card>
        </>
      );
    }

    // default / unknown
    return (
      <Card $variant="muted">
        <IconCircle $variant="muted">
          <ErrorOutlineIcon />
        </IconCircle>
        <CardText>
          <CardTitle>No timeline data</CardTitle>
          <CardSubText>
            Timeline details are not available for this status.
          </CardSubText>
        </CardText>
      </Card>
    );
  };

  return (
    <StyledDialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <TitleRow disableTypography>
        <TitleText>Incident Timeline Details</TitleText>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{ color: "#6b7280" }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </TitleRow>

      <Content>
        <Subtitle>{headerSubtitle}</Subtitle>

        <HeaderRow>
          <RefBox>
            <SmallLabel>Incident Reference</SmallLabel>
            <RefValue>{incidentRef || "--"}</RefValue>
          </RefBox>
          <StatusBox>
            <SmallLabel>Current Status</SmallLabel>
            <StatusChip $status={normalizedStatus}>
              {status || "--"}
            </StatusChip>
          </StatusBox>
        </HeaderRow>

        <CardsWrapper>{renderBodyByStatus()}</CardsWrapper>

        <FooterRow>
          <FooterButton type="button" onClick={onClose}>
            Close
          </FooterButton>
        </FooterRow>
      </Content>
    </StyledDialog>
  );
};

export default IncidentTimelineDialog;
