import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import './UserMyIncident.css';
import { getAssignedByMeRequest, clearError } from '../../../redux/incident/incidentSlice';

const UserMyIncident = () => {
    const dispatch = useDispatch();
    const { assignedByMe, loading, error } = useSelector((state) => state.incident);
    const [showDetails, setShowDetails] = useState({});
    
    // Get current user's service number (you might get this from auth state)
    const currentUserServiceNumber = 'SV002'; // Replace with actual user data

    useEffect(() => {
        dispatch(getAssignedByMeRequest({ informant: currentUserServiceNumber }));
        return () => {
            dispatch(clearError());
        };
    }, [dispatch, currentUserServiceNumber]);

    const handleViewDetails = (incidentNumber) => {
        setShowDetails(prev => ({
            ...prev,
            [incidentNumber]: !prev[incidentNumber]
        }));
    };

    if (loading) return (
        <div className="UserMyIncident-container">
            <div className="direction-bar">Incident {'>'} My Incidents</div>
            <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Loading your reported incidents...</p>
            </div>
        </div>
    );
    
    if (error) return (
        <div className="UserMyIncident-container">
            <div className="direction-bar">Incident {'>'} My Incidents</div>
            <div className="error-message">
                <h3>Error loading incidents</h3>
                <p>{error}</p>
                <button onClick={() => dispatch(getAssignedByMeRequest({ informant: currentUserServiceNumber }))}>
                    Retry
                </button>
            </div>
        </div>
    );

    return (
        <div className="UserMyIncident-container">
            <div className="direction-bar">
                Incident {'>'} My Incidents
            </div>
            <div className="incidents-content">
                <h2>My Reported Incidents</h2>
                {assignedByMe.length === 0 ? (
                    <div className="no-incidents">No incidents found</div>
                ) : (
                    <div className="incidents-table-container">
                        <table className="incidents-table">
                            <thead>
                                <tr>
                                    <th>Incident Number</th>
                                    <th>Category</th>
                                    <th>Location</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Handler</th>
                                    <th>Created On</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>                                {assignedByMe.map((incident) => (
                                    <React.Fragment key={incident.incident_number}>
                                        <tr>
                                            <td>{incident.incident_number}</td>
                                            <td>{incident.category}</td>
                                            <td>{incident.location}</td>
                                            <td>
                                                <span className={`status-badge status-${incident.status.toLowerCase().replace(' ', '-')}`}>
                                                    {incident.status}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`priority-badge priority-${incident.priority.toLowerCase()}`}>
                                                    {incident.priority}
                                                </span>
                                            </td>
                                            <td>{incident.handler || 'Unassigned'}</td>
                                            <td>{new Date(incident.update_on).toLocaleDateString()}</td>
                                            <td>
                                                <button 
                                                    className="view-btn"
                                                    onClick={() => handleViewDetails(incident.incident_number)}
                                                >
                                                    {showDetails[incident.incident_number] ? 'Hide' : 'View'}
                                                </button>
                                                <button className="update-btn">Update</button>
                                            </td>
                                        </tr>
                                        {showDetails[incident.incident_number] && (
                                            <tr className="incident-details-row">
                                                <td colSpan="8">
                                                    <div className="incident-details">
                                                        <div className="detail-section">
                                                            <h4>Description:</h4>
                                                            <p>{incident.description || 'No description provided'}</p>
                                                        </div>
                                                        <div className="detail-section">
                                                            <h4>Contact:</h4>
                                                            <p>Service No: {incident.informant}</p>
                                                            <p>Phone: {incident.telephone_number || 'Not provided'}</p>
                                                            <p>Email: {incident.email || 'Not provided'}</p>
                                                        </div>
                                                        <div className="detail-section">
                                                            <h4>Timeline:</h4>
                                                            <p>Created: {new Date(incident.create_on).toLocaleString()}</p>
                                                            <p>Last Updated: {new Date(incident.update_on).toLocaleString()}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserMyIncident;