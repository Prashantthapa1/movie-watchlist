import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MovieCard from '../../shared/MovieCard';
import StatsCard from '../../shared/StatsCard';
import Button from '../../shared/Button';
import { useAuth } from '../../services/AuthContext';
import MovieService from '../../services/MovieService';
import FavoriteService from '../../services/FavoriteService';
import WatchedService from '../../services/WatchedService';

const UserDashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [stats, setStats] = useState([
    { count: 0, label: 'Movies Watched' },
    { count: 0, label: 'My Coins' },
    { count: 0, label: 'Favorites' },
  ]);
  const [recentMovies, setRecentMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Fetch real movies from backend
  const fetchRecentMovies = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await MovieService.getMovies({ limit: 4, offset: 0 });
      if (response.success) {
        setRecentMovies(response.data.movies);
      }
    } catch (err) {
      setError(err.message || 'Failed to load movies');
      console.error('Error fetching movies:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle movie actions
  const handleAddToFavorites = async (movieId) => {
    console.log('Add to favorites:', movieId);
    try {
      await FavoriteService.addMovieToFavorites({ movie_id: movieId });
      console.log('Successfully added to favorites');
      // Optionally show success message
    } catch(err) {
      console.error('Error adding to favorites:', err);
      // Optionally show error message
    }
  };

  const handleMarkAsWatched = async (movieId) => {
    console.log('Mark as watched:', movieId);
    try {
      await WatchedService.addToWatchedList({ movie_id: movieId });
      console.log('Successfully added to watched');
      // Optionally show success message
    } catch(err) {
      console.error('Error adding to watched:', err);
      // Optionally show error message
    }
  };

  const handleViewDetails = (movieId) => {
    console.log('View details:', movieId);
    // TODO: Navigate to movie details page
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRecentMovies();
    }
  }, [isAuthenticated]);

  // If not authenticated, this component shouldn't render
  if (!isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome, {user?.name}!</h1>
        <p className="text-gray-600 mb-6">Email: {user?.email}</p>
      </div>
      
      <section className="flex flex-wrap gap-4 justify-center mt-4 text-center px-4">
        {stats.map((stat, index) => (
          <StatsCard key={index} count={stat.count} label={stat.label} />
        ))}
      </section>
      
      <section className="mx-4 mt-8">
        <h2 className="font-semibold text-2xl mb-4">Recent Movies</h2>
        
        {loading && (
          <div className="text-center py-8">
            <div className="text-xl">Loading movies...</div>
          </div>
        )}
        
        {error && (
          <div className="text-center py-8">
            <div className="text-red-500 text-xl mb-4">Error: {error}</div>
            <button 
              onClick={fetchRecentMovies}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Try Again
            </button>
          </div>
        )}
        
        {!loading && !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-4">
              {recentMovies.map((movie) => (
                <MovieCard
                  key={movie.movie_id}
                  title={movie.title}
                  year={movie.year}
                  rating={movie.rating}
                  imageSrc={movie.poster_url}
                  genres={movie.genre_name}
                  director={movie.director}
                  onAddToFavorites={() => handleAddToFavorites(movie.movie_id)}
                  onMarkAsWatched={() => handleMarkAsWatched(movie.movie_id)}
                  onView={() => handleViewDetails(movie.movie_id)}
                />
              ))}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button className="bg-[#FF6666] px-4 py-3 rounded-md hover:shadow-lg hover:bg-[#F44336]">
                <Link to="/movies">View All Movies</Link>
              </Button>
            </div>
          </>
        )}
        
        {!loading && !error && recentMovies.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl">No movies found</div>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;