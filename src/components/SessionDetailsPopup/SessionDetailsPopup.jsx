// SessionDetailsPopup.jsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Divider,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import './SessionDetailsPopup.css';

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '12px',
    minWidth: '600px',
    maxWidth: '800px',
    maxHeight: '80vh'
  }
}));

const HeaderBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '20px 24px',
  borderBottom: '1px solid #e0e0e0'
}));

const SessionCard = styled(Box)(({ theme, color }) => ({
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  padding: '16px',
  marginBottom: '12px',
  borderLeft: `4px solid ${color}`,
  '&:hover': {
    backgroundColor: '#f5f5f5',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  }
}));

const StatusBadge = styled('span')(({ active }) => ({
  display: 'inline-block',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '12px',
  fontWeight: 600,
  backgroundColor: active ? '#4caf50' : '#9e9e9e',
  color: 'white',
  marginLeft: '8px'
}));

const CloseButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#f44336',
  color: 'white',
  padding: '8px 24px',
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#d32f2f'
  }
}));

const SessionDetailsPopup = ({ open, onClose, sessions, dateRange, employeeName }) => {
  
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDuration = (loginTime, logoutTime) => {
    if (!loginTime) return 'N/A';
    
    const login = new Date(loginTime);
    const logout = logoutTime ? new Date(logoutTime) : new Date();
    
    const diffMs = logout - login;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  const formatDateRange = () => {
    if (!dateRange) return 'All Sessions';
    
    if (dateRange.selection === 'Today') {
      return 'Today';
    } else if (dateRange.selection === 'Yesterday') {
      return 'Yesterday';
    } else if (dateRange.selection === 'Custom Range') {
      const start = new Date(dateRange.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const end = new Date(dateRange.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      return `${start} - ${end}`;
    }
    return dateRange.selection;
  };

  const getTotalDuration = () => {
    if (!sessions || sessions.length === 0) return '0h 0m';
    
    const totalMs = sessions.reduce((acc, session) => {
      const login = new Date(session.login_time);
      const logout = session.logout_time ? new Date(session.logout_time) : new Date();
      return acc + (logout - login);
    }, 0);
    
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const generateColor = (seed) => {
    const hash = seed.toString().split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    const hue = Math.abs(hash % 360);
    const saturation = 65 + (Math.abs(hash) % 20);
    const lightness = 50 + (Math.abs(hash >> 8) % 15);
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  };

  return (
    <StyledDialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <HeaderBox>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
            {employeeName || 'All Employees'} - Session Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDateRange()}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </HeaderBox>

      <DialogContent sx={{ padding: '24px' }}>
        {/* Summary Stats */}
        <Box className="summary-stats">
          <Box className="stat-item">
            <Typography variant="body2" color="text.secondary">Total Sessions</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#3f51b5' }}>
              {sessions?.length || 0}
            </Typography>
          </Box>
          <Box className="stat-item">
            <Typography variant="body2" color="text.secondary">Total Duration</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#4caf50' }}>
              {getTotalDuration()}
            </Typography>
          </Box>
          <Box className="stat-item">
            <Typography variant="body2" color="text.secondary">Active Sessions</Typography>
            <Typography variant="h5" sx={{ fontWeight: 600, color: '#ff9800' }}>
              {sessions?.filter(s => !s.logout_time).length || 0}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Session List */}
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Session History
        </Typography>

        <Box className="sessions-list">
          {sessions && sessions.length > 0 ? (
            sessions.map((session, index) => (
              <SessionCard key={session.id || index} color={generateColor(session.id || index)}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Session #{session.id}
                    <StatusBadge active={!session.logout_time}>
                      {session.logout_time ? 'Completed' : 'Active'}
                    </StatusBadge>
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#3f51b5' }}>
                    {formatDuration(session.login_time, session.logout_time)}
                  </Typography>
                </Box>

                <Box className="session-details-grid">
                  <Box className="detail-item">
                    <Typography variant="caption" color="text.secondary">
                      Login Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatDateTime(session.login_time)}
                    </Typography>
                  </Box>

                  <Box className="detail-item">
                    <Typography variant="caption" color="text.secondary">
                      Logout Time
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {session.logout_time ? formatDateTime(session.logout_time) : 'Still active'}
                    </Typography>
                  </Box>

                  {session.technician_service_number && (
                    <Box className="detail-item">
                      <Typography variant="caption" color="text.secondary">
                        Service Number
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {session.technician_service_number}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </SessionCard>
            ))
          ) : (
            <Box className="no-sessions">
              <Typography variant="body1" color="text.secondary">
                No sessions found for the selected date range
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: '16px 24px', borderTop: '1px solid #e0e0e0' }}>
        <CloseButton onClick={onClose}>
          Close
        </CloseButton>
      </DialogActions>
    </StyledDialog>
  );
};

export default SessionDetailsPopup;