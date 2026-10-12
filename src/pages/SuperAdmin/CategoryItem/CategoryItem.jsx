import React, { useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
import { BsListTask } from "react-icons/bs";
import AddCategoryItemPopup from "./AddCategoryItemPopup";
import EditCategoryItemPopup from "./EditCategoryItemPopup";
import DeleteCategoryItemPopup from "./DeleteCategoryItemPopup";

const CategoryItem = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const dummyData = [
    { id: "CAT004#1/1", name: "E-Mail Not Receiving" },
    { id: "CAT004#1/2", name: "E-Mail Backup Required" },
    { id: "CAT004#1/3", name: "E-Mail Common Account password" },
    { id: "CAT004#1/4", name: "E-Mail Lost" },
    { id: "CAT004#1/5", name: "MailBox Filled" },
    { id: "CAT004#1/6", name: "New Email Account" },
    { id: "CAT004#1/7", name: "Email-TAB/Phone Configuration" },
    { id: "CAT004#1/8", name: "Outlook Patch Update" },
    { id: "CAT004#1/9", name: "Email Not Working" },
  ];

  const filteredData = dummyData.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, height: "90vh", bgcolor: "#f4f7fa", mx: -2.5 }}>
      {/* Direction Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          bgcolor: "#4f46e5",
          color: "white",
          height: 48,
          pl: 3,
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        Home &gt; Category List
      </Box>

      {/* Main Content Box Wrapper for Padding */}
      <Box sx={{ display: "flex", flexDirection: "column", flexGrow: 1, alignItems: "center", py: 4 }}>
        <Box sx={{ width: "92%", maxWidth: "1500px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
          
          {/* Header Row (Outside the white card) */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ bgcolor: "#e0e7ff", p: 1, borderRadius: 2, display: "flex", alignItems: "center" }}>
              <BsListTask size={24} color="#4f46e5" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 700, color: "#111" }}>
              IT Help Desk &gt; Sub Category &gt; Category Item
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<FaPlus />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{ bgcolor: "#dc3545", "&:hover": { bgcolor: "#c82333" }, textTransform: "none", fontWeight: 600, px: 3, py: 1 }}
          >
            Add Category Item
          </Button>
        </Box>

        {/* White Card containing Search and Table */}
        <Paper
          elevation={0}
          sx={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            overflow: "hidden",
            borderRadius: 2,
            border: "1px solid #e0e0e0",
            bgcolor: "white",
            boxShadow: "0 2px 10px rgba(0,0,0,0.02)"
          }}
        >

        {/* Search Row */}
        <Box sx={{ display: "flex", justifyContent: "flex-end", p: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch size={14} color="#888" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 250 }}
          />
        </Box>

        {/* Table Container */}
        <TableContainer sx={{ flex: 1 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", color: "#222" }}>Category Item ID</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", color: "#222" }}>Category Item Name</TableCell>
                <TableCell sx={{ fontWeight: 600, bgcolor: "#f8f9fa", color: "#222" }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <TableRow key={index} hover>
                    <TableCell sx={{ color: "#0056b3", fontWeight: 500 }}>{item.id}</TableCell>
                    <TableCell>{item.name}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleEditClick(item)} size="small" sx={{ mr: 1 }}>
                        <FaEdit size={16} />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleDeleteClick(item)} size="small">
                        <FaTrash size={16} />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    No matching category items found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

          {/* Footer */}
          <Box sx={{ p: 2, fontSize: 13, color: "#666", borderTop: "1px solid #eee", bgcolor: "white" }}>
            Showing 1-{filteredData.length} of {dummyData.length} categories
          </Box>
        </Paper>
        </Box>
      </Box>

      {/* Modals */}
      {isAddModalOpen && (
        <AddCategoryItemPopup
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={(data) => {
            console.log("New Category Item:", data);
            setIsAddModalOpen(false);
          }}
        />
      )}

      {isEditModalOpen && (
        <EditCategoryItemPopup
          open={isEditModalOpen}
          item={selectedItem}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={(data) => {
            console.log("Edited Category Item:", data);
            setIsEditModalOpen(false);
          }}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteCategoryItemPopup
          open={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={() => {
            console.log("Deleted Category Item:", selectedItem);
            setIsDeleteModalOpen(false);
          }}
        />
      )}
    </Box>
  );
};

export default CategoryItem;
