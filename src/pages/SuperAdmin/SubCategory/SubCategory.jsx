import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Avatar,
  Button,
  Paper,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment,
} from "@mui/material";
import ListIcon from "@mui/icons-material/List";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SubCategoryDeleteModal from "./SubCategoryDeleteModal";
import SubCategoryEditModal from "./SubCategoryEditModal";

// Mock data defined inline (no separate data file)
const INITIAL_DATA = [
  { id: "CAT004#1", name: "Email" },
  { id: "CAT004#2", name: "Cashiering" },
  { id: "CAT004#3", name: "Hardware" },
  { id: "CAT004#4", name: "Software" },
  { id: "CAT004#5", name: "Network" },
  { id: "CAT004#6", name: "Password Issues" },
  { id: "CAT004#7", name: "VDI Issues" },
  { id: "CAT004#8", name: "QMS" },
  { id: "CAT004#9", name: "Operating System" },
  { id: "CAT004#10", name: "Security" },
  { id: "CAT004#11", name: "Tier 3 Support" },
];

const SubCategory = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const parentCategory =
    location.state?.parentCategory || "IT Help Desk";

  const [subCategories, setSubCategories] = useState(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);

  const filtered = subCategories.filter(
    (item) =>
      item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteClick = (item) => {
    setDeleteTarget(item);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      setSubCategories((prev) =>
        prev.filter((item) => item.id !== deleteTarget.id)
      );
    }
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const handleEditClick = (item) => {
    setEditTarget(item);
    setEditOpen(true);
  };

  const handleEditSave = (updated) => {
    setSubCategories((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setEditOpen(false);
    setEditTarget(null);
  };

  return (
    <Box sx={{ p: 3, bgcolor: "#F8FAFC", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        <span
          style={{ cursor: "pointer", color: "#2563EB" }}
          onClick={() => navigate(-1)}
        >
          Home
        </span>
        {" > "}
        <span
          style={{ cursor: "pointer", color: "#2563EB" }}
          onClick={() => navigate(-1)}
        >
          Category List
        </span>
      </Typography>

      {/* Header */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={2}
      >
        <Box display="flex" alignItems="center" gap={1.5}>
          <Avatar sx={{ bgcolor: "#EFF6FF", color: "#2563EB", width: 36, height: 36 }}>
            <ListIcon fontSize="small" />
          </Avatar>
          <Typography variant="h6" fontWeight={700}>
            {parentCategory} {">"} Sub Category
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="error"
          startIcon={<AddIcon />}
          sx={{
            textTransform: "none",
            bgcolor: "#DC2626",
            "&:hover": { bgcolor: "#B91C1C" },
            borderRadius: 1.5,
            fontWeight: 600,
          }}
        >
          + Add Sub Category
        </Button>
      </Box>

      {/* Card with search + table */}
      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: "1px solid #E2E8F0", overflow: "hidden" }}
      >
        {/* Search Bar */}
        <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end" }}>
          <TextField
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
            }}
            sx={{ width: 240 }}
          />
        </Box>

        {/* Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "#F1F5F9" }}>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: "#475569", width: "35%" }}
                >
                  Sub Category ID
                </TableCell>
                <TableCell sx={{ fontWeight: 600, color: "#475569" }}>
                  Sub Category Name
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: 600, color: "#475569", width: "15%" }}
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.length > 0 ? (
                filtered.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    sx={{ "&:last-child td": { border: 0 } }}
                  >
                    <TableCell align="center">
                      <Typography
                        variant="body2"
                        sx={{ color: "#2563EB", fontWeight: 500 }}
                      >
                        {row.id}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{row.name}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => handleEditClick(row)}
                        sx={{ color: "#2563EB", mr: 0.5 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(row)}
                        sx={{ color: "#DC2626" }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No sub categories found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            Showing 1–{filtered.length} of {subCategories.length} categories
          </Typography>
        </Box>
      </Paper>

      {/* Delete Modal */}
      <SubCategoryDeleteModal
        open={deleteOpen}
        onClose={() => {
          setDeleteOpen(false);
          setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        categoryName={deleteTarget?.name}
      />

      {/* Edit Modal */}
      <SubCategoryEditModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setEditTarget(null);
        }}
        onSave={handleEditSave}
        initialData={editTarget}
      />
    </Box>
  );
};

export default SubCategory;
