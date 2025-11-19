import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import LocationDropdown from "../LocationDropdown/LocationDropdown";
import CategoryDropdown from "../CategoryDropdown/CategoryDropDown";
import { IoMdAdd, IoMdRemove } from "react-icons/io";
import "./IncidentDetails.css";
import { fetchCategoriesRequest } from "../../redux/categories/categorySlice";
import { uploadAttachmentRequest } from "../../redux/incident/incidentSlice";

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

  // Fetch categories from backend using redux
  const dispatch = useDispatch();
  const categoryDataset = useSelector((state) => state.categories.list);
  const categoryLoading = useSelector((state) => state.categories.loading);
  const categoryError = useSelector((state) => state.categories.error);

  useEffect(() => {
    dispatch(fetchCategoriesRequest());
  }, [dispatch]);

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
            required
          />
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
    </div>
  );
};

export default IncidentDetails;