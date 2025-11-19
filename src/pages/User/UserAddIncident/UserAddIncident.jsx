import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./UserAddIncident.css";
import AffectedUserDetails from "../../../components/AffectedUserDetails/AffectedUserDetails";
import IncidentDetails from "../../../components/IncidentDetails/IncidentDetails";
import CategoryDropdown from "../../../components/CategoryDropdown/CategoryDropDown";
import LocationDropdown from "../../../components/LocationDropdown/LocationDropdown";
import { IoIosArrowForward } from "react-icons/io";
import {
  createIncidentRequest,
  clearError,
} from "../../../redux/incident/incidentSlice";
import { clearLookupUser } from "../../../redux/userLookup/userLookupSlice";

const UserAddIncident = () => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth);
  const { error: userLookupError, user: lookupUser } = useSelector((state) => state.userLookup);

  const [formData, setFormData] = useState({
    serviceNo: "",
    tpNumber: "",
    name: "",
    designation: "",
    email: "",
    category: { name: "", number: "" },
    location: { name: "", number: "" },
    priority: "",
    description: "",
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const categoryPopupRef = useRef(null);
  const locationPopupRef = useRef(null);

  // Update form data when user is loaded
  // Removed auto-population of serviceNo from user at mount

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (
        categoryPopupRef.current &&
        !categoryPopupRef.current.contains(e.target)
      ) {
        setIsCategoryPopupOpen(false);
      }
      if (
        locationPopupRef.current &&
        !locationPopupRef.current.contains(e.target)
      ) {
        setIsLocationPopupOpen(false);
      }
    };

    if (isCategoryPopupOpen || isLocationPopupOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isCategoryPopupOpen, isLocationPopupOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategorySelect = (selectedCategory) => {
    setFormData({ ...formData, category: selectedCategory });
    setIsCategoryPopupOpen(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setFormData({ ...formData, location: selectedLocation });
    setIsLocationPopupOpen(false);
  };

  const handleClearCategory = () => {
    setFormData({ ...formData, category: { name: "", number: "" } });
    setIsCategoryPopupOpen(false);
  };

  const handleClearLocation = () => {
    setFormData({ ...formData, location: { name: "", number: "" } });
    setIsLocationPopupOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) {
        return;
    }

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-powerpoint', // .ppt
    'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    'text/plain', // .txt
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Invalid file type. Only PDF , common document formats and image files are allowed.");
    e.target.value = ""; 
    return;
  }

    if (file.size > 50 * 1024 * 1024) { 
        alert("File size exceeds 50MB. Please choose a smaller file.");
        e.target.value = ""; 
        return;
    }
    setSelectedFile(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    document.getElementById("file-upload").value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = [
      { key: "serviceNo", label: "Service No" },
      { key: "category.number", label: "Category" },
      { key: "location.number", label: "Location" },
      { key: "priority", label: "Priority" },
      { key: "description", label: "Description" },
    ];

    const missingFields = requiredFields
      .filter((field) => {
        if (field.key.includes(".")) {
          const [parent, child] = field.key.split(".");
          return !formData[parent][child];
        }
        return !formData[field.key];
      })
      .map((field) => field.label);

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    const validPriorities = ["Medium", "High", "Critical"];
    if (!validPriorities.includes(formData.priority)) {
      alert("Please select a valid priority: Medium, High, or Critical");
      return;
    }

    const incidentNumber = `INC-${Date.now()}`;

    const incidentData = {
      incident_number: incidentNumber,
      informant: formData.serviceNo, // Affected User's service number
      location: formData.location.name, // Use location name, not number
      handler: formData.serviceNo, // Affected User's service number as handler
      update_by: formData.serviceNo, // Affected User's service number
      category: formData.category.name,
      update_on: new Date().toISOString().split("T")[0],
      status: "Open",
      priority: formData.priority,
      description: formData.description,
      notify_informant: true,
      Attachment: selectedFile ? selectedFile.name : null,
    };

    dispatch(createIncidentRequest(incidentData));

    setFormData({
      serviceNo: "",
      tpNumber: "",
      name: "",
      designation: "",
      email: "",
      category: { name: "", number: "" },
      location: { name: "", number: "" },
      priority: "",
      description: "",
    });
    setSelectedFile(null);
    if (document.getElementById("file-upload")) {
      document.getElementById("file-upload").value = "";
    }
    setSubmitSuccess(true);
    // Clear user lookup status after submit
    dispatch(clearLookupUser());

    setTimeout(() => {
      setSubmitSuccess(false);
    }, 5000);
  };

  
  const renderStatusMessage = () => {
    if (loading) {
      return (
        <div className="status-message loading-message">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Creating incident...</p>
          </div>
        </div>
      );
    }

    if (submitSuccess) {
      return (
        <div className="status-message success-message">
          <h3>✅ Incident Submitted Successfully!</h3>
          <p>Your report will be reviewed shortly. Thank you!</p>
        </div>
      );
    }

   
    if (error) {
      return (
        <div className="status-message error-message">
          <h3>❌ Failed to Create Incident</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="UserAddIncident-main-content">
      <div className="UserAddIncident-breadcrumb">
        <span>Incidents</span>
        <IoIosArrowForward />
        <span>Add Incident</span>
      </div>

      {renderStatusMessage()}

      <div className="UserAddIncident-form">
        <AffectedUserDetails
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
        />
        <br />
        <IncidentDetails
          formData={formData}
          selectedFile={selectedFile}
          handleCategorySelect={handleCategorySelect}
          handleLocationSelect={handleLocationSelect}
          handleClearCategory={handleClearCategory}
          handleClearLocation={handleClearLocation}
          handleFileChange={handleFileChange}
          handleRemoveFile={handleRemoveFile}
          setIsCategoryPopupOpen={setIsCategoryPopupOpen}
          setIsLocationPopupOpen={setIsLocationPopupOpen}
          setFormData={setFormData}
        />
        <br />
        <br />
        <div className="UserAddIncident-submit-button-container">
          <button
            className="UserAddIncident-submit-button"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      </div>

      {isCategoryPopupOpen && (
        <div ref={categoryPopupRef}>
          <CategoryDropdown
            onSelect={handleCategorySelect}
            onClose={() => setIsCategoryPopupOpen(false)}
          />
        </div>
      )}

      {isLocationPopupOpen && (
        <div ref={locationPopupRef}>
          <LocationDropdown
            onSelect={handleLocationSelect}
            onClose={() => setIsLocationPopupOpen(false)}
          />
        </div>
      )}
    </div>
  );
};

export default UserAddIncident;
