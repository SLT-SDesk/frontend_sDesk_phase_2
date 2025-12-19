import React from 'react';
import { Card, CardContent, Typography, Chip, Box } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import './Totalincidentscard.css';

const TotalIncidentsCard = ({ total, critical, high, medium }) => {
  return (
    <Card className="total-incidents-card">
      <CardContent className="incidents-content">
        <div className="card-header">
          <Typography variant="subtitle2" className="card-title">
            Total Incidents
          </Typography>
          <InfoOutlinedIcon className="info-icon" />
        </div>
        
        <Typography variant="h2" className="incidents-count">
          {total}
        </Typography>
        
        <div className="severity-badges">
          <Chip 
            label={`${critical} Critical`} 
            className="severity-badge critical"
            size="small"
          />
          <Chip 
            label={`${high} High`} 
            className="severity-badge high"
            size="small"
          />
          <Chip 
            label={`${medium} Medium`} 
            className="severity-badge medium"
            size="small"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default TotalIncidentsCard;