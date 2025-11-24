import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import './ResponseTimeCard.css';

const ResponseTimeCard = ({ percentage, avgTime }) => {
  return (
    <Card className="response-time-card">
      <CardContent className="response-content">
        <div className="card-header">
          <Typography variant="subtitle2" className="card-title">
            Response Time
          </Typography>
          <AccessTimeIcon className="time-icon" />
        </div>
        
        <Typography variant="h2" className="percentage-value">
          {percentage}%
        </Typography>
        
        <div className="progress-container">
          <LinearProgress 
            variant="determinate" 
            value={percentage} 
            className="progress-bar"
          />
        </div>
        
        <Typography variant="body2" className="avg-time">
          Avg: {avgTime}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ResponseTimeCard;