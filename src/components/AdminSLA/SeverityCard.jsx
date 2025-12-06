import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import './SeverityCard.css';

const SeverityCard = ({ severity, totalIncidents, responseTime, resolveRate }) => {
  const severityConfig = {
    critical: {
      color: '#ff4444',
      label: 'Critical',
      icon: '🔴',
      responseTarget: '15 min',
      resolutionTarget: '2 hrs'
    },
    high: {
      color: '#ff9800',
      label: 'High',
      icon: '🟠',
      responseTarget: '30 min',
      resolutionTarget: '12 hrs'
    },
    medium: {
      color: '#ffc107',
      label: 'Medium',
      icon: '🟡',
      responseTarget: '4 hrs',
      resolutionTarget: '16 hrs'
    }
  };

  const config = severityConfig[severity];

  return (
    <Card className="severity-card">
      <CardContent className="severity-content">
        <div className="severity-header" style={{ borderLeftColor: config.color }}>
          <span className="severity-icon">{config.icon}</span>
          <Typography variant="h6" className="severity-label">
            {config.label}
          </Typography>
        </div>

        <div className="severity-metrics">
          {/* Total Incidents */}
          <div className="metric-item">
            <Typography variant="caption" className="metric-label">
              TOTAL INCIDENTS
            </Typography>
            <Typography variant="h4" className="metric-value">
              {totalIncidents}
            </Typography>
          </div>

          <div className="metric-divider" />

          {/* Response Time */}
          <div className="metric-item-split">
            <div className="metric-left">
              <Typography variant="caption" className="metric-label">
                RESPONSE TIME
              </Typography>
              <Typography variant="h4" className="metric-value-large">
                {responseTime.percentage}%
              </Typography>
              <Typography variant="caption" className="metric-subtext">
                Avg: {responseTime.avg}
              </Typography>
            </div>
            <div className="metric-right">
              <Typography variant="caption" className="metric-label-right">
                ON TIME
              </Typography>
              <Typography variant="h4" className="metric-value-ontime">
                {responseTime.onTimeCount}
              </Typography>
            </div>
          </div>

          <div className="metric-divider" />

          {/* Resolve Rate */}
          <div className="metric-item-split">
            <div className="metric-left">
              <Typography variant="caption" className="metric-label">
                RESOLVE RATE
              </Typography>
              <Typography variant="h4" className="metric-value-large">
                {resolveRate.percentage}%
              </Typography>
              <Typography variant="caption" className="metric-subtext">
                Avg: {resolveRate.avg}
              </Typography>
            </div>
            <div className="metric-right">
              <Typography variant="caption" className="metric-label-right">
                ON TIME
              </Typography>
              <Typography variant="h4" className="metric-value-ontime">
                {resolveRate.onTimeCount}
              </Typography>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeverityCard;