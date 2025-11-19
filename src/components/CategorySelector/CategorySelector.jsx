import React, { useState, useEffect } from "react";
import { Button, Menu, MenuItem, Paper, IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import { 
  dummyIncidentData 
} from '../../data/dummyIncidentData.js';
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCategoryItemsRequest,
  fetchMainCategoriesRequest,
  fetchSubCategoriesRequest
} from "../../redux/categories/categorySlice.js";
import { fetchAllIncidentsRequest } from "../../redux/incident/incidentSlice.js";

// Header button
const StyledButton = styled(Button)({
  width: "220px",
  backgroundColor: "#005ea6",
  color: "#fff",
  fontSize: "14px",           
  fontWeight: "bold",         
  textTransform: "none", 
  borderRadius: "5px",
  "&:hover": {
    backgroundColor: "#6a89ff",
  },
});

// Scrollable Paper with first 4 rows visible, rest scrollable
const ScrollablePaper = styled(Paper)({
  width: "220px",
  maxHeight: "200px",        
  overflowY: "auto",
  backgroundColor: "#D3D3D3",
  borderRadius: "0 0 5px 5px",
  paddingTop: "30px",        // space for close button
  position: "relative",

  // Custom scrollbar (Webkit browsers)
  "&::-webkit-scrollbar": {
    width: "8px",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: "#ccc",
    borderRadius: "4px",
  },

  // Firefox scrollbar
  scrollbarWidth: "thin",
  scrollbarColor: "#ccc #f0f0f0",
});

// Close button
const CloseButton = styled(IconButton)({
  position: "absolute",
  top: "5px",
  right: "5px",
  padding: "2px",
  minWidth: "20px",
  height: "20px",
  fontSize: "20px",
  color: "#555",
});

// Styled MenuItem for custom text styling
const StyledMenuItem = styled(MenuItem)({
  fontSize: "14px",        // text size
  color: "#333",           // text color
  fontWeight: "400",       // normal weight
  "&.Mui-selected": {
    backgroundColor: "#bfbfbf !important", // selected background
    color: "#000",       // selected text color
    fontWeight: "bold",  // selected text bold
  },
  "&:hover": {
    backgroundColor: "#e0e0e0", // hover background
    color: "#000",              // hover text color
  },
});

const CategorySelector = ({
  onChange,
  selectedDateRange,
  mode = "team" // "team", "category", or "priority"
}) => {
  const [selected, setSelected] = useState("All Teams");
  const [anchorEl, setAnchorEl] = useState(null);
  const [availableOptions, setAvailableOptions] = useState([]);

  const open = Boolean(anchorEl);

   const dispatch = useDispatch();
  const incidentsN = useSelector((state) => state.incident.incidents);
  const mainCategoriesN = useSelector(
    (state) => state.categories.mainCategories
  );
  const subCategoriesN = useSelector((state) => state.categories.subCategories);
  const categoryItemsN = useSelector((state) => state.categories.categoryItems);
  useEffect(() => {
    dispatch(fetchAllIncidentsRequest());
    dispatch(fetchMainCategoriesRequest());
    dispatch(fetchSubCategoriesRequest());
    dispatch(fetchCategoryItemsRequest());
  }, [dispatch]);

  // Generate dynamic options based on incident data and mode
  useEffect(() => {
    let incidents = incidentsN;
    // Filter by date range if provided
    if (selectedDateRange) {
      const { startDate, endDate } = selectedDateRange;
      incidents = incidents.filter(incident => {
        const incidentDate = new Date(incident.update_on || incident.createdAt);
        return incidentDate >= startDate && incidentDate <= endDate;
      });
    }

    let options = [];
    const optionCounts = {};

    // Generate options based on mode
    switch (mode) {
      case "team":
        incidents.forEach(incident => {
          const categoryItem = categoryItemsN.find(ci => ci.name === incident.category);
          const team = categoryItem ? categoryItem.subCategory.mainCategory.name : 'Unassigned';
          optionCounts[team] = (optionCounts[team] || 0) + 1;
        });
        options = ["All Teams", ...Object.keys(optionCounts).sort()];
        break;

      case "category":
        incidents.forEach(incident => {
          const category = incident.category || 'Other';
          optionCounts[category] = (optionCounts[category] || 0) + 1;
        });
        options = ["All Categories", ...Object.keys(optionCounts).sort()];
        break;

      case "priority":
        incidents.forEach(incident => {
          const priority = incident.priority || 'Medium';
          optionCounts[priority] = (optionCounts[priority] || 0) + 1;
        });
        // Sort priorities in logical order
        const priorityOrder = ['Critical', 'High', 'Medium', 'Low'];
        const sortedPriorities = Object.keys(optionCounts).sort((a, b) => {
          return priorityOrder.indexOf(a) - priorityOrder.indexOf(b);
        });
        options = ["All Priorities", ...sortedPriorities];
        break;

      default:
        options = ["All Teams"];
    }

    setAvailableOptions(options.map(option => ({
      name: option,
      count: optionCounts[option] || 0,
      isAll: option.startsWith('All')
    })));

    // Reset selection if current selection is no longer available
    if (!options.includes(selected)) {
      const defaultSelection = options[0] || "All Teams";
      setSelected(defaultSelection);
      if (onChange) onChange(defaultSelection);
    }

  }, [dummyIncidentData, selectedDateRange, mode, selected]);

  const handleOpen = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleSelect = (optionName) => {
    setSelected(optionName);
    if (onChange) onChange(optionName);
    handleClose();
  };

  // Calculate height for first 4 items
  const itemHeight = 48; // default MUI MenuItem height
  const visibleItems = 4;
  const paperHeight =
    availableOptions.length > visibleItems
      ? itemHeight * visibleItems + 30 // 30 for close button padding
      : "auto";

  // Get display text for button
  const getButtonText = () => {
    const selectedOption = availableOptions.find(opt => opt.name === selected);
    if (!selectedOption) return selected;
    
    if (selectedOption.isAll) {
      return selected;
    }
    
    return `${selected} (${selectedOption.count})`;
  };

  return (
    <>
      <StyledButton onClick={handleOpen}>
        {getButtonText()}
      </StyledButton>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          component: ScrollablePaper,
          style: { maxHeight: paperHeight },
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
      >
        {/* Close button */}
        <CloseButton onClick={handleClose}>×</CloseButton>

        {/* Menu options */}
        {availableOptions.map((option) => (
          <StyledMenuItem
            key={option.name}
            selected={option.name === selected}
            onClick={() => handleSelect(option.name)}
          >
            {option.isAll ? (
              option.name
            ) : (
              <span>
                {option.name} 
                <span style={{ color: '#666', fontSize: '12px', marginLeft: '8px' }}>
                  ({option.count})
                </span>
              </span>
            )}
          </StyledMenuItem>
        ))}
        
        {availableOptions.length === 0 && (
          <StyledMenuItem disabled>
            No data available
          </StyledMenuItem>
        )}
      </Menu>
    </>
  );
};

export default CategorySelector;