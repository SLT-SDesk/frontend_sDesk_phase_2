import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import './Resolveratecard.css';

const ResolveRateCard = ({ percentage, avgTime }) => {
  return (
    <Card className="resolve-rate-card">
      <CardContent className="resolve-content">
        <div className="card-header">
          <Typography variant="subtitle2" className="card-title">
            Resolve Rate
          </Typography>
          <CheckCircleOutlineIcon className="check-icon" />
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

export default ResolveRateCard;