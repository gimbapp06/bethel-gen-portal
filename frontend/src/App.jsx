import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'

// Pages
import LandingPage    from './pages/Landing/LandingPage'
import LoginPage      from './pages/Auth/LoginPage'
import ResetPassword  from './pages/Auth/ResetPassword'

// Client portal
import ClientLayout       from './pages/Client/ClientLayout'
import ClientHome         from './pages/Client/ClientHome'
import ClientApplications from './pages/Client/ClientApplications'
import ClientDocuments    from './pages/Client/ClientDocuments'
import ClientFaq          from './pages/Client/ClientFaq'

// Admin portal
import AdminLayout            from './pages/Admin/AdminLayout'
import AdminMessages          from './pages/Admin/AdminMessages'
import { AdminDashboard, AdminApplications, AdminApplicationDetail, AdminCalendar, AdminReports } from './pages/Admin/AdminPages'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}

// Wrapper to pass the type prop for claims route
function ClaimsPage() {
  return <AdminApplications type="claim" />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/"               element={<LandingPage />} />
          <Route path="/login"          element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Client portal */}
          <Route path="/client" element={<ProtectedRoute role="client"><ClientLayout /></ProtectedRoute>}>
            <Route index               element={<ClientHome />} />
            <Route path="applications" element={<ClientApplications />} />
            <Route path="documents"    element={<ClientDocuments />} />
            <Route path="faq"          element={<ClientFaq />} />
          </Route>

          {/* Admin portal */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index                   element={<AdminDashboard />} />
            <Route path="applications"     element={<AdminApplications />} />
            <Route path="applications/:id" element={<AdminApplicationDetail />} />
            <Route path="claims"           element={<ClaimsPage />} />
            <Route path="messages"         element={<AdminMessages />} />
            <Route path="calendar"         element={<AdminCalendar />} />
            <Route path="reports"          element={<AdminReports />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
