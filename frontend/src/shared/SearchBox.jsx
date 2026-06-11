import { useState, useEffect } from 'react';
import Input from './Input';
import Button from './Button';

const SearchBox = ({ 
    id = "search", 
    placeholder = "Search movies...", 
    onSearch,
    initialValue = "",
    disabled = false,
    children = "Search"
}) => {
    const [searchValue, setSearchValue] = useState(initialValue);

    // Update internal state when initialValue prop changes
    useEffect(() => {
        setSearchValue(initialValue);
    }, [initialValue]);

    const handleInputChange = (e) => {
        setSearchValue(e.target.value);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (onSearch && searchValue.trim()) {
            onSearch(searchValue.trim());
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch(e);
        }
    };

    return (
        <form onSubmit={handleSearch} className="flex gap-3 p-3">
            <Input
                id={id}
                value={searchValue}
                type="text"
                placeholder={placeholder}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                disabled={disabled}
            />
            <Button 
                type="submit"
                
            >
                {children}
            </Button>
        </form>
    );
};

export default SearchBox;