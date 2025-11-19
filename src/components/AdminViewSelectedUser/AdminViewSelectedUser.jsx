import React from 'react';
import './AdminViewSelectedUser.css';
import { IoIosClose } from 'react-icons/io';
import { sDesk_t2_category_dataset } from '../../data/sDesk_t2_category_dataset';

const AdminViewSelectedUser = ({ user, userStatus, onClose }) => {
    const parent = sDesk_t2_category_dataset.find(
        p => p.parent_category_number === user.parent_category_number
    );
    const categories = user.child_category_number.map(id => {
        const parentCategory = sDesk_t2_category_dataset.find(p => 
            p.subcategories.some(sub => sub.child_category_number === id)
        );
        if (parentCategory) {
            const subcategory = parentCategory.subcategories.find(
                sub => sub.child_category_number === id
            );
            return subcategory.child_category_name;
        }        
        return 'Unknown';
    });

    return (
        <div className="AdminViewSelectedUser-modal">
            <div className="AdminViewSelectedUser-content">
                <div className="AdminViewSelectedUser-header">
                    <h2>User Details</h2>
                    <button onClick={onClose}>
                        <IoIosClose size={30} />
                    </button>
                </div>

                <div className="AdminViewSelectedUser-grid">
                    <div className="AdminViewSelectedUser-section">
                        <div className="AdminViewSelectedUser-field">
                            <label>Service Number:</label>
                            <span>{user.service_number}</span>
                        </div>
                        <div className="AdminViewSelectedUser-field">
                            <label>Full Name:</label>
                            <span>{user.user_name}</span>
                        </div>
                        <div className="AdminViewSelectedUser-field">
                            <label>Team:</label>
                            <span>{parent?.parent_category_name || 'Unknown'}</span>
                        </div>
                        <div className="AdminViewSelectedUser-field">
                            <label>Categories:</label>
                            <span>
                                {categories.length > 0 ? categories.join(', ') : 'None'}</span>
                        </div>
                        <div className="AdminViewSelectedUser-field">
                            <label>Tier:</label>
                            <span>{user.tier}</span>
                        </div>
                        <div className="AdminViewSelectedUser-field">
                            <label>Role:</label>
                            <span>{user.role}</span>
                        </div>
                    </div>

                    <div className="AdminViewSelectedUser-section">
                        <div className="AdminViewSelectedUser-field">
                            <label>Online:</label>
                            <span>{userStatus?.online ? "Yes" : "No"}</span>
                        </div>
                        <div className="AdminViewSelectedUser-field">
                            <label>Active:</label>
                            <span>{userStatus?.Active ? "Yes" : "No"}</span>
                        </div>
                        <div className="AdminViewSelectedUser-field">
                            <label>Response Ready:</label>
                            <span>{userStatus?.responce_ready ? "Yes" : "No"}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminViewSelectedUser;
