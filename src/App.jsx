import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import StudentsManagement from './pages/StudentsManagement'
import SessionQR from './pages/SessionQR'
import StudentCheckin from './pages/StudentCheckin'
import CheckinSuccess from './pages/CheckinSuccess'
import Reports from './pages/Reports'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Student Check-in Routes */}
        <Route path="/checkin" element={<StudentCheckin />} />
        <Route path="/checkin/:sessionId" element={<StudentCheckin />} />
        <Route path="/checkin/success" element={<CheckinSuccess />} />

        {/* Admin Login */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* Protected Admin Dashboard Layout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<StudentsManagement />} />
          <Route path="session/new" element={<SessionQR />} />
          <Route path="session/:id" element={<SessionQR />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Root Redirect to Admin Dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
