import { useState, useEffect, useRef } from "react";
import MovieService from "../../services/MovieService";
import MovieCard from "../../shared/MovieCard";
import SearchBox from "../../shared/SearchBox";
import FavoriteService from "../../services/FavoriteService";
import WatchedService from "../../services/WatchedService";
import { useAuth } from "../../services/AuthContext"; // ✅ FIXED: Correct import path

const MovieList = ({ refreshKey }) => {

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0,
        limit: 12
    });

    const [userFavoriteIds, setUserFavoriteIds] = useState(new Set());
    const [userWatchedIds, setUserWatchedIds] = useState(new Set());
    const [favoriteLoading, setFavoriteLoading] = useState({});
    const [watchedLoading, setWatchedLoading] = useState({});

    const { user } = useAuth();
    const searchTermRef = useRef();

    // ✅ FIXED: Updated to handle both response structures
    const fetchUserLists = async() => {
        if(!user) return;

        try{
            const [favoritesResponse, watchedResponse] = await Promise.all([
                FavoriteService.getUserFavoritesMovies(),
                WatchedService.getUserWatchedMovies()
            ]);

            // ✅ FIXED: Handle both response structures
            if(favoritesResponse.success && favoritesResponse.data){
                const favoritesData = favoritesResponse.data.movies || favoritesResponse.data;
                const favoriteIds = new Set(
                    Array.isArray(favoritesData) ? favoritesData.map(fav => fav.movie_id) : []
                );
                setUserFavoriteIds(favoriteIds);
                console.log("Loaded favorites:", favoriteIds); // ✅ Debug log
            }

            if(watchedResponse.success && watchedResponse.data) {
                const watchedData = watchedResponse.data.movies || watchedResponse.data;
                const watchedIds = new Set(
                    Array.isArray(watchedData) ? watchedData.map(watched => watched.movie_id) : []
                );
                setUserWatchedIds(watchedIds);
                console.log("Loaded watched:", watchedIds); // ✅ Debug log
            }
        } catch(err) {
            console.error("Error fetching user lists:", err);
        }
    }

    const fetchMovies = async (params = {}, forceSearchTerm = null) => {
        setLoading(true);
        setError(null);

        try{
            const offset = params.offset !== undefined 
                ? params.offset 
                : (pagination.page - 1) * pagination.limit;

            let response;
            const currentSearchTerm = forceSearchTerm !== null ? forceSearchTerm : searchTerm;
            
            if (currentSearchTerm && currentSearchTerm.trim()) {
                response = await MovieService.searchMovies({
                    query: currentSearchTerm.trim(),
                    limit: pagination.limit,
                    offset,
                    ...params
                });
            } else {
                response = await MovieService.getMovies({
                    limit: pagination.limit,
                    offset,
                    ...params
                });
            }

            if(response.success){
                setMovies(response.data.movies);
                setPagination(prev => ({
                    ...prev, 
                    page: response.data.page,
                    totalPages: response.data.totalPages,
                    total: response.data.total
                }));
            }
        } catch (err) {
            if (err.status === 404 || err.message?.includes("No movies found")) {
                setMovies([]);
                setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }));
                setError(null);
            } else {
                setError(err.message || "Failed to load movies");
            }
        } finally{
            setLoading(false);
        }
    }

    const handlePageChange = ( newPage ) => {
        if(newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination(prev => ({...prev, page: newPage}));
            const offset = (newPage - 1) * pagination.limit;
            fetchMovies({ page: newPage, offset });
        }
    }

    const handleAddToFavorites = async (movieId) => {
        if(userFavoriteIds.has(movieId)){
            return handleRemoveFromFavorites(movieId);
        }

        setFavoriteLoading(prev => ({ ...prev, [movieId]: true }));

        console.log("Adding to favorites:", movieId);
        try{
         await FavoriteService.addMovieToFavorites({ movie_id: movieId });
         setUserFavoriteIds(prev => new Set([...prev, movieId]));
         console.log("Successfully added to favorites");
        } catch(err){
            console.error("Error adding to favorites:", err);
        } finally{
            setFavoriteLoading(prev => ({ ...prev, [movieId]: false }));
        }
    }

    const handleRemoveFromFavorites = async (movieId) => {
        setFavoriteLoading(prev => ({ ...prev, [movieId]: true }));

        try{

            await FavoriteService.removeFromFavorites(movieId);

            setUserFavoriteIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(movieId);
                return newSet;
            });
            console.log("Successfully removed from favorites");
        } catch(err){
            console.error("Error removing from favorites:", err);
        } finally{
            setFavoriteLoading(prev => ({ ...prev, [movieId]: false }));
        }
    }

    const handleMarkAsWatched = async (movieId) => {
        if(userWatchedIds.has(movieId)){
            return handleRemoveFromWatched(movieId);
        }

        setWatchedLoading(prev => ({ ...prev, [movieId]: true }));

        try{
            await WatchedService.addToWatchedList({ movie_id: movieId });
            setUserWatchedIds(prev => new Set([...prev, movieId]));
            console.log("Successfully added to watched");
        } catch(err){
            console.error("Error adding to watched:", err);
        } finally{
            setWatchedLoading(prev => ({ ...prev, [movieId]: false }));
        }
    };

    const handleRemoveFromWatched = async (movieId) => {
        setWatchedLoading(prev => ({ ...prev, [movieId]: true }));

        try{
   
            await WatchedService.removeFromWatched(movieId);

            setUserWatchedIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(movieId);
                return newSet;
            });
            console.log("Successfully removed from watched");
        } catch(err){
            console.error("Error removing from watched:", err);
        } finally{
            setWatchedLoading(prev => ({ ...prev, [movieId]: false }));
        }
    }

    const handleViewDetails = (movieId) => {
        console.log("View details for movie:", movieId);
    };

    const handleSearch = (searchValue) => {
        setSearchTerm(searchValue);
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchMovies({ page: 1, offset: 0 });
    };

    const handleClearSearch = () => {
        setSearchTerm("");
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchMovies({ page: 1, offset: 0 }, "");
    };

    const handleRetry = () => {
        setError(null);
        setSearchTerm("");
        setPagination(prev => ({ ...prev, page: 1 }));
        fetchMovies({ page: 1, offset: 0 });
    };

    useEffect(() => {
        fetchMovies();
        fetchUserLists(); 
    }, [refreshKey]);

    useEffect(() => {
        fetchUserLists();
    }, [user]);

    useEffect(() => {
        if (searchTerm !== "") {
            fetchMovies({ page: 1, offset: 0 });
        }
    }, [searchTerm]);

    if(loading && movies.length === 0){
        return (
            <div className="flex justify-center items-center min-h-screen"> 
                <div className="text-xl">Loading movies...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Movies</h1>
                    <p className="text-gray-600">
                        {error ? (
                            "There was an error loading movies"
                        ) : (
                            <>
                                Showing {movies?.length || 0} of {pagination.total} movies
                                {searchTerm && <span className="ml-2">for "{searchTerm}"</span>}
                            </>
                        )}
                    </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <SearchBox 
                        onSearch={handleSearch}
                        placeholder="Search movies by title, director, or genre..."
                        initialValue={searchTerm}
                    />
                    {searchTerm && (
                        <button
                            onClick={handleClearSearch}
                            className="text-sm text-blue-600 hover:text-blue-800 underline hover:cursor-pointer"
                        >
                            Clear search
                        </button>
                    )}
                </div>
            </div>

            {error && (
                <div className="flex flex-col justify-center items-center py-12">
                    <div className="text-red-500 text-xl mb-4">Error: {error}</div>
                    <button 
                        onClick={handleRetry}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded hover:cursor-pointer"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {!error && (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
                        {movies.map((movie, index) => {
                            // ✅ FIXED: Use correct base URL
                            const getImageUrl = (posterUrl) => {
                                if (!posterUrl) return null;
                                if (posterUrl.startsWith('http')) return posterUrl;
                                const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
                                return `${baseUrl}${posterUrl}`;
                            };

                            const imageUrl = getImageUrl(movie.poster_url);
                            const isInFavorites = userFavoriteIds.has(movie.movie_id);
                            const isInWatched = userWatchedIds.has(movie.movie_id);

                            return (
                                <MovieCard
                                    key={movie.movie_id || `movie-${index}`}
                                    title={movie.title}
                                    year={movie.year}
                                    rating={movie.rating}
                                    imageSrc={imageUrl}
                                    genres={movie.genre_name}
                                    director={movie.director}
                                    isInFavorites={isInFavorites}
                                    isInWatched={isInWatched}
                                    onAddToFavorites={() => handleAddToFavorites(movie.movie_id)}
                                    onMarkAsWatched={() => handleMarkAsWatched(movie.movie_id)}
                                    onView={() => handleViewDetails(movie.movie_id)}
                                    isFavoriteLoading={favoriteLoading[movie.movie_id]}
                                    isWatchedLoading={watchedLoading[movie.movie_id]}
                                />
                            );
                        })}
                    </div>

                    {pagination.totalPages > 1 && (
                        <div className="flex justify-center items-center space-x-4">
                            <button
                              onClick={() => handlePageChange(pagination.page - 1)}
                              disabled={pagination.page <= 1}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            <span className="text-gray-700">
                                Page {pagination.page} of {pagination.totalPages}
                            </span>

                            <button
                              onClick={() => handlePageChange(pagination.page + 1)}
                              disabled={pagination.page >= pagination.totalPages}
                              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    )}

                    {movies.length === 0 && !loading && !error && (
                        <div className="text-center py-12">
                            <div className="text-gray-500 text-xl">No movies found</div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default MovieList;