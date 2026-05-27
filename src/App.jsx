import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/common.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LogIn from "./pages/LogIn/LogIn";
import AdminLayout from "./pages/Admin/Layout/AdminLayout";
import KPIHelpdesk from "./pages/Admin/KPIHelpdesk/KPIHelpdesk";
import LoggingTimeLine from "./pages/Admin/LoggingTimeLine/LoggingTimeLine";
import AdminUserList from "./pages/Admin/AdminUserList/AdminUserList";
import AdminUserDashBoard from "./pages/Admin/AdminUserDashBoard/AdminUserDashBoard";
import AdminAddIncident from "./pages/Admin/AdminAddIncident/AdminAddIncident";
import TechnicianLayout from "./pages/Technician/TechnicianLayout/TechnicianLayout.jsx";
import AdminViewIncident from "./pages/Admin/AdminViewIncident/AdminViewIncident.jsx";
import AdminCategory from "./pages/Admin/AdminCategory/AdminCategory.jsx";
import AdminLocation from "./pages/Admin/AdminLocation/AdminLocation.jsx";
import UserLayout from "./pages/User/Layout/UserLayout";
import UserAddIncident from "./pages/User/UserAddIncident/UserAddIncident";
import UserViewIncident from "./pages/User/UserViewIncident/UserViewIncident.jsx";
import AdminMyTeamIncidentViewAll from "./pages/Admin/AdminMyTeamIncidentViewAll/AdminMyTeamIncidentViewAll.jsx";
import AdminAllIncidents from "./pages/Admin/AdminAllIncidents/AdminAllIncidents.jsx";
import TechnicianInsident from "./pages/Technician/TechnicianIncident/TechnicianInsident.jsx";
import AdminMyAssignedIncidents from "./pages/Admin/AdminMyAssignedIncidents/AdminMyAssignedIncidents.jsx";
import UserMyAssignedIncidents from "./pages/User/UserMyAssignedIncidents/UserMyAssignedIncidents.jsx";
import UserMyTeamIncidentViewAll from "./pages/User/UserMyTeamIncidentViewAll/UserMyTeamIncidentViewAll.jsx";
import TechnicianAddIncident from "./pages/Technician/TechnicianAddIncident/TechnicianAddIncident.jsx";
import TechnicianAllTeam from "./pages/Technician/TechnicianAllTeam/TechnicianAllTeam.jsx";
import TechnicianMyAssignedIncidents from "./pages/Technician/TechnicianMyAssignedIncidents/TechnicianMyAssignedIncidents.jsx";
import AdminUpdateIncident from "./pages/Admin/AdminUpdateIncident/AdminUpdateIncident.jsx";
import UserUpdateIncident from "./pages/User/UserUpdateIncident/UserUpdateIncident.jsx";
import TechnicianReportedMyIncidents from "./pages/Technician/TechnicianReportedMyIncidents/TechnicianReportedMyIncidents.jsx";
import TechnicianMyReportedUpdate from "./pages/Technician/TechnicianMyReportedUpdate/TechnicianMyReportedUpdate.jsx";
import TechnicalOfficers from "./pages/Technician/TechnicalOfficers/TechnicalOfficers.jsx";
import MicrosoftCallback from "./pages/LogIn/MicrosoftCallback.jsx";
import PrivateRoute from "./components/PrivateRoute/PrivateRoute.jsx";
import SuperAdminReportedMyIncidents from "./pages/SuperAdmin/SuperAdminReportedMyIncidents/SuperAdminReportedMyIncidents.jsx";
import SuperAdminLayout from "./pages/SuperAdmin/Layout/SuperAdminLayout.jsx";
import ManageTeamAdmin from "./pages/SuperAdmin/ManageTeamAdmin/ManageTeamAdmin.jsx";
import SuperAdminAddIncident from "./pages/SuperAdmin/SuperAdminAddIncident/SuperAdminAddIncident.jsx";
import SocketProvider from "./components/SocketProvider/SocketProvider.jsx";
import SuperAdminAllIncident from "./pages/SuperAdmin/SuperAdminAllIncident/SuperAdminAllIncident.jsx";
import AdminReportedMyIncidents from "./pages/Admin/AdminReportedMyIncidents/AdminReportedMyIncidents.jsx";
import MainDashboard from "./pages/MainDashboard/MainDashboard.jsx";
import KPIReport from "./pages/Admin/KPIHelpdesk/KPIReport.jsx";
import SlaSettings from './pages/Admin/SlaSettings/SlaSettings.jsx';
import Roster from "./pages/Admin/Roster/Roster.jsx";



