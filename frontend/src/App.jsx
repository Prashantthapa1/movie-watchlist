import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import UserDashboard from './pages/user/UserDashboard';
import Layout from './layout/Layout';
import AdminDashboard from './pages/admin/dashboard/adminDashboard.jsx';
import MovieList from './components/movies/MovieList';
import { AuthProvider } from './services/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import './App.css';
import AllMovies from './pages/movies/AllMovies.jsx';
import Favorites from './pages/favorites/Favorites.jsx';
import Watched from './pages/watched/Watched.jsx';
import EmailVerification from './pages/auth/EmailVerification.jsx';
import ManageMovies from './pages/admin/ManageMovies.jsx';
import ManageUsers from './pages/admin/ManageUsers.jsx';

const App = () => {

  return (
    <AuthProvider>
      <Router>
          <Routes>
            {/* Public Routes - only accessible when NOT logged in */}
            <Route 
              path='/login' 
              element={
                <PublicRoute>
                  <Layout><Login /></Layout>
                </PublicRoute>
              } 
            />
            <Route 
              path='/register' 
              element={
                <PublicRoute>
                  <Layout><Register /></Layout>
                </PublicRoute>
              } 
            />
            <Route 
              path='/verify-email' 
              element={
                <PublicRoute>
                  <EmailVerification />
                </PublicRoute>
              } 
            />

            {/* Private Routes - only accessible when logged in */}
            
            {/* ✅ Home route - shows movies for everyone */}
            <Route 
              path='/' 
              element={
                <PrivateRoute>
                  <Layout><MovieList /></Layout>
                </PrivateRoute>
              } 
            />
            
            {/* ✅ Movies route */}
            <Route 
              path='/movies' 
              element={
                <PrivateRoute>
                  <Layout><AllMovies /></Layout>
                </PrivateRoute>
              } 
            />
            
            {/* ✅ User Dashboard - only for regular users */}
            <Route 
              path='/dashboard' 
              element={
                <PrivateRoute>
                  <Layout><UserDashboard /></Layout>
                </PrivateRoute>
              } 
            />

            <Route
              path='/favorites'
              element={
                <PrivateRoute>
                  <Layout><Favorites /></Layout>
                </PrivateRoute>
            
              }
            />

            <Route
              path='/watched'
              element={
                <PrivateRoute>
                  <Layout><Watched /></Layout>
                </PrivateRoute>
            
              }
            />
            
            {/* ✅ Admin Dashboard - only for admins */}
            <Route 
              path='/admin' 
              element={
                <PrivateRoute requireAdmin={true}>
                  <Layout><AdminDashboard /></Layout>
                </PrivateRoute>
              } 
            />
            <Route 
              path='/admin/dashboard' 
              element={
                <PrivateRoute requireAdmin={true}>
                  <Layout><AdminDashboard /></Layout>
                </PrivateRoute>
              } 
            />

            <Route
              path='/admin/manage-movies'
              element={
                <PrivateRoute requireAdmin={true}>
                  <Layout><ManageMovies /></Layout>
                </PrivateRoute>
              }
            />

            <Route
              path='/admin/manage-users'
              element={
                <PrivateRoute requireAdmin={true}>
                  <Layout><ManageUsers /></Layout>
                </PrivateRoute>
              }
            />

            {/* Catch all route - redirect to home */}
            <Route path='*' element={<Navigate to="/" replace />} />
          </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
