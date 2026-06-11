import React from 'react';
import Modal from 'react-modal';
import './modal.css';

// Set the app element for accessibility
Modal.setAppElement('#root');

const CustomModal = ({ 
    isOpen, 
    onRequestClose, 
    title, 
    children, 
    width = "90%", 
    maxWidth = "600px",
    className = "",
    overlayClassName = ""
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            contentLabel={title || "Modal"}
            className={`modal-content ${className}`}
            overlayClassName={`modal-overlay ${overlayClassName}`}
            style={{
                content: {
                    top: '50%',
                    left: '50%',
                    right: 'auto',
                    bottom: 'auto',
                    marginRight: '-50%',
                    transform: 'translate(-50%, -50%)',
                    width: width,
                    maxWidth: maxWidth,
                    maxHeight: '80vh',
                    overflow: 'auto',
                    padding: '0',
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    backgroundColor: 'white',
                    zIndex: 10001,
                    position: 'relative'
                },
                overlay: {
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 10000,
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }
            }}
        >
            {/* Modal Header */}
            {title && (
                <div className="modal-header flex justify-between items-center p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                    <button
                        onClick={onRequestClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
            )}
            
            {/* Modal Body */}
            <div className="modal-body p-6">
                {children}
            </div>
        </Modal>
    );
};

// Specific Modal Components for different use cases
export const AddMovieModal = ({ isOpen, onRequestClose, onSubmit }) => {
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const formData = new FormData(e.target);
            const movieData = {
                title: formData.get('title'),
                year: parseInt(formData.get('year')),
                rating: parseFloat(formData.get('rating')) || 0,
                director: formData.get('director'),
                description: formData.get('description'),
                genre: formData.get('genre'),
                poster: formData.get('poster')
            };
            
            await onSubmit(movieData);
        } catch (error) {
            console.error('Error in form submission:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            title="Add New Movie"
            maxWidth="700px"
        >
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Movie Title *</label>
                    <input
                        type="text"
                        name="title"
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Enter movie title"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Year *</label>
                        <input
                            type="number"
                            name="year"
                            required
                            disabled={isSubmitting}
                            min="1900"
                            max="2030"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="2024"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <input
                            type="number"
                            name="rating"
                            step="0.1"
                            min="0"
                            max="10"
                            disabled={isSubmitting}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                            placeholder="8.5"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Director *</label>
                    <input
                        type="text"
                        name="director"
                        required
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Director name"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Genre</label>
                    <select
                        name="genre"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        <option value="">Select a genre</option>
                        <option value="1">Action</option>
                        <option value="2">Comedy</option>
                        <option value="3">Drama</option>
                        <option value="4">Horror</option>
                        <option value="5">Sci-Fi</option>
                        <option value="6">Romance</option>
                        <option value="7">Thriller</option>
                        <option value="8">Adventure</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                        name="description"
                        rows="3"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Movie description"
                    ></textarea>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Poster Image</label>
                    <input
                        type="file"
                        name="poster"
                        accept="image/*"
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onRequestClose}
                        disabled={isSubmitting}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>Adding...</span>
                            </>
                        ) : (
                            <span>Add Movie</span>
                        )}
                    </button>
                </div>
            </form>
        </CustomModal>
    );
};

export const ConfirmModal = ({ isOpen, onRequestClose, title, message, onConfirm, confirmText = "Confirm", cancelText = "Cancel" }) => {
    return (
        <CustomModal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            title={title}
            maxWidth="400px"
        >
            <div className="text-center">
                <p className="text-gray-600 mb-6">{message}</p>
                <div className="flex justify-center space-x-3">
                    <button
                        onClick={onRequestClose}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors duration-200"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </CustomModal>
    );
};

export default CustomModal;
