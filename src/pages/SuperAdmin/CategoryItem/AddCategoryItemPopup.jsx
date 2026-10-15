import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  IconButton,
  Box,
  Typography,
  MenuItem,
  CircularProgress,
  Alert,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";

const AddCategoryItemPopup = ({
  open,
  onClose,
  onSubmit,
  mainCategories = [],
  subCategories = [],
  isLoading = false,
  apiError = null,
}) => {
  const [selectedMainId, setSelectedMainId] = useState("");
  const [selectedSubId, setSelectedSubId] = useState("");
  const [itemName, setItemName] = useState("");
  const [localError, setLocalError] = useState("");

  // Set default main category when loaded
  useEffect(() => {
    if (mainCategories.length > 0) {
      if (!selectedMainId || !mainCategories.some((m) => m.id === selectedMainId)) {
        // Try to find "IT Help Desk" or first category
        const preferred = mainCategories.find(
          (m) =>
            m.name?.toLowerCase().includes("it help desk") ||
            m.name?.toLowerCase().includes("help desk")
        );
        setSelectedMainId(preferred ? preferred.id : mainCategories[0].id);
      }
    }
  }, [mainCategories, selectedMainId]);

  // Available sub categories for the selected main category
  const matchingSubCategories = subCategories.filter((sub) => {
    if (!selectedMainId) return true;
    const parentId = sub.mainCategory?.id || sub.mainCategoryId;
    return parentId === selectedMainId;
  });

  // Fallback to all subCategories if none strictly matched
  const availableSubCategories =
    matchingSubCategories.length > 0 ? matchingSubCategories : subCategories;

  // Set default sub category when available
  useEffect(() => {
    if (availableSubCategories.length > 0) {
      const alreadyValid = availableSubCategories.some((s) => s.id === selectedSubId);
      if (!alreadyValid) {
        // Prefer "Email" if present
        const preferred = availableSubCategories.find((s) =>
          s.name?.toLowerCase().includes("email")
        );
        setSelectedSubId(preferred ? preferred.id : availableSubCategories[0].id);
      }
    } else {
      setSelectedSubId("");
    }
  }, [selectedMainId, availableSubCategories, selectedSubId]);

  const selectedMain = mainCategories.find((m) => m.id === selectedMainId);
  const selectedSub = availableSubCategories.find((s) => s.id === selectedSubId);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setLocalError("");

    if (!itemName.trim()) {
      setLocalError("Category Item Name is required");
      return;
    }

    if (!selectedSubId) {
      setLocalError("Please select a valid Sub Category");
      return;
    }

    if (onSubmit) {
      onSubmit({
        name: itemName.trim(),
        subCategoryId: selectedSubId,
      });
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2 } }}
    >
      <DialogTitle sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            p: 2.5,
            pb: 1.5,
            borderBottom: "1px solid #e0e0e0",
          }}
        >
          <Box sx={{ width: "90%" }}>
            {/* Parent Category Selection / Display */}
            {mainCategories.length > 1 ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1.5 }}>
                <Typography variant="body2" sx={{ color: "#215bc9", fontWeight: 600, minWidth: 125 }}>
                  Parent Category:
                </Typography>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={selectedMainId}
                  onChange={(e) => setSelectedMainId(e.target.value)}
                >
                  {mainCategories.map((main) => (
                    <MenuItem key={main.id} value={main.id}>
                      {main.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            ) : (
              <Typography variant="subtitle1" sx={{ color: "#215bc9", fontWeight: 600, lineHeight: 1.4, mb: 0.5 }}>
                Parent Category - {selectedMain ? selectedMain.name : "IT Help Desk"}
              </Typography>
            )}

            {/* Sub Category Selection / Display */}
            {availableSubCategories.length > 0 ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography variant="body2" sx={{ color: "#215bc9", fontWeight: 600, minWidth: 125 }}>
                  Sub Category:
                </Typography>
                <TextField
                  select
                  size="small"
                  fullWidth
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                >
                  {availableSubCategories.map((sub) => (
                    <MenuItem key={sub.id} value={sub.id}>
                      {sub.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            ) : (
              <Typography variant="subtitle1" sx={{ color: "#215bc9", fontWeight: 600, lineHeight: 1.4 }}>
                Sub Category - {selectedSub ? selectedSub.name : "Email"}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#888", mt: -0.5, mr: -0.5 }}>
            <FaTimes size={16} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "#222" }}>
          Add Category Item
        </Typography>

        {apiError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {apiError}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#222" }}>
              Category Item ID
            </Typography>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              disabled
              value="Auto (e.g. CAT...)"
              sx={{ bgcolor: "#f8f9fa" }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#222" }}>
              Category Item Name <span style={{ color: "#dc3545" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              placeholder="e.g. E-Mail Not Receiving"
              value={itemName}
              error={Boolean(localError)}
              helperText={localError}
              autoFocus
              onChange={(e) => {
                setItemName(e.target.value);
                if (localError) setLocalError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit(e);
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, pt: 1, borderTop: "1px solid #e0e0e0" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={isLoading}
          sx={{ color: "#333", borderColor: "#ddd", textTransform: "none", fontWeight: 600, px: 3 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{
            bgcolor: "#0066cc",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": { bgcolor: "#0056b3" },
          }}
        >
          {isLoading ? <CircularProgress size={20} color="inherit" /> : "Add Category"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryItemPopup;
