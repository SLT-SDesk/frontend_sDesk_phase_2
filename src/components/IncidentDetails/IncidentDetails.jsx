import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LocationDropdown from "../LocationDropdown/LocationDropdown";
import CategoryDropdown from "../CategoryDropdown/CategoryDropDown";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import "./IncidentDetails.css";
import { fetchCategoriesRequest } from "../../redux/categories/categorySlice";
import { uploadAttachmentRequest } from "../../redux/incident/incidentSlice";
import useChatbot from "../../hooks/useChatbot";
import ChatbotModal from "../Chatbot/ChatbotModal";
import { getPriorityFromDesignation } from "../../utils/priorityMapper";

const IncidentDetails = ({
  userData,
  formData,
  selectedFile,
  handleCategorySelect,
  handleLocationSelect,
  handleClearCategory,
  handleClearLocation,
  handleFileChange,
  handleRemoveFile,
  setIsCategoryPopupOpen,
  setIsLocationPopupOpen,
  setFormData,
}) => {
  const [selectedPriority, setSelectedPriority] = useState(
    formData.priority || ""
  );
  const [isManualPriority, setIsManualPriority] = useState(false);
  const [debouncedDescription, setDebouncedDescription] = useState(formData.description || "");
  const [localIsLocationPopupOpen, setLocalIsLocationPopupOpen] =
    useState(false);
  const [localIsCategoryPopupOpen, setLocalIsCategoryPopupOpen] =
    useState(false);

  // Chatbot Hook
  const {
    loading: chatbotLoading,
    error: chatbotError,
    clarification,
    analysisResult,
    analyzeDescription,
    respondToClarification,
    resetChatbot
  } = useChatbot();

  // Get logged-in user and lookup user from Redux
  const loginUser = useSelector((state) => state.auth.user);
  const lookupUser = useSelector((state) => state.userLookup.user);

  // Fetch categories from backend using redux
  const dispatch = useDispatch();
  const categoryDataset = useSelector((state) => state.categories.list);
  const categoryLoading = useSelector((state) => state.categories.loading);
  const categoryError = useSelector((state) => state.categories.error);

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  // Debounce description to prevent rapid priority changes while typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedDescription(formData.description);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(handler);
    };
  }, [formData.description]);

  // Effect to handle Chatbot Analysis Result
  useEffect(() => {
    if (analysisResult) {
      console.log("Chatbot Analysis Result:", analysisResult);
      console.log("Available Categories (Redux):", categoryDataset);

      // 1. Auto-select Category
      if (analysisResult.category && categoryDataset && categoryDataset.length > 0) {
        const resultCat = analysisResult.category.trim().toLowerCase();

        let foundItem = null;

        // Recursive search or 3-level loop (Main -> Sub -> Item)
        // Based on CategoryDropdown.jsx structure: Main -> subCategories -> categoryItems
        for (const mainCat of categoryDataset) {
          if (!mainCat.subCategories) continue;

          for (const subCat of mainCat.subCategories) {
            if (!subCat.categoryItems) continue;

            for (const item of subCat.categoryItems) {
              const itemName = item.name.trim().toLowerCase();
              // Check for exact match or strong partial match
              if (itemName === resultCat || itemName.includes(resultCat) || resultCat.includes(itemName)) {
                foundItem = item;
                break;
              }
            }
            if (foundItem) break;
          }
          if (foundItem) break;
        }

        if (foundItem) {
          console.log("Category Matched (Item):", foundItem);
          // Auto-select the LEAF item
          console.log("Auto-selecting category:", { name: foundItem.name, number: foundItem.category_code || foundItem.id });
          handleCategorySelect({
            name: foundItem.name,
            number: foundItem.category_code || foundItem.id // Prefer category_code if available
          });
        } else {
          console.warn(`Category '${analysisResult.category}' not found in nested dataset.`);
          // Try to match against main or sub category names as fallback
          for (const mainCat of categoryDataset) {
            const mainName = mainCat.name?.trim().toLowerCase() || '';
            if (mainName.includes(resultCat) || resultCat.includes(mainName)) {
              console.log("Matched against main category:", mainCat);
              handleCategorySelect({
                name: mainCat.name,
                number: mainCat.id || mainCat.code
              });
              return;
            }
            
            if (!mainCat.subCategories) continue;
            for (const subCat of mainCat.subCategories) {
              const subName = subCat.name?.trim().toLowerCase() || '';
              if (subName.includes(resultCat) || resultCat.includes(subName)) {
                console.log("Matched against subcategory:", subCat);
                handleCategorySelect({
                  name: subCat.name,
                  number: subCat.id || subCat.code
                });
                return;
              }
            }
          }
          console.warn(`No category match found for '${analysisResult.category}'`);
        }
      }

      // 2. Auto-select Priority
      if (analysisResult.priority) {
        // Map chatbot priority (lowercase) to frontend format (Title Case)
        const priorityMap = {
          'critical': 'Critical',
          'high': 'High',
          'medium': 'Medium',
          'low': 'Medium' // Default low to medium if needed
        };
        const mappedPriority = priorityMap[analysisResult.priority.toLowerCase()] || 'Medium';

        console.log("Auto-selecting priority:", mappedPriority);
        setSelectedPriority(mappedPriority);
        setFormData((prev) => ({
          ...prev,
          priority: mappedPriority
        }));
      }

      // 3. Update Description if modified (e.g. via troubleshooting)
      if (analysisResult.description && analysisResult.description !== formData.description) {
        console.log("Updating description from chatbot result");
        setFormData((prev) => ({
          ...prev,
          description: analysisResult.description
        }));
      }
    }
  }, [analysisResult, categoryDataset, handleCategorySelect]);

  // Effect to handle Auto-Priority based on Business Rules (ERP Grade/Designation + Content)
  useEffect(() => {
    // If user has manually selected a priority, do not overwrite it with auto-rules
    if (isManualPriority) {
      console.log("[AUTO-PRIORITY] Skipped because user manually selected priority.");
      return;
    }

    // Determine which user to use for priority (prefer affected/lookup user if available, else login user)
    const activeUser = (lookupUser && lookupUser.serviceNumber) ? { 
      designation: lookupUser.designation, 
      gradeName: lookupUser.gradeName 
    } : loginUser;

    if (activeUser) {
      // Use debounced description to prevent flicker
      const autoPriority = getPriorityFromDesignation(activeUser, {
        ...formData,
        description: debouncedDescription
      });
      
      // Update local state and parent form data if priority changed
      if (autoPriority !== selectedPriority) {
        setSelectedPriority(autoPriority);
        setFormData((prev) => ({
          ...prev,
          priority: autoPriority
        }));
        console.log(`[AUTO-PRIORITY] Set to ${autoPriority} based on rules (debounced).`);
      }
    }
  }, [loginUser, lookupUser, formData.category, debouncedDescription, isManualPriority]);


  const handleChange = (event) => {
    const newPriority = event.target.value;
    setSelectedPriority(newPriority);
    setIsManualPriority(true); // User manually set priority
    setFormData((prevFormData) => ({
      ...prevFormData,
      priority: newPriority,
    }));
  };

  const handleDescriptionChange = (e) => {
    const description = e.target.value;
    setFormData((prevFormData) => ({
      ...prevFormData,
      description,
    }));
  };

  const handleDescriptionBlur = () => {
    // Only trigger if description has enough content and we haven't already analyzed this exact text
    // (For simplicity, just trigger on blur if length > 5)
    if (formData.description && formData.description.length > 5) {
      analyzeDescription(formData.description);
    }
  };

  const handleChatbotSelection = (selection) => {
    // Respond to chatbot clarification
    respondToClarification(selection, formData.description);
  };

  const handleCloseChatbot = () => {
    resetChatbot();
  };


  return (
    <div className="AddInicident-content2-IncidentDetails">
      <div className="AddInicident-content2-IncidentDetails-TitleBar">
        Incident Details
      </div>
      <div className="AddInicident-content2-IncidentDetails-IncidentInfoContainer">
        <div className="AddInicident-content2-IncidentDetails-IncidentInfoContainer-userDetails">
          Reported by{" "}
          {userData && userData.length > 0
            ? userData[0].user_name
            : "Current User"}
        </div>
        <div className="AddInicident-content2-IncidentDetails-IncidentInfoContainer-selection">
          <div className="AddInicident-content2-IncidentDetails-IncidentInfoContainer-userDetails">
            Select Incident Type :
          </div>
          <div className="AddInicident-content2-IncidentDetails-IncidentInfoContainer-userDetails category-container">
            {formData.category && formData.category.name ? (
              <>
                Category: {formData.category.name}{" "}
                <IoMdRemove
                  onClick={handleClearCategory}
                  className="category-icon"
                />
              </>
            ) : (
              <>
                Category:{" "}
                <IoMdAdd
                  onClick={() => setLocalIsCategoryPopupOpen(true)}
                  className="category-icon"
                />
              </>
            )}
          </div>
          <div className="AddInicident-content2-IncidentDetails-IncidentInfoContainer-userDetails location-container">
            {formData.location && formData.location.name ? (
              <>
                Location: {formData.location.name}{" "}
                <IoMdRemove
                  onClick={handleClearLocation}
                  className="location-icon"
                />
              </>
            ) : (
              <>
                Location:{" "}
                <IoMdAdd
                  onClick={() => setLocalIsLocationPopupOpen(true)}
                  className="location-icon"
                />
              </>
            )}
          </div>
        </div>
        <div className="AddInicident-content2-IncidentDetails-DescriptionContainer">
          Description:
          <textarea
            className="AddInicident-content2-IncidentDetails-DescriptionTextArea"
            rows={4}
            placeholder="Enter Description here..."
            value={formData.description}
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
            required
          />
          {chatbotLoading && <span className="chatbot-loading-text">Analyzing...</span>}
        </div>
        <div className="AddInicident-content2-IncidentDetails-Container3">
          <div className="AddInicident-content2-IncidentDetails-Container3-dropdown-container">
            <label
              htmlFor="priority"
              className="AddInicident-content2-IncidentDetails-Container3-dropdown-container-label"
            >
              Priority :
            </label>
            <select
              id="priority"
              value={selectedPriority}
              onChange={handleChange}
              className="priority-select"
              required
            >
              <option value="" disabled>
                Select One
              </option>
              <option value="Critical" className="option-critical">
                Critical
              </option>
              <option value="High" className="option-high">
                High
              </option>
              <option value="Medium" className="option-medium">
                Medium
              </option>
            </select>
          </div>
          <div className="AddInicident-content2-IncidentDetails-AttachmentContainer">
            Attachment:
            <input
              type="file"
              id="file-upload"
              className="AddInicident-content2-IncidentDetails-AttachmentContainer-file-input"
              onChange={handleFileChange}
            />
            <label
              htmlFor="file-upload"
              className="AddInicident-content2-IncidentDetails-AttachmentContainer-file-upload-button"
            >
              Choose A File
            </label>
            {selectedFile && (
              <div className="AddInicident-content2-IncidentDetails-AttachmentContainer-file-selected-text">
                <span>Selected: {selectedFile.name}</span>
                <button
                  onClick={handleRemoveFile}
                  className="remove-file-button"
                >
                  x
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Category Dropdown Popup */}
      {localIsCategoryPopupOpen && (
        <CategoryDropdown
          categoryDataset={categoryDataset}
          hideTier3={true}
          onSelect={(category) => {
            setFormData((prev) => ({
              ...prev,
              category,
            }));
            setLocalIsCategoryPopupOpen(false);
          }}
          onClose={() => setLocalIsCategoryPopupOpen(false)}
        />
      )}
      {/* Location Dropdown Popup */}
      {localIsLocationPopupOpen && (
        <LocationDropdown
          onSelect={(location) => {
            setFormData((prev) => ({
              ...prev,
              location,
            }));
            setLocalIsLocationPopupOpen(false);
          }}
          onClose={() => setLocalIsLocationPopupOpen(false)}
        />
      )}
      {/* Chatbot Modal */}
      {clarification && (
        <ChatbotModal
          question={clarification.question}
          options={clarification.options}
          onSelect={handleChatbotSelection}
          onClose={handleCloseChatbot}
        />
      )}
    </div>
  );
};

export default IncidentDetails;