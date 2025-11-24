import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import './TeamSizeCard.css';

const TeamSizeCard = ({ teamSize, activeMembers }) => {
  return (
    <Card className="team-size-card">
      <CardContent className="team-size-content">
        <div className="background-decoration">
          <div className="circle-large"></div>
          <div className="circle-small"></div>
        </div>
        
        <div className="card-header">
          <Typography variant="subtitle2" className="card-title">
            Team Size
          </Typography>
          <GroupIcon className="card-icon" />
        </div>
        
        <Typography variant="h2" className="team-count">
          {teamSize}
        </Typography>
        
        <div className="active-indicator">
          <span className="active-dot"></span>
          <Typography variant="body2" className="active-text">
            {activeMembers} Active
          </Typography>
        </div>
      </CardContent>
    </Card>
  );
};

export default TeamSizeCard;