import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import './SeverityCard.css';

const SeverityCard = ({ severity, totalIncidents, responseTime, resolveRate }) => {
  const severityConfig = {
    critical: {
      color: '#ff4444',
      label: 'Critical',
      icon: '🔴'
    },
    high: {
      color: '#ff9800',
      label: 'High',
      icon: '🟠'
    },
    medium: {
      color: '#ffc107',
      label: 'Medium',
      icon: '🟡'
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
          <div className="metric-item">
            <Typography variant="caption" className="metric-label">
              Total Incidents
            </Typography>
            <Typography variant="h4" className="metric-value">
              {totalIncidents}
            </Typography>
          </div>

          <div className="metric-divider" />

          <div className="metric-item">
            <Typography variant="caption" className="metric-label">
              Response Time
            </Typography>
            <Typography variant="h4" className="metric-value">
              {responseTime.percentage}%
            </Typography>
            <Typography variant="caption" className="metric-subtext">
              Avg: {responseTime.avg}
            </Typography>
          </div>

          <div className="metric-divider" />

          <div className="metric-item">
            <Typography variant="caption" className="metric-label">
              Resolve Rate
            </Typography>
            <Typography variant="h4" className="metric-value">
              {resolveRate.percentage}%
            </Typography>
            <Typography variant="caption" className="metric-subtext">
              Avg: {resolveRate.avg}
            </Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SeverityCard;