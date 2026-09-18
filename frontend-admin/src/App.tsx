import AuthProvider from './context/AuthProvider'
import Login from './pages/Login'
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom'
import ProtectedRoutes from './components/ProtectedRoutes'
import Admin from './pages/Admin'
import Layout from './components/Layout'

function App () {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path='/' element={<Layout />}>
            <Route path='' element={<Login />} />
            {/* Routes protégées */}
            <Route element={<ProtectedRoutes />}>
              <Route path='admin' element={<Admin />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App
