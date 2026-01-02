import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import './DateRangePopup.css';

const StyledButton = styled(Button)(({ theme, selected }) => ({
  width: '100%',
  justifyContent: 'flex-start',
  textTransform: 'none',
  padding: '12px 16px',
  marginBottom: '8px',
  backgroundColor: selected ? '#3f51b5' : '#f5f5f5',
  color: selected ? 'white' : '#3f51b5',
  fontWeight: 600,
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: selected ? '#303f9f' : '#e0e0e0',
  }
}));

const ApplyButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#4caf50',
  color: 'white',
  padding: '8px 24px',
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#45a049',
  }
}));

const CancelButton = styled(Button)(({ theme }) => ({
  color: '#666',
  padding: '8px 24px',
  borderRadius: '20px',
  textTransform: 'none',
  fontWeight: 600,
  '&:hover': {
    backgroundColor: '#f5f5f5',
  }
}));

// ++++Helper functions to get start and end of day +++++++++++++++++++++
const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date) => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

function DateRangePopup({ open, onClose, onApply, selectedRange }) {
  const [activeSelection, setActiveSelection] = useState('Today');
  const [showCustomRange, setShowCustomRange] = useState(false);
  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());

  const dateOptions = [
    'Today',
    'Yesterday',
    'Last 7 Days',
    'Last 30 Days',
    'This Month',
    'Last Month',
    'Custom Range'
  ];

  const handleOptionClick = (option) => {
    setActiveSelection(option);
    if (option === 'Custom Range') {
      setShowCustomRange(true);
    } else {
      setShowCustomRange(false);
    }
  };

  const handleApply = () => {
    let startDate, endDate;
    const today = new Date();

    switch (activeSelection) {
      // ++++Modified 'Today' case to use helper functions +++++++++++++++
      case 'Today': {
        startDate = startOfDay(today);
        endDate = endOfDay(today);
        break;
      }
      // ++++Added missing case for 'Yesterday' ++++++++++++++++++++++++++++++
      case 'Yesterday': {
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);
        startDate = startOfDay(yesterday);
        endDate = endOfDay(yesterday);
        break;
      }
      case 'Last 7 Days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        endDate = today;
        break;
      case 'Last 30 Days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        endDate = today;
        break;
      case 'This Month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'Last Month':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
      case 'Custom Range':
        startDate = fromDate;
        endDate = toDate;
        break;
      default:
        startDate = endDate = today;
    }

    onApply({
      selection: activeSelection,
      startDate,
      endDate
    });
    onClose();
  };

  const handleCancel = () => {
    setActiveSelection('Today');
    setShowCustomRange(false);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      sx={{
        zIndex: 10000
      }}
      PaperProps={{
        style: {
          borderRadius: '12px',
          padding: '8px'
        }
      }}
    >
      <DialogContent sx={{ padding: '20px' }}>
        <Box className="date-range-popup-container">
          {dateOptions.map((option) => (
            <StyledButton
              key={option}
              selected={activeSelection === option}
              onClick={() => handleOptionClick(option)}
            >
              {option}
            </StyledButton>
          ))}

          {showCustomRange && (
            <Box className="custom-date-range">
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                Custom Date Range
              </Typography>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      From
                    </Typography>
                    <DatePicker
                      value={fromDate}
                      onChange={(newValue) => setFromDate(newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true
                        },
                        popper: {
                          sx: {
                            zIndex: 20000
                          }
                        }
                      }}
                    />



                  </Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                      To
                    </Typography>
                    <DatePicker
                      value={toDate}
                      onChange={(newValue) => setToDate(newValue)}
                      slotProps={{
                        textField: {
                          size: 'small',
                          fullWidth: true
                        },
                        popper: {
                          sx: {
                            zIndex: 20000
                          }
                        }
                      }}
                    />


                  </Box>
                </Box>
              </LocalizationProvider>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ padding: '0 20px 20px 20px', gap: 1 }}>
        <CancelButton onClick={handleCancel}>
          Cancel
        </CancelButton>
        <ApplyButton onClick={handleApply}>
          Apply
        </ApplyButton>
      </DialogActions>
    </Dialog>
  );
}

export default DateRangePopup;