import React, { useState, useEffect, useRef } from "react";
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
    isCompleted,
    analyzeDescription,
    respondToClarification,
    resetChatbot,
  } = useChatbot();

  const lastAnalyzedRef = useRef("");

  // Fetch categories from backend using redux
  const dispatch = useDispatch();
  const categoryDataset = useSelector((state) => state.categories.list);
  const categoryLoading = useSelector((state) => state.categories.loading);
  const categoryError = useSelector((state) => state.categories.error);

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

  // Keep local selectedPriority synced with parent formData.priority
  useEffect(() => {
    if (formData.priority && formData.priority !== selectedPriority) {
      setSelectedPriority(formData.priority);
    }
  }, [formData.priority]);

  // Debounced description typing trigger for chatbot
  useEffect(() => {
    // If chatbot is already completed or category is already selected, do not trigger API calls
    if (isCompleted) return;
    if (formData.category && formData.category.name) return;

    const trimmed = (formData.description || "").trim();
    if (trimmed.length < 5) return;

    const timer = setTimeout(() => {
      if (trimmed && trimmed !== lastAnalyzedRef.current && !isCompleted) {
        lastAnalyzedRef.current = trimmed;
        analyzeDescription(trimmed);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.description, formData.category, isCompleted, analyzeDescription]);

  // Handle Chatbot Analysis Result
  useEffect(() => {
    if (!analysisResult) return;
    console.log("[Chatbot] Analysis Result:", analysisResult);

    // Keep lastAnalyzedRef synced with updated description to prevent re-triggering
    if (analysisResult.description) {
      lastAnalyzedRef.current = analysisResult.description.trim();
    }

    // 1. Auto-select Category
    if (analysisResult.category) {
      const resultCat = analysisResult.category.trim().toLowerCase();
      let foundSelection = null;

      if (categoryDataset && Array.isArray(categoryDataset) && categoryDataset.length > 0) {
        // Level 1 search: leaf category items
        for (const mainCat of categoryDataset) {
          if (!mainCat.subCategories) continue;
          for (const subCat of mainCat.subCategories) {
            if (!subCat.categoryItems) continue;
            for (const item of subCat.categoryItems) {
              const itemName = (item.name || "").trim().toLowerCase();
              if (itemName === resultCat || itemName.includes(resultCat) || resultCat.includes(itemName)) {
                foundSelection = {
                  name: item.name,
                  number: item.category_code || item.id || "CAT-AUTO",
                };
                break;
              }
            }
            if (foundSelection) break;
          }
          if (foundSelection) break;
        }

        // Level 2 search: subcategories
        if (!foundSelection) {
          for (const mainCat of categoryDataset) {
            if (!mainCat.subCategories) continue;
            for (const subCat of mainCat.subCategories) {
              const subName = (subCat.name || "").trim().toLowerCase();
              if (subName === resultCat || subName.includes(resultCat) || resultCat.includes(subName)) {
                foundSelection = {
                  name: subCat.name,
                  number: subCat.category_code || subCat.id || "SUB-AUTO",
                };
                break;
              }
            }
            if (foundSelection) break;
          }
        }

        // Level 3 search: main categories
        if (!foundSelection) {
          for (const mainCat of categoryDataset) {
            const mainName = (mainCat.name || "").trim().toLowerCase();
            if (mainName === resultCat || mainName.includes(resultCat) || resultCat.includes(mainName)) {
              foundSelection = {
                name: mainCat.name,
                number: mainCat.category_code || mainCat.id || "MAIN-AUTO",
              };
              break;
            }
          }
        }
      }

      // Fallback: Use direct category name returned by chatbot
      if (!foundSelection) {
        foundSelection = {
          name: analysisResult.category,
          number: "AUTO",
        };
      }

      console.log("[Chatbot] Auto-selecting category:", foundSelection);
      if (typeof handleCategorySelect === "function") {
        handleCategorySelect(foundSelection);
      } else {
        setFormData((prev) => ({
          ...prev,
          category: foundSelection,
        }));
      }
    }

    // 2. Auto-select Priority
    if (analysisResult.priority) {
      const pStr = String(analysisResult.priority).toLowerCase();
      let mappedPriority = "Medium";
      if (pStr.includes("critical") || pStr.includes("priority_1") || pStr.includes("priority 1")) {
        mappedPriority = "Critical";
      } else if (pStr.includes("high") || pStr.includes("priority_2") || pStr.includes("priority 2")) {
        mappedPriority = "High";
      } else if (pStr.includes("medium") || pStr.includes("priority_3") || pStr.includes("priority 3")) {
        mappedPriority = "Medium";
      }

      console.log("[Chatbot] Auto-selecting priority:", mappedPriority);
      setSelectedPriority(mappedPriority);
      setFormData((prev) => ({
        ...prev,
        priority: mappedPriority,
      }));
    }

    // 3. Update Description if modified (e.g. via troubleshooting)
    if (analysisResult.description && analysisResult.description !== formData.description) {
      console.log("[Chatbot] Updating description from chatbot result");
      setFormData((prev) => ({
        ...prev,
        description: analysisResult.description,
      }));
    }
  }, [analysisResult, categoryDataset, handleCategorySelect, setFormData, formData.description]);

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
    if (isCompleted) return;
    if (formData.category && formData.category.name) return;

    const trimmed = (formData.description || "").trim();
    if (trimmed.length >= 5 && trimmed !== lastAnalyzedRef.current) {
      lastAnalyzedRef.current = trimmed;
      analyzeDescription(trimmed);
    }
  };

  const handleChatbotSelection = (selection) => {
    respondToClarification(selection, formData.description);
  };

  const handleCloseChatbot = () => {
    resetChatbot();
  };

  const onClearCategory = () => {
    resetChatbot();
    lastAnalyzedRef.current = "";
    if (typeof handleClearCategory === "function") {
      handleClearCategory();
    } else {
      setFormData((prev) => ({
        ...prev,
        category: { name: "", number: "" },
      }));
    }
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
                  onClick={onClearCategory}
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