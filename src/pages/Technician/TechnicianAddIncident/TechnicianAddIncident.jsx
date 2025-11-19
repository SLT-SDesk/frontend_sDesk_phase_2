import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import "./TechnicianAddIncident.css";
import AffectedUserDetails from "../../../components/AffectedUserDetails/AffectedUserDetails";
import IncidentDetails from "../../../components/IncidentDetails/IncidentDetails";
import CategoryDropdown from "../../../components/CategoryDropdown/CategoryDropDown";
import { IoIosArrowForward } from "react-icons/io";
import LocationDropdown from "../../../components/LocationDropdown/LocationDropdown";
import {
  createIncidentRequest,
  clearError,
  uploadAttachmentRequest,
} from "../../../redux/incident/incidentSlice";

const TechnicianAddIncident = () => {
  const dispatch = useDispatch();

  // Redux state
  const { loading, error, uploadedAttachment } = useSelector((state) => state.incident);
  const { user } = useSelector((state) => state.auth);

  // Get technician user data
  const userData = [
    {
      service_number: user?.serviceNum || "TECH001", // Use logged-in user's serviceNum or fallback
      user_name: user?.name || "Technician User",
      email: user?.email || "technician@company.com",
    },
  ];


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

  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const categoryPopupRef = useRef(null);
  const locationPopupRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

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
    setFormData({ ...formData, [name]: value });
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

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    
    if (!file) return;

    // File type validation
    const allowedTypes = ['pdf', 'png', 'jpg', 'jpeg'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Only PDF, PNG, JPG, and JPEG files are allowed.');
      e.target.value = '';
      return;
    }

    // File size validation (1MB = 1024 * 1024 bytes)
    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB.');
      e.target.value = '';
      return;
    }

    try {
      // Upload file immediately
      dispatch(uploadAttachmentRequest(file));
      setSelectedFile(file);
    } catch (error) {
      alert('Failed to upload file. Please try again.');
      e.target.value = '';
    }
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
    } // Validate priority values
    const validPriorities = ["Medium", "High", "Critical"];
    if (!validPriorities.includes(formData.priority)) {
      alert("Please select a valid priority: Medium, High, or Critical");
      return;
    }

    // Generate unique incident number
    const incidentNumber = `INC-${Date.now()}`;

    const incidentData = {
      incident_number: incidentNumber,
      informant: formData.serviceNo, // Affected User's service number
      location: formData.location.name, // Use location name, not number
      handler: formData.serviceNo, // Affected User's service number as handler
      update_by: formData.serviceNo, // Affected User's service number
      category: formData.category.name, // Use category name, not number
      update_on: new Date().toISOString().split("T")[0], // Date format: YYYY-MM-DD
      status: "Open", // Must be 'Open', 'In Progress', 'Hold', or 'Closed'
      priority: formData.priority, // Must be 'Medium', 'High', or 'Critical'
      description: formData.description || "",
      notify_informant: true,
      Attachment: selectedFile ? selectedFile.name : null,
      attachmentFilename: uploadedAttachment ? uploadedAttachment.filename : null,
      attachmentOriginalName: uploadedAttachment ? uploadedAttachment.originalName : null,
    };

    dispatch(createIncidentRequest(incidentData));

    // Reset form
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

    // Clear success message after 5 seconds
    setTimeout(() => {
      setSubmitSuccess(false);
    }, 5000);
  };

  // Success and error handling
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
          <h3>✅ Incident Created Successfully!</h3>
          <p>The incident has been submitted and will be processed soon.</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="status-message error-message">
          <h3>❌ Error Creating Incident</h3>
          <p>{error}</p>
          <button onClick={() => dispatch(clearError())}>Dismiss</button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="TechnicianAddInicident-main-content">
      <div className="TechnicianAddInicident-tickets-creator">
        <span className="TechnicianAddInicident-svr-desk">Incidents</span>
        <IoIosArrowForward />
        <span className="TechnicianAddInicident-created-ticket">
          Add Incident
        </span>
      </div>

      {renderStatusMessage()}

      <div className="TechnicianAddInicident-content2">
        {" "}
        <AffectedUserDetails
          formData={formData}
          setFormData={setFormData}
          handleInputChange={handleInputChange}
        />
        <IncidentDetails
          userData={userData}
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
        <div className="TechnicianAddInicident-submit-button-container">
          <button
            type="submit"
            className="TechnicianAddInicident-submit-button"
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

export default TechnicianAddIncident;
