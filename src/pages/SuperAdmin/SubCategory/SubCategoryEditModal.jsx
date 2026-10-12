import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

const SUB_CATEGORY_OPTIONS = [
  "Email",
  "Cashiering",
  "Hardware",
  "Software",
  "Network",
  "Password Issues",
  "VDI Issues",
  "QMS",
  "Operating System",
  "Security",
  "Tier 3 Support",
];

const SubCategoryEditModal = ({ open, onClose, onSave, initialData }) => {
  const [selectedName, setSelectedName] = useState(
    initialData?.name || "Email"
  );

  useEffect(() => {
    if (initialData?.name) {
      setSelectedName(initialData.name);
    }
  }, [initialData]);

  const handleSave = () => {
    if (onSave) {
      onSave({ ...initialData, name: selectedName });
    }
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, px: 1 },
      }}
    >
      {/* Parent Category label */}
      <Box sx={{ px: 3, pt: 2.5 }}>
        <Typography variant="caption" color="primary.main" fontWeight={600}>
          Parent Category - IT Help Desk
        </Typography>
      </Box>

      {/* Title row */}
      <DialogTitle
        component="div"
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          py: 0.5,
          px: 3,
        }}
      >
        <Typography variant="h6" fontWeight={700}>
          Edit Category
        </Typography>
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      {/* Helper text */}
      <Box sx={{ px: 3, pb: 0 }}>
        <Typography variant="body2" color="text.secondary">
          Select a sub category name.
        </Typography>
      </Box>

      <DialogContent sx={{ pt: 2 }}>
        <Box display="flex" gap={2} mt={0}>
          {/* Sub Category ID */}
          <TextField
            fullWidth
            label="Sub Category ID"
            value={initialData?.id || "CAT004#1"}
            disabled
            size="small"
          />

          {/* Sub Category Name */}
          <FormControl fullWidth required size="small">
            <InputLabel id="sub-category-name-label">
              Sub Category Name *
            </InputLabel>
            <Select
              labelId="sub-category-name-label"
              value={selectedName}
              label="Sub Category Name *"
              onChange={(e) => setSelectedName(e.target.value)}
            >
              {SUB_CATEGORY_OPTIONS.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
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
          onClick={handleSave}
          sx={{
            textTransform: "none",
            borderRadius: 1.5,
            bgcolor: "#2563EB",
            "&:hover": { bgcolor: "#1D4ED8" },
          }}
        >
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SubCategoryEditModal;
