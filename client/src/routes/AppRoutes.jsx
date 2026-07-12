import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";
import ProtectedRoute from "../components/ProtectedRoute";

import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

import DashboardPage from "../pages/DashboardPage";
import OrganizationSetupPage from "../pages/OrganizationSetupPage";
import AssetsPage from "../pages/AssetsPage";
import AllocationPage from "../pages/AllocationPage";
import BookingPage from "../pages/BookingPage";
import MaintenancePage from "../pages/MaintenancePage";
import AuditPage from "../pages/AuditPage";
import ReportsPage from "../pages/ReportsPage";
import NotificationsPage from "../pages/NotificationsPage";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />

                <Route
                    element={
                        <ProtectedRoute>
                            <DashboardLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/dashboard" element={<DashboardPage />} />
                    <Route path="/organization-setup" element={<OrganizationSetupPage />} />
                    <Route path="/assets" element={<AssetsPage />} />
                    <Route path="/allocation" element={<AllocationPage />} />
                    <Route path="/booking" element={<BookingPage />} />
                    <Route path="/maintenance" element={<MaintenancePage />} />
                    <Route path="/audit" element={<AuditPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                </Route>

                <Route path="*" element={<Navigate to="/login" replace />} />

            </Routes>
        </BrowserRouter>
    );
}