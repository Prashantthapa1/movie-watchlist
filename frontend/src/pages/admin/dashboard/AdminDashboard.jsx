import React from 'react';
import { useAuth } from '../../../services/AuthContext';
import MovieList from '../../../components/movies/MovieList';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-100 w-full">
      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600 mb-6">Welcome, {user?.name} — manage movies and users here.</p>
      </div>
      
      {/* Movie Management Section */}
      <div className="px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4 pl-8">All Movies</h2>
        <MovieList />
      </div>
    </div>
  );
};

export default AdminDashboard;
