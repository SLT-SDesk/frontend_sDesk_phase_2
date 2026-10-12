import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const SubCategoryDeleteModal = ({ open, onClose, onConfirm, categoryName }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      PaperProps={{
        sx: { borderRadius: 3, px: 1 },
      }}
    >
      <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
        Delete Category?
      </DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to delete this category? This action cannot be
          undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
        <Button
          variant="outlined"
          color="inherit"
          onClick={onClose}
          sx={{ textTransform: "none", borderRadius: 1.5 }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={onConfirm}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            bgcolor: "#DC2626",
            "&:hover": { bgcolor: "#B91C1C" },
          }}
        >
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryDeleteModal;
