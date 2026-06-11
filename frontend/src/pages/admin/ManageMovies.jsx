import React, { useState } from 'react'
import { ManageMovieCard } from '../../shared/MovieCard';
import MovieService from '../../services/MovieService';

const ManageMovies = () => {

  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({

  });

  const fetchMovies = async ( params ={}, forceSearchTerm = null) => {
    setLoading(true);
    setError('');
    try{
      const currentSearchTerm = forceSearchTerm !== null ? searchTerm : '';

      if(currentSearchTerm) {
        const searchMovies = await MovieService.searchMovies(searchTerm);

        if(!searchMovies.success) {
          setError(`Error finding ${searchTerm} movie.`);
          return;
        }
        setMovies(searchMovies);
      } else {
        const allMovies = await MovieService.getMovies();
        
        if(!allMovies.success) {
          setError("Error fetching movies.");
        }

        setMovies(allMovies);
      }
    } catch(err) {

    }
  }


  return (
    <div>
      <h2 className='text-gray-700 font-semibold text-lg'>Mangae Movies</h2>
      <p className='text-gray-500 text-sm'>Add, edit and delete movies.</p>
      <table className='w-full'>
        <thead>
          <tr className="bg-gray-100">
            <th className="py-3 px-4 text-left">Poster</th>
            <th className="py-3 px-4 text-left">Movie</th>
            <th className="py-3 px-4 text-center">Year</th>
            <th className="py-3 px-4 text-left">Director</th>
            <th className="py-3 px-4 text-left">Genres</th>
            <th className="py-3 px-4 text-center">Rating</th>
            <th className="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {movies.map(movie => {
            <ManageMovieCard
              key={movie.movie_id}
              {...movie}
              onEdit={() => handleEdit(movie.id)}
              onDelete={() => handleDelete(movie.id)}
            />
          })}
        </tbody>
      </table>
    </div>
  )
}

export default ManageMovies;
