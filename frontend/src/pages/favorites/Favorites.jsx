import React, { useEffect, useState } from 'react'
import FavoriteService from '../../services/FavoriteService';
import Button from '../../shared/Button';
import MovieCard from '../../shared/MovieCard';

const Favorites = () => {

    const [loading, setLoading] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [error, setError] = useState(null);

    const displayFavorites = async () => {
        try{
            setLoading(true);
            const favoriteMovies = await FavoriteService.getUserFavoritesMovies();

            if(favoriteMovies.success && favoriteMovies.data){
                setFavorites(favoriteMovies.data.movies);
            } else{
                setFavorites([]);
            }
        } catch(err){
            console.log("Error fetching favorites movies.", err);
            setLoading(false);
            setError(err.message || "Failed to fetch favorites.");
            setFavorites([]);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        displayFavorites();
    }, []);

    const handleRemoveFromFavorites = async (movieId) => {
        try{
            await FavoriteService.removeFromFavorites(movieId);

            displayFavorites();
            console.log("Successfully removed from favorites.");
        } catch(err){
            console.error("Error removing from favorites.", err);
        }
    };

    const handleViewDetails = (movieId) => {
        // TODO: Navigate to movie details
        console.log("View details:", movieId);
    };

    if( loading){
        return <div className='flex justify-center items-center h-64'>Loading...</div>
    }

    if(error){
        return (
            <div className='flex flex-col justify-center items-center h-64'>
                <div className='text-red-500 mb-4'>{error}</div>
                <Button onClick={displayFavorites}>Retry</Button>
            </div>
        )
    }

  return (
    <div className='container mx-auto px-4 py-8'>
        <h1 className='text-3xl font-bold mb-8'>Favorites Movies</h1>

        {favorites.length === 0 ? (
                <div className="text-center py-16">
                    <h2 className="text-xl text-gray-600 mb-4">No favorite movies yet</h2>
                    <p className="text-gray-500">Start adding movies to your favorites!</p>
                </div>
        ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                {favorites.map((favorite) => {
                    const getImageUrl = (posterUrl) => {
                        if (!posterUrl) return null;
                        if (posterUrl.startsWith('http')) return posterUrl;
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                        return `${baseUrl}${posterUrl}`;
                    };

                    const imageUrl = getImageUrl(favorite.poster_url);

                return (
                    <MovieCard
                        key={favorite.favorite_id}
                        context="favorites"
                        title={favorite.title}
                        year={favorite.year}
                        rating={favorite.rating}
                        imageSrc={imageUrl}
                        genres={favorite.genre_name}
                        director={favorite.director}
                        addedAt={favorite.created_at || favorite.added_at}
                        onRemove={() => handleRemoveFromFavorites(favorite.movie_id)}
                        onView={() => handleViewDetails(favorite.movie_id)}
                    />
                );
                })}
            </div>
        )}
    </div>
  );
}

export default Favorites;
