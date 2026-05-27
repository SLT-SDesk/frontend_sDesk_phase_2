import React, { useEffect, useState } from 'react';
import { Card, Table } from 'react-bootstrap';
import './AffectedUserDetail.css';
import apiClient from '../../api/axiosInstance';

const AffectedUserDetail = ({ formData, incident }) => {
    const [userData, setUserData] = useState({
        serviceNo: '',
        tpNumber: '',
        name: '',
        designation: '',
        email: '',
    });
    const [loading, setLoading] = useState(false);

    // Sync local state with incoming props
    useEffect(() => {
        const serviceNo = formData?.serviceNo || incident?.informant || '';
        const name = formData?.name || '';
        const tpNumber = formData?.tpNumber || formData?.tp_number || formData?.contactNumber || '';
        const designation = formData?.designation || '';
        const email = formData?.email || '';

        setUserData({
            serviceNo,
            tpNumber,
            name,
            designation,
            email,
        });
    }, [formData, incident]);

    // Fetch missing details from ERP if we have a service number but lack key information
    useEffect(() => {
        const serviceNo = userData.serviceNo?.trim();
        if (!serviceNo) return;

        // If we already have the name and email, we don't need to fetch from ERP
        if (userData.name && userData.email) {
            return;
        }

        let active = true;
        const fetchDetails = async () => {
            setLoading(true);
            try {
                const response = await apiClient.get(`/users/lookup/${serviceNo}`);
                if (active && response.data) {
                    const data = response.data;
                    setUserData(prev => ({
                        ...prev,
                        name: data.display_name || prev.name,
                        designation: data.designation || prev.designation,
                        email: data.email || prev.email,
                        tpNumber: data.contactNumber || prev.tpNumber,
                    }));
                }
            } catch (error) {
                console.error('Error fetching employee details in AffectedUserDetail:', error);
            } finally {
                if (active) setLoading(false);
            }
        };

        fetchDetails();

        return () => {
            active = false;
        };
    }, [userData.serviceNo, userData.name, userData.email]);

    return (
        <Card className="affected-user-card-modern shadow-sm mb-4">
            <Card.Header as="h5" className="bg-light text-dark d-flex justify-content-between align-items-center">
                <span>Affected User Details</span>
                {loading && <span className="spinner-border spinner-border-sm text-secondary" role="status"></span>}
            </Card.Header>
            <Card.Body>
                <div className="table-responsive">
                    <Table hover striped bordered className="affected-user-table-modern">
                        <thead className="table-light">
                            <tr>
                                <th>Service No</th>
                                <th>TP Number</th>
                                <th>Name</th>
                                <th>Designation</th>
                                <th>Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>{userData.serviceNo || '-'}</td>
                                <td>{userData.tpNumber || '-'}</td>
                                <td>{userData.name || '-'}</td>
                                <td>{userData.designation || '-'}</td>
                                <td>{userData.email || '-'}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
};

export default AffectedUserDetail;
