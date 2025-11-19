import React from 'react';
import { Card, Table } from 'react-bootstrap';
import './AffectedUserDetail.css';

const AffectedUserDetail = ({ formData }) => {
    return (
        <Card className="affected-user-card-modern shadow-sm mb-4">
            <Card.Header as="h5" className="bg-light text-dark">
                Affected User Details
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
                                <td>{formData.serviceNo}</td>
                                <td>{formData.tpNumber}</td>
                                <td>{formData.name}</td>
                                <td>{formData.designation}</td>
                                <td>{formData.email}</td>
                            </tr>
                        </tbody>
                    </Table>
                </div>
            </Card.Body>
        </Card>
    );
};

export default AffectedUserDetail;
