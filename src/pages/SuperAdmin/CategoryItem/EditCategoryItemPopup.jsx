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
} from "@mui/material";
import { FaTimes } from "react-icons/fa";

const EditCategoryItemPopup = ({ open, item, onClose, onSubmit }) => {
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (item) {
      setItemId(item.category_code || item.id || "");
      setItemName(item.name || "");
      setError("");
    }
  }, [item]);

  const handleSubmit = () => {
    if (!itemName.trim()) {
      setError("Category Item Name is required");
      return;
    }

    if (onSubmit && item) {
      onSubmit({
        id: item.id,
        name: itemName.trim(),
        subCategoryId: item.subCategory?.id || item.subCategoryId,
      });
    }
  };

  const parentName = item?.subCategory?.mainCategory?.name || "IT Help Desk";
  const subName = item?.subCategory?.name || "Email";

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
            p: 3,
            pb: 1,
          }}
        >
          <Box>
            <Typography
              variant="subtitle1"
              sx={{ color: "#215bc9", fontWeight: 600, lineHeight: 1.4 }}
            >
              Parent Category - {parentName}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: "#215bc9", fontWeight: 600, lineHeight: 1.4 }}
            >
              Sub Category - {subName}
            </Typography>
          </Box>
          <IconButton
            onClick={onClose}
            size="small"
            sx={{ color: "#888", mt: -0.5, mr: -0.5 }}
          >
            <FaTimes size={16} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "#111" }}>
          Edit Category
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
          Update the category item name.
        </Typography>

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "#111" }}
            >
              Category Item ID
            </Typography>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={itemId}
              disabled
              sx={{ bgcolor: "#f5f5f5" }}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, mb: 1, color: "#111" }}
            >
              Category Item Name <span style={{ color: "#dc3545" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={itemName}
              error={Boolean(error)}
              helperText={error}
              onChange={(e) => {
                setItemName(e.target.value);
                if (error) setError("");
              }}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, justifyContent: "space-between" }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            color: "#111",
            borderColor: "#e2e8f0",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          sx={{
            bgcolor: "#2161cd",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            "&:hover": { bgcolor: "#1a4da6" },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCategoryItemPopup;