function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <Routes>
          {/* <Route path="/socket-test" element={<SocketTest />} /> Socket test route removed */}
          <Route path="/" element={<Navigate to="/LogIn" replace />} />
          <Route path="/LogIn" element={<LogIn />} />
          <Route path="/auth/callback" element={<MicrosoftCallback />} />

          {/* Admin routes with layout */}
          <Route element={<PrivateRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<MainDashboard />} />
              <Route path="AdminDashBoard" element={<MainDashboard />} />
              <Route path="kpi-helpdesk" element={<KPIHelpdesk />} />
              <Route path="LoggingTimeLine" element={<LoggingTimeLine />} />
              <Route path="sla-settings" element={<SlaSettings />} />
              <Route path="roster" element={<Roster />} />
              <Route path="AdminUserList" element={<AdminUserList />} />
              <Route
                path="AdminUserDashBoard"
                element={<AdminUserDashBoard />}
              />
              <Route path="AdminAddIncident" element={<AdminAddIncident />} />
              <Route path="AdminViewIncident" element={<AdminViewIncident />} />
              <Route
                path="AdminMyTeamIncidentViewAll"
                element={<AdminMyTeamIncidentViewAll />}
              />
              <Route path="AdminAllIncidents" element={<AdminAllIncidents />} />
              <Route
                path="AdminMyAssignedIncidents"
                element={<AdminMyAssignedIncidents />}
              />
              <Route
                path="/admin/AdminUpdateIncident"
                element={<AdminUpdateIncident />}
              />
              <Route
                path="AdminMyReportedIncidents"
                element={<AdminReportedMyIncidents />}
              />
            </Route>
          </Route>

          <Route element={<PrivateRoute />}>
            <Route path="/superAdmin" element={<SuperAdminLayout />}>
              <Route index element={<MainDashboard />} />
              <Route path="AdminDashBoard" element={<MainDashboard />} />
              <Route path="kpi-helpdesk" element={<KPIHelpdesk />} />
              <Route path="LoggingTimeLine" element={<LoggingTimeLine />} />
              <Route path="AdminUserList" element={<AdminUserList />} />
              <Route path="manageteamadmin" element={<ManageTeamAdmin />} />
              <Route path="SuperAdminCategory" element={<AdminCategory />} />
              <Route path="SuperAdminLocation" element={<AdminLocation />} />
              <Route
                path="SuperAdminAllIncidents"
                element={<SuperAdminAllIncident />}
              />
              <Route
                path="SuperAdminAddIncident"
                element={<SuperAdminAddIncident />}
              />
              <Route
                path="AdminMyTeamIncidentViewAll"
                element={<AdminMyTeamIncidentViewAll />}
              />
              <Route
                path="AdminMyAssignedIncidents"
                element={<AdminMyAssignedIncidents />}
              />
              <Route
                path="SuperAdminMyReportedIncidents"
                element={<SuperAdminReportedMyIncidents />}
              />
              <Route
                path="SuperAdminAddIncident"
                element={<SuperAdminAddIncident />}
              />
              <Route path="sla-settings" element={<SlaSettings />} />
              <Route path="roster" element={<Roster />} />
            </Route>
          </Route>

          {/* Technician routes with layout, protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/technician" element={<TechnicianLayout />}>
              <Route index element={<MainDashboard />} />
              <Route
                path="TechnicianIncident"
                element={<TechnicianInsident />}
              />
              <Route path="TechnicianAllTeam" element={<TechnicianAllTeam />} />
              <Route
                path="TechnicianDashBoard"
                element={<MainDashboard />}
              />{" "}
              <Route
                path="TechnicianAddIncident"
                element={<TechnicianAddIncident />}
              />
              <Route
                path="TechnicianMyAssignedInsidents"
                element={<TechnicianMyAssignedIncidents />}
              />
              <Route
                path="TechnicianReportedMyIncidents"
                element={<TechnicianReportedMyIncidents />}
              />
              <Route
                path="TechnicianMyReportedUpdate"
                element={<TechnicianMyReportedUpdate />}
              />
              <Route
                path="TeamLeaderUserList"
                element={<TechnicalOfficers />}
              />
              <Route path="TechnicalOfficers" element={<TechnicalOfficers />} />
            </Route>
          </Route>
          {/* User routes with layout, protected */}
          <Route element={<PrivateRoute />}>
            <Route path="/user" element={<UserLayout />}>
              <Route index element={<UserViewIncident />} />
              <Route path="UserViewIncident" element={<UserViewIncident />} />
              <Route path="UserAddIncident" element={<UserAddIncident />} />
              <Route
                path="UserMyAssignedIncidents"
                element={<UserMyAssignedIncidents />}
              />
              <Route
                path="UserMyTeamIncidentViewAll"
                element={<UserMyTeamIncidentViewAll />}
              />
              <Route
                path="/user/UserUpdateIncident"
                element={<UserUpdateIncident />}
              />
            </Route>
          </Route>
          <Route path="/kpi-report" element={<KPIReport />} />
          <Route path="/kpi-report-new" element={<KPIReport />} />
        </Routes>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
