import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box
} from '@mui/material';
import './KPITable.css';

function KPITable({ data }) {
  // Use data from props, fallback to default data if not provided
  const teamData = data && data.length > 0 ? data : [
    { team: 'All Teams', totalIncidents: 100, clearedIncidents: 80, unclearedIncidents: 20 },
    { team: 'Team Alpha', totalIncidents: 30, clearedIncidents: 25, unclearedIncidents: 5 },
    { team: 'Team Beta', totalIncidents: 25, clearedIncidents: 20, unclearedIncidents: 5 },
    { team: 'Team Gamma', totalIncidents: 20, clearedIncidents: 15, unclearedIncidents: 5 },
    { team: 'Team Delta', totalIncidents: 25, clearedIncidents: 20, unclearedIncidents: 5 },
  ];

  return (
    <Box className="kpi-table-container">      
      <TableContainer component={Paper} className="kpi-table-paper">
        <Table stickyHeader aria-label="team incidents table">
          <TableHead>
            <TableRow>
              <TableCell className="kpi-table-header-cell">Team</TableCell>
              <TableCell className="kpi-table-header-cell kpi-table-numeric-cell">Total Incidents</TableCell>
              <TableCell className="kpi-table-header-cell kpi-table-numeric-cell">Cleared Incidents</TableCell>
              <TableCell className="kpi-table-header-cell kpi-table-numeric-cell">Uncleared Incidents</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {teamData.map((row, index) => (
              <TableRow 
                key={index}
                className={row.team === 'All Teams' ? 'kpi-table-highlighted-row' : 'kpi-table-regular-row'}
              >
                <TableCell 
                  component="th" 
                  scope="row" 
                  className={row.team === 'All Teams' ? 'kpi-table-team-cell-highlighted' : ''}
                >
                  {row.team}
                </TableCell>
                <TableCell className="kpi-table-numeric-cell">{row.total}</TableCell>
                <TableCell className="kpi-table-numeric-cell">{row.closed}</TableCell>
                <TableCell className="kpi-table-numeric-cell">{row.others}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}

export default KPITable;