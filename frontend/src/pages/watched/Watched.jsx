import React, { useEffect, useState } from 'react'
import WatchedService from '../../services/WatchedService';
import Button from '../../shared/Button';
import MovieCard from '../../shared/MovieCard';

const Watched = () => {

    const [loading, setLoading] = useState(false);
    const [watched, setWatched] = useState([]);
    const [error, setError] = useState(null);

    const displayWatched = async () => {
        try{
            setLoading(true);
            setError(null);
            
            const watchedMovies = await WatchedService.getUserWatchedMovies();

            if(watchedMovies.success && watchedMovies.data){
                setWatched(watchedMovies.data.movies);
            } else{
                setWatched([]);
            }
        } catch(err){
            console.log("Error fetching watched movies.", err);
            setError(err.message || "Failed to fetch watched movies.");
            setWatched([]);
        } finally{
            setLoading(false);
        }
    }

    useEffect(() => {
        displayWatched();
    }, []);

    const handleRemoveFromWatched = async (movieId) => {
        try{
            await WatchedService.removeFromWatched(movieId);

            displayWatched();
            console.log("Successfully removed from watched.");
        } catch(err) {
            console.error("Error fetching watched", err);
        }
    };

    const handleViewDetails = (movieId) => {
        // TODO: Navigate to movie details
        console.log("View details:", movieId);
    };

    if(loading){
        return <div className='flex justify-center items-center h-64'>Loading...</div>
    }

    if(error){
        return (
            <div className='flex flex-col justify-center items-center h-64'>
                <div className='text-red-500 mb-4'>Error: {error}</div>
                <Button onClick={displayWatched} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <div className='container mx-auto px-4 py-8'>
            <h1 className='text-3xl font-bold mb-8'>My Watched Movies</h1>

            {watched.length === 0 ? (
                <div className="text-center py-16">
                    <h2 className="text-xl text-gray-600 mb-4">No watched movies yet</h2>
                    <p className="text-gray-500">Start marking movies as watched!</p>
                </div>
            ) : (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'>
                    {watched.map((watchedMovie) => {
                    const getImageUrl = (posterUrl) => {
                        if (!posterUrl) return null;
                        if (posterUrl.startsWith('http')) return posterUrl;
                        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                        return `${baseUrl}${posterUrl}`;
                    };

                    const imageUrl = getImageUrl(watchedMovie.poster_url);

                        return (
                            <MovieCard
                                key={watchedMovie.watch_id}
                                context="watched"
                                title={watchedMovie.title}
                                year={watchedMovie.year}
                                rating={watchedMovie.rating}
                                imageSrc={imageUrl}
                                genres={watchedMovie.genre_name}
                                director={watchedMovie.director}
                                watchedAt={watchedMovie.watched_at}
                                onRemove={() => handleRemoveFromWatched(watchedMovie.movie_id)}
                                onView={() => handleViewDetails(watchedMovie.movie_id)}
                            />
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Watched;