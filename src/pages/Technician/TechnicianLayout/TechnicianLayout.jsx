import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SideBar from '../../../components/SideBar/sideBar';
import './TechnicianLayout.css';
import { useAppSelector, useAppDispatch } from '../../../redux/hooks';
import TopNotificationBar from '../../../components/topNotificatonBar/TopNotificationBar';
import { logoutRequest } from '../../../redux/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const TechnicianLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const user = useAppSelector(state => state.auth.user);
    const role = user?.role;
    const sidebarRole = user.position;
    const loading = useAppSelector(state => state.auth.loading);
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    useEffect(() => {
        if (user && role !== 'technician'){
            dispatch(logoutRequest());
            navigate('/login', { replace: true });

        }
    },[user, role, dispatch, navigate])

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!user) {
        return <div>User not found</div>;
    }
    return (
        <div className="Technician-layout-dashboard">
            <SideBar role={sidebarRole} isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
            {isSidebarOpen && <div className="overlay" onClick={closeSidebar}></div>}
            <div className="Technician-layout-dashboard-main">
                <TopNotificationBar user={user} notificationCount={10} toggleSidebar={toggleSidebar} />
                <Outlet />
            </div>
        </div>
    );
};

export default TechnicianLayout;