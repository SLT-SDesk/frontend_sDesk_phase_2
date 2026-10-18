import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { FaEdit, FaTrash, FaSearch, FaPlus } from "react-icons/fa";
import { BsListTask } from "react-icons/bs";
import AddCategoryItemPopup from "./AddCategoryItemPopup";
import EditCategoryItemPopup from "./EditCategoryItemPopup";
import DeleteCategoryItemPopup from "./DeleteCategoryItemPopup";
import {
  fetchCategoryItemsRequest,
  createCategoryItemRequest,
  updateCategoryItemRequest,
  deleteCategoryItemRequest,
  fetchMainCategoriesRequest,
  fetchSubCategoriesRequest,
} from "../../../redux/categories/categorySlice";

const CategoryItem = () => {
  const dispatch = useDispatch();
  const categoryItems = useSelector((state) => state.categories.categoryItems || []);
  const mainCategories = useSelector((state) => state.categories.mainCategories || []);
  const subCategories = useSelector((state) => state.categories.subCategories || []);
  const loading = useSelector((state) => state.categories.loading);

  const createLoading = useSelector((state) => state.categories.createCategoryItemLoading);
  const createSuccess = useSelector((state) => state.categories.createCategoryItemSuccess);
  const createError = useSelector((state) => state.categories.createCategoryItemError);

  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: "", severity: "success" });

  useEffect(() => {
    dispatch(fetchCategoryItemsRequest());
    dispatch(fetchMainCategoriesRequest());
    dispatch(fetchSubCategoriesRequest());
  }, [dispatch]);

  // Handle create success / error
  useEffect(() => {
    if (createSuccess) {
      setIsAddModalOpen(false);
      setNotification({
        open: true,
        message: "Category item created successfully!",
        severity: "success",
      });
    }
  }, [createSuccess]);

  useEffect(() => {
    if (createError) {
      setNotification({
        open: true,
        message: typeof createError === "string" ? createError : "Failed to create category item",
        severity: "error",
      });
    }
  }, [createError]);

  // Aggregate all unique subcategories from both subCategories list and existing categoryItems
  const allSubCategories = useMemo(() => {
    const map = new Map();
    (subCategories || []).forEach((s) => {
      if (s && s.id) map.set(s.id, s);
    });
    (categoryItems || []).forEach((ci) => {
      if (ci.subCategory && ci.subCategory.id) {
        if (!map.has(ci.subCategory.id)) {
          map.set(ci.subCategory.id, ci.subCategory);
        }
      }
    });
    return Array.from(map.values());
  }, [subCategories, categoryItems]);

  // Aggregate all unique main categories from both mainCategories list and subcategories
  const allMainCategories = useMemo(() => {
    const map = new Map();
    (mainCategories || []).forEach((m) => {
      if (m && m.id) map.set(m.id, m);
    });
    allSubCategories.forEach((s) => {
      if (s.mainCategory && s.mainCategory.id) {
        if (!map.has(s.mainCategory.id)) {
          map.set(s.mainCategory.id, s.mainCategory);
        }
      }
    });
    return Array.from(map.values());
  }, [mainCategories, allSubCategories]);

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleAddSubmit = (data) => {
    dispatch(
      createCategoryItemRequest({
        name: data.name,
        subCategoryId: data.subCategoryId,
      })
    );
  };

  const handleEditSubmit = (data) => {
    dispatch(
      updateCategoryItemRequest({
        id: data.id,
        name: data.name,
        subCategoryId: data.subCategoryId,
      })
    );
    setIsEditModalOpen(false);
    setNotification({
      open: true,
      message: "Category item updated successfully!",
      severity: "success",
    });
  };

  const handleDeleteConfirm = () => {
    if (selectedItem?.id) {
      dispatch(deleteCategoryItemRequest(selectedItem.id));
      setNotification({
        open: true,
        message: "Category item deleted successfully!",
        severity: "success",
      });
    }
    setIsDeleteModalOpen(false);
  };

  const filteredData = categoryItems.filter((item) => {
    const query = searchQuery.toLowerCase();
    const nameMatch = item.name?.toLowerCase().includes(query);
    const codeMatch = (item.category_code || item.id || "").toLowerCase().includes(query);
    const subMatch = (item.subCategory?.name || "").toLowerCase().includes(query);
    return nameMatch || codeMatch || subMatch;
  });

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
              boxShadow: "0 2px 10px rgba(0,0,0,0.02)",
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
                  {loading && categoryItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        <CircularProgress size={32} />
                        <Typography variant="body2" sx={{ mt: 1, color: "#666" }}>
                          Loading category items...
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length > 0 ? (
                    filteredData.map((item, index) => (
                      <TableRow key={item.id || index} hover>
                        <TableCell sx={{ color: "#0056b3", fontWeight: 500 }}>
                          {item.category_code || item.id}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleEditClick(item)}
                            size="small"
                            sx={{ mr: 1 }}
                          >
                            <FaEdit size={16} />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteClick(item)}
                            size="small"
                          >
                            <FaTrash size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                        No matching category items found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Footer */}
            <Box sx={{ p: 2, fontSize: 13, color: "#666", borderTop: "1px solid #eee", bgcolor: "white" }}>
              Showing {filteredData.length > 0 ? 1 : 0}-{filteredData.length} of {categoryItems.length} categories
            </Box>
          </Paper>
        </Box>
      </Box>

      {/* Modals */}
      {isAddModalOpen && (
        <AddCategoryItemPopup
          open={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSubmit={handleAddSubmit}
          mainCategories={allMainCategories}
          subCategories={allSubCategories}
          isLoading={createLoading}
          apiError={createError}
        />
      )}

      {isEditModalOpen && (
        <EditCategoryItemPopup
          open={isEditModalOpen}
          item={selectedItem}
          onClose={() => setIsEditModalOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {isDeleteModalOpen && (
        <DeleteCategoryItemPopup
          open={isDeleteModalOpen}
          item={selectedItem}
          onClose={() => setIsDeleteModalOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}

      {/* Toast Notification */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
          severity={notification.severity}
          sx={{ width: "100%" }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default CategoryItem;
