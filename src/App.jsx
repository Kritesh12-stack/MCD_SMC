import { Navigate, Routes, Route, useLocation } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import LoginPage from './pages/LoginPage'
import SideBar from './components/SideBar'
import DashboardPage from './pages/DashboardPage'
import ComplainListPage from './pages/ComplainListPage'
import RaiseComplaintPage from './pages/RaiseComplaintPage'
import ComplainDetailPage from './pages/ComplainDetailPage'

function ProtectedRoute({ children }) {
  const { user } = useUser()
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user } = useUser()
  return user ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  const { user } = useUser()
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'

  return (
    <div className="min-h-screen">
      {!isLoginPage && user && <SideBar />}
      <div className={!isLoginPage && user ? 'ml-64' : ''}>
        <Routes>
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/complaints" element={<ProtectedRoute><ComplainListPage /></ProtectedRoute>} />
          <Route path="/complaints/raise" element={<ProtectedRoute><RaiseComplaintPage /></ProtectedRoute>} />
          <Route path="/complaint/:id" element={<ProtectedRoute><ComplainDetailPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
        </Routes>
      </div>
    </div>
  )
}
