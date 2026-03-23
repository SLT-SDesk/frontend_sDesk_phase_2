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

  // Fetch categories from backend using redux
  const dispatch = useDispatch();
  const categoryDataset = useSelector((state) => state.categories.list);
  const categoryLoading = useSelector((state) => state.categories.loading);
  const categoryError = useSelector((state) => state.categories.error);

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  // Effect to handle Chatbot Analysis Result
  useEffect(() => {
    if (analysisResult) {
      console.log("Chatbot Analysis Result:", analysisResult);
      console.log("Available Categories (Redux):", categoryDataset);

      // Helper for robust string comparison
      const normalize = (str) => {
        if (!str) return "";
        return str
          .toLowerCase()
          .trim()
          .replace(/[\u2013\u2014]/g, "-") // Normalize en-dash and em-dash to hyphen
          .replace(/\s+/g, " "); // Normalize multiple spaces
      };

      // 1. Auto-select Category
      if (analysisResult.category && categoryDataset && categoryDataset.length > 0) {
        const resultCat = normalize(analysisResult.category);
        console.log(`Attempting to match chatbot category: "${resultCat}"`);

        let foundItem = null;

        // Optimized Search Order:
        // Level 1: Check for Exact Item Match
        // Level 2: Check for Exact Sub-Category Match -> pick first item
        // Level 3: Check for Exact Main Category Match -> pick first item
        // Level 4: Partial Match on Item
        // Level 5: Partial Match on Sub-Category -> pick first item
        // Level 6: Partial Match on Main Category -> pick first item

        // Let's do a multi-pass search for better accuracy

        // --- Pass 1: Exact Matches (Normalized) ---
        for (const mainCat of categoryDataset) {
          const mainName = normalize(mainCat.name);

          // Check Main exact
          if (mainName === resultCat) {
            const firstItem = mainCat.subCategories?.[0]?.categoryItems?.[0];
            if (firstItem) { foundItem = firstItem; break; }
          }

          if (mainCat.subCategories) {
            for (const subCat of mainCat.subCategories) {
              const subName = normalize(subCat.name);

              // Check Sub exact
              if (subName === resultCat) {
                const firstItem = subCat.categoryItems?.[0];
                if (firstItem) { foundItem = firstItem; break; }
              }

              if (subCat.categoryItems) {
                for (const item of subCat.categoryItems) {
                  const itemName = normalize(item.name);
                  // Check Item exact
                  if (itemName === resultCat) {
                    foundItem = item;
                    break;
                  }
                }
              }
              if (foundItem) break;
            }
          }
          if (foundItem) break;
        }

        // --- Pass 2: Partial Matches (Normalized) ---
        if (!foundItem) {
          for (const mainCat of categoryDataset) {
            const mainName = normalize(mainCat.name);

            // Check Main partial
            if (mainName.includes(resultCat) || resultCat.includes(mainName)) {
              const firstItem = mainCat.subCategories?.[0]?.categoryItems?.[0];
              if (firstItem) { foundItem = firstItem; break; }
            }

            if (mainCat.subCategories) {
              for (const subCat of mainCat.subCategories) {
                const subName = normalize(subCat.name);

                // Check Sub partial
                if (subName.includes(resultCat) || resultCat.includes(subName)) {
                  const firstItem = subCat.categoryItems?.[0];
                  if (firstItem) { foundItem = firstItem; break; }
                }

                if (subCat.categoryItems) {
                  for (const item of subCat.categoryItems) {
                    const itemName = normalize(item.name);
                    // Check Item partial
                    if (itemName.includes(resultCat) || resultCat.includes(itemName)) {
                      foundItem = item;
                      break;
                    }
                  }
                }
                if (foundItem) break;
              }
            }
            if (foundItem) break;
          }
        }

        if (foundItem) {
          console.log("Category Matched:", foundItem.name, "(ID:", foundItem.id, ")");
          // Auto-select the LEAF item
          handleCategorySelect({
            name: foundItem.name,
            number: foundItem.category_code || foundItem.id // Prefer category_code if available
          });
        } else {
          console.warn(`Category '${analysisResult.category}' not found in nested dataset.`);
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

        setSelectedPriority(mappedPriority);
        setFormData((prev) => ({
          ...prev,
          priority: mappedPriority
        }));
      }

      // 3. Update Description if modified (e.g. via troubleshooting)
      if (analysisResult.description && analysisResult.description !== formData.description) {
        setFormData((prev) => ({
          ...prev,
          description: analysisResult.description
        }));
      }
    }
  }, [analysisResult, categoryDataset]);


  const handleChange = (event) => {
    const newPriority = event.target.value;
    setSelectedPriority(newPriority);
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