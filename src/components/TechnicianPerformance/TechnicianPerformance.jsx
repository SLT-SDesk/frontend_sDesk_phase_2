import { useEffect, useState } from "react";
import styled from "styled-components";
import { fetchTechnicianData } from "../../utils/slaDummyData";

/* material ui*/
import {
  Box,
  TextField,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

/* style components */
const Container = styled.div`
  padding: 20px;
  background: #ffffff;
  border-radius: 12px;
  width: 100%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.07);
`;

const Title = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 5px;
`;

/* 🚨 FIXED: use $status instead of status to prevent DOM warnings */
const StatusDot = styled.span`
  height: 12px;
  width: 12px;
  display: inline-block;
  margin-right: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.$status === "Active" ? "#2ECC71" : "#E74C3C"};
`;

/* Component */
const TechnicianPerformance = ({ dateRange, onRowClick }) => {
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* Load technician data when date range changes */
  useEffect(() => {
    if (!dateRange?.start || !dateRange?.end) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const teamId = user.teamId || user.team || undefined;

    async function loadTechData() {
      const result = await fetchTechnicianData({
        start: dateRange.start,
        end: dateRange.end,
        teamId,
      });

      setTechnicians(result);
      setFilteredTechnicians(result);
    }

    loadTechData();
  }, [dateRange]);

  /* Apply search + status filter */
  useEffect(() => {
    let result = technicians;

    if (search.trim()) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.serviceNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All") {
      result = result.filter((t) => t.status === statusFilter);
    }

    setFilteredTechnicians(result);
  }, [search, statusFilter, technicians]);

  return (
    <Container>
      <Title>Technician Performance</Title>

      <h6 style={{ fontWeight: "bold", marginBottom: "10px" }}>
        Individual Metric and Individual Statistics
      </h6>

      <div
        style={{
          fontSize: "14px",
          opacity: 0.7,
          marginBottom: "10px",
          textAlign: "right",
        }}
      >
        {filteredTechnicians.length} of {technicians.length} technicians
      </div>

      {/* Search + Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 2,
          marginBottom: 2,
          padding: "16px",
          borderRadius: "12px",
          border: "1px solid #e0e0e0",
          background: "#fffff",
          alignItems: "center",
        }}
      >
        {/* Search box */}
        <TextField
          variant="filled"
          placeholder="Search by name or service number..."
          size="small"
          fullWidth
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  sx={{
                    color: "#9aa0a6",
                    marginBottom: "16px",
                  }}
                />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          sx={{
            background: "#f1f1f5",
            borderRadius: "6px",
            "& .MuiFilledInput-root": {
              background: "#f1f1f5",
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              height: "44px",
              paddingTop: "8px",
            },
            "& .MuiFilledInput-input": {
              paddingLeft: "4px",
              paddingTop: "4px",
            },
          }}
        />

        {/* Status Filter */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            background: "#f1f1f5",
            borderRadius: "8px",
            padding: "0px 12px",
            border: "1px solid #e0e0e0",
            height: "44px",
          }}
        >
          <FilterListIcon
            sx={{
              marginRight: "6px",
              opacity: 0.7,
              fontSize: "20px",
            }}
          />

          <FormControl
            variant="filled"
            size="small"
            sx={{
              minWidth: 120,
              "& .MuiFilledInput-root": {
                background: "transparent",
              },
            }}
          >
            <Select
              disableUnderline
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              sx={{
                background: "transparent",
                fontSize: "14px",
                color: "#9aa0a6",
              }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Technician Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid #e0e0e0",
        }}
      >
        <MuiTable>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f6f8" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Service Number</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredTechnicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center" sx={{ padding: 3 }}>
                  No technicians found.
                </TableCell>
              </TableRow>
            ) : (
              filteredTechnicians.map((tech) => (
                <TableRow
                  key={tech.id}
                  hover
                  onClick={() => onRowClick && onRowClick(tech)}   // ✅ POPUP TRIGGER
                  sx={{
                    "&:hover": {
                      background: "#fafafa",
                      cursor: "pointer",
                    },
                  }}
                >
                  <TableCell>{tech.name}</TableCell>
                  <TableCell>{tech.serviceNumber}</TableCell>
                  <TableCell>
                    <StatusDot $status={tech.status} />
                    {tech.status}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Container>
  );
};

export default TechnicianPerformance;
