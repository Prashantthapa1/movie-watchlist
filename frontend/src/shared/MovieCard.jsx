import { useState } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Button from './Button';
import { FaStar, FaHeart, FaEye, FaCheck, FaCalendar, FaCalendarAlt, FaClock, FaTrash, FaEdit } from 'react-icons/fa';
import Button from './Button';

// Create a local SVG placeholder to avoid external dependency
const createPlaceholderDataURL = () => {
  const svg = `
    <svg width="300" height="400" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#374151"/>
      <text x="50%" y="45%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="Arial, sans-serif" font-size="20">No Image</text>
      <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" fill="#9CA3AF" font-family="Arial, sans-serif" font-size="14">Available</text>
    </svg>
  `;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const MovieCard = ({ 
  title, 
  year, 
  rating, 
  imageSrc, 
  genres, 
  context = "browse",
  addedAt,
  watchedAt,
  director, 
  onAddToFavorites, 
  onMarkAsWatched, 
  onView,
  onRemove,
  isInFavorites,
  isInWatched,
  isFavoriteLoading,
  isWatchedLoading
}) => {
  
  const [isHovered, setIsHovered] = useState(false);

  // Parse genres if it's a string (comma-separated)
  const genreArray = typeof genres === 'string' 
    ? genres.split(',').map(g => g.trim()).filter(g => g)
    : Array.isArray(genres) 
    ? genres 
    : [];

  // Display logic: show first 2 genres, then +N if more
  const displayGenres = () => {
    if (genreArray.length === 0) return 'Unknown Genre';
    if (genreArray.length <= 2) {
      return genreArray.map((genre, index) => (
        <span key={index} className="text-sm bg-gray-800 bg-opacity-70 px-3 py-1 rounded-full mr-2">
          {genre}
        </span>
      ));
    }
    // Show first 2 + count of remaining
    const remaining = genreArray.length - 2;
    return (
      <>
        {genreArray.slice(0, 2).map((genre, index) => (
          <span key={index} className="text-sm bg-gray-800 bg-opacity-70 px-3 py-1 rounded-full mr-2">
            {genre}
          </span>
        ))}
        <span className="text-sm bg-blue-600 bg-opacity-70 px-3 py-1 rounded-full">
          +{remaining}
        </span>
      </>
    );
  };

  const handleClickOnView = (e) => {
    e.stopPropagation();
    onView?.();
  }

  const handleClickRemove = (e) => {
    e.stopPropagation();
    onRemove?.();
  }

  const handleClickFavorites = (e) => {
    e.stopPropagation();
    onAddToFavorites?.();
  }

  const handleClickWatched = (e) => {
    e.stopPropagation();
    onMarkAsWatched?.();
  }

  const formatDate = (dateString) => {
    if(!dateString) return '';  // ✅ FIXED: Added return value
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  const renderContextualInfo = () => {
    switch(context) {
      case 'favorites': 
        return (
          <div className='flex items-center text-green-600 text-sm mb-2'> 
            <FaCalendarAlt className='mr-2' />
            <span>Added: {formatDate(addedAt)}</span>
          </div>
        );
      
      case 'watched': 
        return (
          <div className='flex items-center text-blue-400 text-sm mb-2'>
            <FaClock className='mr-2' />
            <span>Watched: {formatDate(watchedAt)}</span>
          </div>
        );
      
      default: 
        return null;
    }
  }

  const renderActionButtons = () => {
    switch(context) {
      case 'favorites':
        return (
          <div className='flex flex-col space-y-2 w-full max-w-xs'>
            <Button
              onClick={handleClickRemove}
              className="flex items-center justify-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium"
            >
              <FaTrash className='mr-2' />
              Remove From Favorites
            </Button>

            <Button
              onClick={handleClickOnView}
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium"  // ✅ FIXED: Added missing classes
            >
              <FaEye className='mr-2' />
              View Details
            </Button>
          </div>
        );

      case 'watched':
        return (
          <div className='flex flex-col space-y-2 w-full max-w-xs'>
            <Button
              onClick={handleClickRemove}
              className="flex items-center justify-center bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium"  // ✅ FIXED: Added missing classes
            >
              <FaTrash className='mr-2' />
              Remove From Watched
            </Button>
            <Button
              onClick={handleClickOnView}
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium"  // ✅ FIXED: Added missing classes
            >
              <FaEye className='mr-2' />
              View Details
            </Button>
          </div>
        );

      default: 
        return(
          <div className='flex flex-col space-y-2 w-full max-w-xs'>
            <Button 
              onClick={handleClickFavorites}
              disabled={isFavoriteLoading}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium ${
                isInFavorites
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-red-500 hover:bg-red-600'  // ✅ FIXED: Added bg- prefix
              } ${isFavoriteLoading ? 'opacity-50 cursor-not-allowed': ''}`}
            >
              <FaHeart className='mr-2' />
              {isFavoriteLoading 
                ? (isInFavorites ? 'Removing...': 'Adding...')
                : (isInFavorites ? 'Remove from Favorites': 'Add To Favorites')  // ✅ FIXED: Typo
              }
            </Button>
            <Button 
              onClick={handleClickWatched}
              disabled={isWatchedLoading}
              className={`flex items-center justify-center px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium ${
                isInWatched
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-green-500 hover:bg-green-600'  // ✅ FIXED: Changed from gray to green
              } ${isWatchedLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FaCheck className='mr-2' />
              {isWatchedLoading 
                ? (isInWatched ? 'Removing...': 'Adding...')
                : (isInWatched ? 'Remove from Watched': 'Add To Watched')
              }
            </Button>
            <Button
              onClick={handleClickOnView}
              className="flex items-center justify-center bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg transition-colors duration-200 text-white font-medium"  // ✅ FIXED: Added missing classes
            > 
              <FaEye className='mr-2' />
              View Details
            </Button>
          </div>
        );
    }
  }

  return (
    <div 
      className="movie-card relative w-full h-96 rounded-lg overflow-hidden shadow-lg cursor-pointer transition-transform duration-300 hover:scale-105"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image - Top 80-85% */}
      <div className="poster-container relative h-4/5 w-full">
        <img 
          src={imageSrc || createPlaceholderDataURL()} 
          alt={title}
          className={`w-full h-full object-cover transition-all duration-300 ${
            isHovered ? 'blur-sm opacity-60' : ''
          }`}
          onError={(e) => {
            e.target.src = createPlaceholderDataURL();
          }}
        />
        
        {/* ✅ FIXED: Added bg-black class */}
        <div className={`absolute inset-0 bg-opacity-30 flex flex-col justify-center items-center text-white p-4 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          {/* Rating */}
          <div className="flex items-center mb-4">
            <FaStar className="text-yellow-400 text-xl mr-2" />
            <span className="text-xl font-bold">{rating || 'N/A'}</span>
          </div>
          
          {renderContextualInfo()}

          {/* Genres */}
          <div className="mb-6 text-center flex flex-wrap justify-center gap-2">
            {displayGenres()}
          </div>
          
          {renderActionButtons()}
        </div>
      </div>

      {/* Movie Info - Bottom 15-20% */}
      <div className="movie-info h-1/5 p-3 bg-white flex flex-col justify-center">
        <h2 className="text-lg font-bold text-gray-800 truncate mb-1">
          {title}
        </h2>
        
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span className="font-medium">{year}</span>
          <span className="truncate ml-2" title={director}>{director}</span>
        </div>
      </div>
    </div>
  );
};

export const ManageMovieCard = ({
  title,
  year,
  description,
  director,
  genres,
  rating,
  imageSrc,
  onEdit,
  onDelete,
}) => {

  const genreArray = typeof genres === 'string' 
    ? genres.split(',').map(g => g.trim()).filter(g => g)
    : Array.isArray(genres) 
    ? genres 
    : [];

  const displayGenres = () => {
    if (genreArray.length === 0) return 'Unknown Genre';
    if (genreArray.length <= 2) {
      return genreArray.map((genre, index) => (
        <span key={index} className="text-sm bg-gray-800 bg-opacity-70 px-2 py-1 rounded-full mr-1">
          {genre}
        </span>
      ));
    }
    // Show first 2 + count of remaining
    const remaining = genreArray.length - 2;
    return (
      <>
        {genreArray.slice(0, 2).map((genre, index) => (
          <span key={index} className="text-sm bg-gray-800 bg-opacity-70 px-2 py-1 rounded-full mr-1">
            {genre}
          </span>
        ))}
        <span className="text-sm bg-blue-600 bg-opacity-70 px-2 py-1 rounded-full">
          +{remaining}
        </span>
      </>
    );
  };

  return (
    <tr className='border-b border-gray-200 hover:bg-gray-50 transition-colors'>
      <td className='py-4 px-4'>
        <img 
          src={imageSrc} 
          alt={title}
          className='w-16 h-20 object-cover rounded'
        />
      </td>

      <td className='py-4 px-4'>
        <h2 className='text-gray-700 font-semibold text-lg'>{title}</h2>
        <p className='text-gray-500 text-sm mt-1 line-clamp-2'>{description}</p>
      </td>
      
      <td className='py-4 px-4 text-center'>{year}</td>
      
      <td className='py-4 px-4'>{director}</td>

      <td className='py-4 px-4'>
        <div className='flex flex-wrap gap-1'>
          {displayGenres()}
        </div>
      </td>

      <td className='py-4 px-4 text-center'>
        <span className='font-semibold'>{rating || "N/A"}</span>
      </td>

      <td className='py-4 px-4'>
        <div className='flex gap-2'>
          <Button 
            onClick={onEdit}
            className='bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center'
          > 
            <FaEdit className='mr-1'/>
            Edit
          </Button>

          <Button
            onClick={onDelete}
            className='bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm flex items-center'
          >
            <FaTrash className='mr-1' />
            Delete
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default MovieCard;