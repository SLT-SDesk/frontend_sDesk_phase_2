import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  LinearProgress,
  Box,
  Typography,
} from "@mui/material";
// eslint-disable-next-line no-unused-vars
import { useNavigate } from "react-router-dom";
import * as XLSX from 'xlsx';

const DistributionTable = ({ data, onRowClick, selectedTeam }) => {
  
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();

    const description=[
      ['Distribution by SubCategory'],
      ['Team: ' + (selectedTeam)],
      ['Generated on: ' + new Date().toLocaleDateString()],
      ['Total Records: ' + data.length],
      [''],
      ['Description: This report provides a breakdown of incidents by subcategory, including the number of incidents and their percentage distribution.'],
      [''],
    ];

    const headers =[['Category Id','Category Name','Incidents Count','Percentage', 'Category Code', 'Created At', 'Updated At', 'Main Category Id']];

    const wsData = data.map(row => [
      row.id,
      row.category,
      row.incidentCount,
      row.percentage,
      row.category_code,
      row.createdAt,
      row.updatedAt,
      row.mainCategoryId
    ]);

    const finalData = [...description, ...headers, ...wsData];

    const ws = XLSX.utils.aoa_to_sheet(finalData);

    ws['!cols'] = [
      { wch: 35.1 },
      { wch: 13.1 },
      { wch: 13.5 },
      { wch: 9.4 },
      { wch: 12.5 },
      { wch: 22.1 },
      { wch: 22.1 },
      { wch: 34.5 },
    ];

    ws['!merges'] = [
      { s: { r: 4, c: 0 }, e: { r: 4, c: 6 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Distribution by Sub Category');

    XLSX.writeFile(wb, 'Distribution by Sub Category Report ' + new Date().toLocaleDateString() + '.xlsx');

  };



  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
        p: 0,
        bgcolor: "transparent",
      }}
    >
      <Typography
        variant="h6"
        sx={{ mb: 2, fontWeight: "bold", color: "#222", ml: 8, mt: 2 }}
      >
        Distribution by Sub Category 
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "12px",
          border: "1px solid #4caf50",
          overflow: "hidden",
          bgcolor: "#90ee90", // light green
          boxShadow: "none",
          width: "90%",
          ml: 8,
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ height: 48 }}>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#222",
                  bgcolor: "#90ee90",
                  fontSize: "1rem",
                  padding: "12px 16px",
                  borderBottom: "2px solid #4caf50",
                }}
              >
                Category
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#222",
                  bgcolor: "#90ee90",
                  fontSize: "1rem",
                  padding: "12px 16px",
                  borderBottom: "2px solid #4caf50",
                }}
              >
                Incidents
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#222",
                  bgcolor: "#90ee90",
                  fontSize: "1rem",
                  padding: "12px 16px",
                  borderBottom: "2px solid #4caf50",
                }}
              >
                Percentage
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: "#90ee90",
                  height: 48,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#b2f5b2" },
                }}
                onClick={() => onRowClick(row.id, row.category)} // Pass id and category name
              >
                <TableCell sx={{ fontSize: "1rem", color: "#222", borderBottom: "1px solid #4caf50" }}>{row.category}</TableCell>
                <TableCell sx={{ fontSize: "1rem", color: "#222", borderBottom: "1px solid #4caf50" }}>{row.incidentCount}</TableCell>
                <TableCell sx={{ borderBottom: "1px solid #4caf50" }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography sx={{ fontSize: "1rem", fontWeight: 500, color: "#222" }}>
                      {row.percentage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={row.percentage}
                      sx={{
                        flex: 1,
                        height: 12,
                        borderRadius: 6,
                        bgcolor: "#c8e6c9",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: "#2e7d32",
                        },
                      }}
                    />
                  </Box>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Box sx={{ mt: 2, textAlign: "right", width: "90%", ml: 8 }}>
        <Button
          variant="contained"
          sx={{
            bgcolor: "#4caf50",
            color: "#fff",
            textTransform: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            px: 4,
            py: 1,
            fontSize: "1rem",
            boxShadow: "none",
            "&:hover": { bgcolor: "#388e3c" },
          }}
          onClick={exportToExcel}
        >
          Export Data
        </Button>
      </Box>
    </Box>
  );
};

export default DistributionTable;