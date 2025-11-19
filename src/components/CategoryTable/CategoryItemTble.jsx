import React, { useState, useEffect } from "react";
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
  TextField,
} from "@mui/material";
import { 
  dummyIncidentData, 
  filterIncidentsByDateRange 
} from '../../data/dummyIncidentData';
import * as XLSX from 'xlsx';

const CategoryItemTble = ({ data, categoryName, selectedDateRange, selectedTeam }) => {
  const [search, setSearch] = useState("");
  const [categoryData, setCategoryData] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);

  // Filter incidents by date range and category
  useEffect(() => {
    if (!categoryName) return;

    // Use date range if provided, otherwise use all data
    let incidents = dummyIncidentData;
    if (selectedDateRange) {
      incidents = filterIncidentsByDateRange(
        dummyIncidentData, 
        selectedDateRange.startDate, 
        selectedDateRange.endDate
      );
    }

    // Apply team filter if specific team is selected
    if (selectedTeam && selectedTeam !== "All Teams") {
      incidents = incidents.filter(incident => 
        (incident.assignedTeam || incident.team || 'Unassigned') === selectedTeam
      );
    }

    // Filter incidents by the selected category
    const categoryIncidents = incidents.filter(incident => 
      incident.category && incident.category.toLowerCase() === categoryName.toLowerCase()
    );

    setFilteredIncidents(categoryIncidents);

    // Calculate subcategory distribution within this category
    const subcategoryData = calculateSubcategoryDistribution(categoryIncidents);
    setCategoryData(data);

    console.log(`Category: ${categoryName}, Team: ${selectedTeam}, Incidents: ${categoryIncidents.length}`);
  }, [categoryName, selectedDateRange, selectedTeam]);

  const calculateSubcategoryDistribution = (incidents) => {
    if (incidents.length === 0) return [];

    const subcategoryCount = {};
    const totalIncidents = incidents.length;

    // Count incidents by subcategory
    incidents.forEach(incident => {
      const subcategory = incident.subcategory || incident.subCategory || 'Other';
      subcategoryCount[subcategory] = (subcategoryCount[subcategory] || 0) + 1;
    });

    // Convert to array with percentages
    return Object.entries(subcategoryCount)
      .map(([subcategory, incidentCount]) => ({
        category: subcategory,
        incidentCount,
        percentage: Math.round((incidentCount / totalIncidents) * 100)
      }))
      .sort((a, b) => b.incidentCount - a.incidentCount); // Sort by count descending
  };

  // Filter data based on search
  const filteredData = categoryData.filter((row) =>
    row.category.toLowerCase().includes(search.toLowerCase())
  );

  const getTitle = () => {
    if (selectedTeam && selectedTeam !== "All Teams") {
      return `Category Items: ${categoryName} - ${selectedTeam} Team`;
    }
    return `Category Items - ${categoryName}`;
  };

  // Format date range for display
  const formatDateRange = () => {
    if (!selectedDateRange) return '';
    const start = selectedDateRange.startDate.toLocaleDateString();
    const end = selectedDateRange.endDate.toLocaleDateString();
    return ` (${start} - ${end})`;
  };

  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    
        const description=[
          ['Category Items'],
          ['Team: ' + (selectedTeam)],
          ['Sub Category: ' + (categoryName)],
          ['Generated on: ' + new Date().toLocaleDateString()],
          ['Total Records: ' + data.length],
          [''],
          ['Description: This report provides a breakdown of incidents by category item, including the number of incidents and their percentage distribution.'],
          [''],
        ];

    const headers =[['Category Item Id', 'Category Item Name', 'Incidents Count', 'Percentage', 'Category Item Code', 'Created At', 'Updated At', 'Sub Category Id', 'Main Category Id']];

    const wsData = data.map(row => [
      row.id,
      row.category,
      row.incidentCount,
      row.percentage,
      row.category_item_code,
      row.createdAt,
      row.updatedAt,
      row.subCategoryId,
      row.mainCategoryId
    ]);

    const finalData = [...description, ...headers, ...wsData];

    const ws = XLSX.utils.aoa_to_sheet(finalData);

    ws['!cols'] = [
      { wch: 35.5 },
      { wch: 26.6 },
      { wch: 13.5 },
      { wch: 9.4 },
      { wch: 16.9 },
      { wch: 22.1 },
      { wch: 22.1 },
      { wch: 35.5 },
      {wch: 34.5},
    ];

    ws['!merges'] = [
      { s: { r: 6, c: 0 }, e: { r: 6, c: 6 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'Category Items');

    XLSX.writeFile(wb, 'Category Items Report ' + new Date().toLocaleDateString() + '.xlsx');

  };

  return (
    <Box
      sx={{
        width: 900, // increased width for better display
        minHeight: 400,
        maxHeight: 700,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        p: 3,
        bgcolor: "#fff",
      }}
    >
      {/* Title */}
      <Typography
        variant="h5"
        sx={{ 
          mb: 1, 
          fontWeight: "bold", 
          color: "#000", 
          alignSelf: "flex-start" 
        }}
      >
        {getTitle()}
      </Typography>

      {/* Subtitle with date range and total count */}
      

      {/* Search */}
      <TextField
        placeholder="Search subcategories..."
        variant="outlined"
        size="medium"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{
          mb: 3,
          bgcolor: "#f5f5f5",
          borderRadius: "12px",
          width: "100%",
          "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
          }
        }}
      />

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: "16px",
          overflowY: "overlay", // enables vertical scroll
          bgcolor: "#e3f2fd", // Changed to blue theme for incidents
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          width: "100%",
          maxHeight: 250,
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ height: 56 }}>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#000",
                  bgcolor: "#4caf50", // Blue header
                  fontSize: "1.15rem",
                  height: 56,
                  py: 1.5,
                }}
              >
                Category Item
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#000",
                  bgcolor: "#4caf50",
                  fontSize: "1.15rem",
                  height: 56,
                  py: 1.5,
                }}
              >
                Incident Count
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: "bold",
                  color: "#000",
                  bgcolor: "#4caf50",
                  fontSize: "1.15rem",
                  height: 56,
                  py: 1.5,
                  minWidth: 200,
                }}
              >
                Percentage
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((row, index) => (
                <TableRow 
                  key={index} 
                  sx={{ 
                    height: 48,
                    "&:hover": {
                      bgcolor: "#90ee90"
                    }
                  }}
                >
                  <TableCell sx={{ fontSize: "1.05rem", py: 1, fontWeight: 500 }}>
                    {row.category}
                  </TableCell>
                  <TableCell sx={{ fontSize: "1.05rem", py: 1, textAlign: "center" }}>
                    {row.incidentCount}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Typography sx={{ fontSize: "1.05rem", fontWeight: 500, minWidth: 45 }}>
                        {row.percentage}%
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={row.percentage}
                        sx={{
                          flex: 1,
                          height: 18,
                          borderRadius: 8,
                          bgcolor: "#90ee90",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: "#4caf50",
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: "center", py: 3 }}>
                  <Typography variant="body1" color="text.secondary">
                    {search ? `No subcategories found matching "${search}"` : `No incidents found for ${categoryName}`}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
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

export default CategoryItemTble;