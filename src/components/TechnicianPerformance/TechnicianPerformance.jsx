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
  InputLabel,
  Table as MuiTable,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  IconButton,
} from "@mui/material";

import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";

/* style components tika*/
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

const StatusDot = styled.span`
  height: 12px;
  width: 12px;
  display: inline-block;
  margin-right: 8px;
  border-radius: 50%;
  background: ${(props) =>
    props.status === "Active" ? "#2ECC71" : "#E74C3C"};
`;

/*  main logic eka */
/*state management */
const TechnicianPerformance = ({ dateRange }) => {
  const [technicians, setTechnicians] = useState([]);
  const [filteredTechnicians, setFilteredTechnicians] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* Load dummy data when date filter changes ( later----In backend integration, instead of this i have to use api call) */
 useEffect(() => {
    if (!dateRange?.start || !dateRange?.end) return;

    // NEW CODE — get teamId same as SLA page
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const teamId = user.teamId || user.team || undefined;

    async function loadTechData() {
      const result = await fetchTechnicianData({
        start: dateRange.start,
        end: dateRange.end,
        teamId,   // NEW — pass teamId 
      });

      setTechnicians(result);
      setFilteredTechnicians(result);
    }

    loadTechData();
}, [dateRange]);

  /* search + status filtering */
  useEffect(() => {
    let result = technicians;

    // search filter eka
    if (search.trim()) {
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.serviceNumber.toLowerCase().includes(search.toLowerCase())
      );
    }

    // status filter eka
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

      {/* Technician count eka*/}
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
      {/*  search + filters */}
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
        {/* Search */}
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
                <SearchIcon sx={{
                  color: "#9aa0a6", marginBottom: "16px"   
                }} />
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
          <FilterListIcon sx={{
            marginRight: "6px", opacity: 0.7, fontSize: "20px",
            alignSelf: "center"
          }} />

          <FormControl
            variant="filled"
            size="small"
            sx={{
              minWidth: 120,
              "& .MuiFilledInput-root": {
                background: "transparent",
              },
              "& .MuiSelect-select": {
                paddingTop: "0 !important",
                paddingBottom: "0 !important",
                display: "flex",
                alignItems: "center",    
              },
              "& .MuiSvgIcon-root": {
                alignSelf: "center",      
                marginTop: "0 !important"
              }
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
                "& .MuiFilledInput-root": {
                  background: "transparent",
                },
              }}
            >
              <MenuItem value="All">All Status</MenuItem>
              <MenuItem value="Active">Active</MenuItem>
              <MenuItem value="Inactive">Inactive</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>




      {/* performance table*/}
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
                  sx={{
                    "&:hover": { background: "#fafafa" },
                  }}
                >
                  <TableCell>{tech.name}</TableCell>
                  <TableCell>{tech.serviceNumber}</TableCell>
                  <TableCell>
                    <StatusDot status={tech.status} />
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
