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
} from "@mui/material";
import { FaTimes } from "react-icons/fa";

const EditCategoryItemPopup = ({ open, item, onClose, onSubmit }) => {
  const [itemId, setItemId] = useState("");
  const [itemName, setItemName] = useState("");

  useEffect(() => {
    if (item) {
      setItemId(item.id || "");
      setItemName(item.name || "");
    }
  }, [item]);

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit({ itemId, itemName });
    }
  };

  const options = [
    "E-Mail Backup Required",
    "E-Mail Common Account password",
    "E-Mail Lost",
    "MailBox Filled",
    "New Email Account",
    "Email-TAB/Phone Configuration",
    "Outlook Patch Update",
    "Email Not Working"
  ];

  if (item && !options.includes(item.name)) {
      options.unshift(item.name);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", p: 3, pb: 1 }}>
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

      <DialogContent sx={{ p: 3, pt: 1 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5, color: "#111" }}>
          Edit Category
        </Typography>
        <Typography variant="body2" sx={{ color: "#64748b", mb: 3 }}>
          Select a sub category name.
        </Typography>

        <Box sx={{ display: "flex", gap: 3 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#111" }}>
              Category Item ID
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
            <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: "#111" }}>
              Category Item Name <span style={{ color: "#dc3545" }}>*</span>
            </Typography>
            <TextField
              select
              fullWidth
              size="small"
              variant="outlined"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            >
              {options.map((option, index) => (
                <MenuItem key={index} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 1, justifyContent: "space-between" }}>
        <Button onClick={onClose} variant="outlined" sx={{ color: "#111", borderColor: "#e2e8f0", textTransform: "none", fontWeight: 600, px: 3 }}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" sx={{ bgcolor: "#2161cd", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { bgcolor: "#1a4da6" } }}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCategoryItemPopup;
