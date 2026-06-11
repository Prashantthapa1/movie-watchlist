import { useState } from 'react'
import MovieList from '../../components/movies/MovieList';
import Button from '../../shared/Button';
import { AddMovieModal } from '../../shared/Modal';
import { useAuth } from '../../services/AuthContext';
import api from '../../services/api';

const AllMovies = () => {

  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // For triggering MovieList refresh

  const { user } = useAuth();

  const isAdmin = user?.role === 'admin';

  // Function to open the modal
  const handleOpenModal = () => {
    setIsOpen(true);
  };

  // Function to close the modal
  const handleCloseModal = () => {
    setIsOpen(false);
  };

  // Function to refresh the movie list
  const refreshMovieList = () => {
    setRefreshKey(prev => prev + 1);
  };

  // Function to handle movie submission
  const handleAddMovie = async (movieData) => {

    if(user?.role !== 'Admin'){
      alert("Unathorized: Only administrators can add movie.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Create FormData for file upload (poster image)
      const formData = new FormData();
      formData.append('title', movieData.title);
      formData.append('year', movieData.year.toString());
      formData.append('director', movieData.director);
      formData.append('description', movieData.description || '');
      formData.append('rating', movieData.rating ? movieData.rating.toString() : '0');
      
      // Handle genre - convert to single genre_id (not array)
      if (movieData.genre) {
        formData.append('genre_id', movieData.genre.toString());
      }
      
      // Handle poster file upload
      if (movieData.poster && movieData.poster instanceof File) {
        formData.append('poster', movieData.poster);
      }

      // Send request to backend - use correct endpoint
      const response = await api.post('/movies/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // Close modal
      handleCloseModal();
      
      // Refresh movie list
      refreshMovieList();
      
      // Show success message
      alert('Movie added successfully!');
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to add movie. Please try again.';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="px-6">
        <div className="flex justify-between items-center my-6">
          <h2 className="text-2xl font-bold text-gray-800 pl-8">All Movies</h2>
          
          { isAdmin && (
            <Button onClick={handleOpenModal}>Add New Movie</Button> 
          )}
        </div>
        
        <MovieList key={refreshKey} />
        
        {/* Add Movie Modal */}
        <AddMovieModal
          isOpen={isOpen}
          onRequestClose={handleCloseModal}
          onSubmit={handleAddMovie}
        />
        
        {/* Loading overlay while submitting */}
        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{ zIndex: 9999 }}>
            <div className="bg-white p-6 rounded-lg shadow-xl">
              <div className="flex items-center space-x-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                <span className="text-gray-700">Adding movie...</span>
              </div>
            </div>
          </div>
        )}
      </div>
  )
}

export default AllMovies
