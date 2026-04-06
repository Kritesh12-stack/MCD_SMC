import { Routes, Route, useLocation } from 'react-router-dom'
import { useUser } from './contexts/UserContext'
import LoginPage from './pages/LoginPage'
import SideBar from './components/SideBar'
import DashboardPage from './pages/DashboardPage'
import ComplainListPage from './pages/ComplainListPage'
import RaiseComplaintPage from './pages/RaiseComplaintPage'

function Home() {
  const { user, login, logout } = useUser()

  return (
    <div className="text-xl bg-blue-500 p-4">
      <h1>Home Page</h1>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout} className="bg-red-500 text-white px-4 py-2 mt-2">
            Logout
          </button>
        </div>
      ) : (
        <button
          onClick={() => login({ name: 'John Doe' })}
          className="bg-green-500 text-white px-4 py-2 mt-2"
        >
          Login
        </button>
      )}
    </div>
  )
}

function About() {
  return <div className="text-xl bg-green-500">About Page</div>
}

export default function App() {
  const location = useLocation();
  const hideSidebar = location.pathname === "/login";

  return (
    <div className="min-h-screen">
      {!hideSidebar && <SideBar />}
      <div className={!hideSidebar ? "ml-64" : ""}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/complaints" element={<ComplainListPage />} />
          <Route path="/complaints/raise" element={<RaiseComplaintPage />} />
        </Routes>
      </div>
    </div>
  )
}
