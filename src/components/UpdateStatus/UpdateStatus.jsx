import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { Card, Form, Row, Col, Button } from 'react-bootstrap';
import { FaPlusSquare } from "react-icons/fa";
import CategoryDropdown from "../CategoryDropdown/CategoryDropDown";
import LocationDropdown from "../LocationDropdown/LocationDropdown";
import './UpdateStatus.css';

const UpdateStatus = forwardRef(({
  incidentData,
  usersDataset,
  categoryDataset,
  locationDataset,
  incident,
  onStatusChange,
  loggedInUser,
}, ref) => {
  const [isCategoryPopupOpen, setIsCategoryPopupOpen] = useState(false);
  const [isLocationPopupOpen, setIsLocationPopupOpen] = useState(false);
  const categoryPopupRef = useRef(null);
  const locationPopupRef = useRef(null);

  const [technicians, setTechnicians] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState({ name: incidentData.category || "", number: "" });
  const [selectedLocation, setSelectedLocation] = useState({ name: incidentData.location || "", number: "" });

  const [fileName, setFileName] = useState("No file chosen");
  const [selectedFile, setSelectedFile] = useState(null);
  const [updatedBy, setUpdatedBy] = useState("");
  const [transferTo, setTransferTo] = useState("");
  const [description, setDescription] = useState("");
  const [notifyUser, setNotifyUser] = useState(false);
  const [priority, setPriority] = useState("");
  const [status, setStatus] = useState("");

  const handleCategorySelect = (selectedCategory) => {
    setSelectedCategory(selectedCategory);
    setIsCategoryPopupOpen(false);
  };

  const handleLocationSelect = (selectedLocation) => {
    setSelectedLocation(selectedLocation);
    setIsLocationPopupOpen(false);
  };

  useEffect(() => {
    const data = {
      updatedBy,
      category: selectedCategory.name, // Changed from .number to .name
      location: selectedLocation.number,
      transferTo,
      description,
      priority,
      status,
      selectedFile,
    };
    console.log("UpdateStatus: Data being sent to onStatusChange:", data);
    onStatusChange(data);
  }, [updatedBy, selectedCategory, selectedLocation, transferTo, description, priority, status, selectedFile]);

  useEffect(() => {
    if ((loggedInUser && loggedInUser.userName) || loggedInUser.name) {
      setUpdatedBy(loggedInUser.userName || loggedInUser.name);
    } else {
      setUpdatedBy("");
    }

    if (incident && usersDataset.length > 0 && categoryDataset.length > 0 && locationDataset.length > 0) {
      setStatus(incident.status || "");
      setPriority(incident.priority || "");
      setDescription(incident.description || "");

      if (incident.handler) {
        const handlerUser = usersDataset.find((user) => user.service_number === incident.handler);
        setTransferTo(handlerUser ? handlerUser.service_number : incident.handler);
      }

      const filteredTechnicians = usersDataset.filter((user) => user.role === "technician");
      setTechnicians(filteredTechnicians);

      const categoryItem = categoryDataset.find((item) => item.grandchild_category_number === incident.category);
      setSelectedCategory({ name: categoryItem ? categoryItem.grandchild_category_name : incidentData.category || "", number: categoryItem ? categoryItem.grandchild_category_number : "" });

      const locationItem = locationDataset.find((item) => item.loc_number === incident.location);
      setSelectedLocation({ name: locationItem ? locationItem.loc_name : incidentData.location || "", number: locationItem ? locationItem.loc_number : "" });
    }
  }, [incident, usersDataset, categoryDataset, locationDataset, incidentData, loggedInUser]);

  // Clear form function
  const clearForm = () => {
    setTransferTo("");
    setDescription("");
    setPriority("");
    setStatus("");
    setSelectedFile(null);
    setFileName("No file chosen");
    setNotifyUser(false);
    
    // Clear file input
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  // Expose clearForm function to parent component
  useImperativeHandle(ref, () => ({
    clearForm
  }));

  return (
    <Card className="update-status-card-modern shadow-sm">
      <Card.Header as="h5" className="bg-light text-dark">
        Update Status - <span className="fw-bold text-primary">{incidentData.regNo}</span>
      </Card.Header>
      <Card.Body>
        <Form>
          <Row className="mb-3">
            <Form.Group as={Col} md="3" controlId="updateBy">
              <Form.Label>Update By</Form.Label>
              <Form.Control type="text" value={updatedBy} readOnly />
            </Form.Group>

            <Form.Group as={Col} md="3" controlId="category">
              <Form.Label>
                <FaPlusSquare
                  onClick={() => loggedInUser.role !== 'technician' && setIsCategoryPopupOpen(true)}
                  className={`me-1 ${loggedInUser.role !== 'technician' ? 'clickable-icon' : ''}`}
                />
                Category
              </Form.Label>
              <Form.Control
                type="text"
                value={selectedCategory.name}
                readOnly
                disabled={loggedInUser.role === 'technician'}
                onClick={() => loggedInUser.role !== 'technician' && setIsCategoryPopupOpen(true)}
              />
            </Form.Group>

            <Form.Group as={Col} md="2" controlId="location">
              <Form.Label>
                <FaPlusSquare onClick={() => setIsLocationPopupOpen(true)} className="me-1 clickable-icon" />
                Location
              </Form.Label>
              <Form.Control type="text" value={selectedLocation.name} readOnly onClick={() => setIsLocationPopupOpen(true)} />
            </Form.Group>

            <Form.Group as={Col} md="4" controlId="transferTo">
              <Form.Label>Transfer Incident</Form.Label>
              <Form.Select value={transferTo} onChange={(e) => setTransferTo(e.target.value)}>
                <option value="">Select One</option>
                <option value="tier2-auto">Automatically Assign For Tier2</option>
                  <option value="teamadmin">Assign For TeamAdmin</option>
                {technicians.map((technician) => (
                  <option key={technician.service_number} value={technician.service_number}>
                    {technician.display_name || technician.user_name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Row>

          <Row className="mb-3">
            <Form.Group as={Col} md="6" controlId="description">
              <Form.Label className="d-flex align-items-center">
                Description <span className="text-danger ms-1">*</span>
                <Form.Check type="checkbox" className="ms-3" label="Notify User" checked={notifyUser} onChange={(e) => setNotifyUser(e.target.checked)} />
              </Form.Label>
              <Form.Control as="textarea" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
            </Form.Group>

            <Form.Group as={Col} md="3" controlId="priority">
              <Form.Label>Priority</Form.Label>
              <Form.Select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">Select One</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
              </Form.Select>
            </Form.Group>

            <Form.Group as={Col} md="3" controlId="status">
              <Form.Label>Status</Form.Label>
              <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">Select One</option>
                <option value="Open">Open</option>
                <option value="Hold">Hold</option>
                <option value="In Progress">In Progress</option>
                <option value="Closed">Closed</option>
              </Form.Select>
            </Form.Group>
          </Row>

          <Form.Group controlId="formFile" className="mb-3">
            <Form.Label>Attachment</Form.Label>
            <Form.Control 
              type="file" 
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  // Validate file size (1MB = 1048576 bytes)
                  if (file.size > 1048576) {
                    alert('File size must be less than 1MB');
                    e.target.value = '';
                    setFileName("No file chosen");
                    setSelectedFile(null);
                    return;
                  }
                  
                  // Validate file type
                  const allowedTypes = ['application/pdf', 'image/png', 'image/jpg', 'image/jpeg'];
                  if (!allowedTypes.includes(file.type)) {
                    alert('Only PDF, PNG, JPG, and JPEG files are allowed');
                    e.target.value = '';
                    setFileName("No file chosen");
                    setSelectedFile(null);
                    return;
                  }
                  
                  setFileName(file.name);
                  setSelectedFile(file);
                } else {
                  setFileName("No file chosen");
                  setSelectedFile(null);
                }
              }}
            />
            {fileName !== "No file chosen" && (
              <small className="text-muted">Selected: {fileName}</small>
            )}
          </Form.Group>
        </Form>
      </Card.Body>
      {isCategoryPopupOpen && (
        <div ref={categoryPopupRef}>
          <CategoryDropdown onSelect={handleCategorySelect} onClose={() => setIsCategoryPopupOpen(false)} categoryDataset={categoryDataset} />
        </div>
      )}
      {isLocationPopupOpen && (
        <div ref={locationPopupRef}>
          <LocationDropdown onSelect={handleLocationSelect} onClose={() => setIsLocationPopupOpen(false)} locationDataset={locationDataset} />
        </div>
      )}
    </Card>
  );
});

export default UpdateStatus;