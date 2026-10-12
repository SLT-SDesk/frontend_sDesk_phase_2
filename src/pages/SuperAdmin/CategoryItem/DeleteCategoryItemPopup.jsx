import React from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const DeleteCategoryItemPopup = ({ open, onClose, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
      <DialogContent sx={{ p: 4, pb: 3 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5, color: "#111" }}>
          Delete Category?
        </Typography>
        <Typography variant="body1" sx={{ color: "#64748b", lineHeight: 1.5 }}>
          Are you sure you want to delete this category? This action cannot be undone.
        </Typography>
      </DialogContent>

      <DialogActions sx={{ p: 4, pt: 0, justifyContent: "flex-end" }}>
        <Button onClick={onClose} variant="outlined" sx={{ color: "#111", borderColor: "#e2e8f0", textTransform: "none", fontWeight: 600, px: 3 }}>
          Cancel
        </Button>
        <Button onClick={onConfirm} variant="contained" sx={{ bgcolor: "#dc3545", textTransform: "none", fontWeight: 600, px: 3, "&:hover": { bgcolor: "#c82333" } }}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteCategoryItemPopup;
