import React, { useState } from "react";
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

const AddCategoryItemPopup = ({ open, onClose, onSubmit }) => {
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ itemId, itemName });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: 2, pb: 1, borderBottom: "1px solid #e0e0e0" }}>
          <Box>
            <Typography variant="subtitle1" sx={{ color: "#215bc9", fontWeight: 600, lineHeight: 1.4 }}>
              Parent Category - IT Help Desk
            </Typography>
            <Typography variant="subtitle1" sx={{ color: "#215bc9", fontWeight: 600, lineHeight: 1.4 }}>
              Sub Category - Email
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small" sx={{ color: "#888", mt: -0.5, mr: -0.5 }}>
            <FaTimes size={16} />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 3, color: "#222" }}>
          Add Category Item
        </Typography>

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#222" }}>
              Category Item ID <span style={{ color: "#dc3545" }}>*</span>
            </Typography>
            <TextField
              fullWidth
              size="small"
              variant="outlined"
              value={itemId}
              onChange={(e) => setItemId(e.target.value)}
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
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 1, borderTop: "1px solid #e0e0e0" }}>
        <Button onClick={onClose} variant="outlined" sx={{ color: "#333", borderColor: "#ddd", textTransform: "none", fontWeight: 600, px: 3 }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: "#0066cc", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { bgcolor: "#0056b3" } }}>
          Add Category
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCategoryItemPopup;
