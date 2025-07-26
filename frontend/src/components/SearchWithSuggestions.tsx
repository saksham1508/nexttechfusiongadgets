import React, { useState, useEffect, useRef } from 'react';
import { Search, Clock, TrendingUp, X, ArrowUpRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface SearchSuggestion {
  id: string;
  text: string;
  type: 'product' | 'category' | 'brand' | 'recent';
  image?: string;
  price?: number;
}

interface SearchWithSuggestionsProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  className?: string;
}

const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  placeholder = "Search for tech products...",
  onSearch,
  className = ""
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [trendingSearches] = useState([
    'iPhone 15 Pro',
    'MacBook Air M2',
    'Samsung Galaxy S24',
    'AirPods Pro',
    'Gaming Laptop',
    'Wireless Earbuds'
  ]);

  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (query.length > 0) {
      const debounceTimer = setTimeout(() => {
        fetchSuggestions(query);
      }, 300);

      return () => clearTimeout(debounceTimer);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const fetchSuggestions = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      // Mock API call - replace with your actual search API
      const response = await axios.get(`/api/search/suggestions?q=${searchQuery}`);
      setSuggestions(response.data);
    } catch (error) {
      // Fallback to mock suggestions
      const mockSuggestions: SearchSuggestion[] = [
        {
          id: '1',
          text: `${searchQuery} Pro`,
          type: 'product',
          image: '/api/placeholder/40/40',
          price: 999
        },
        {
          id: '2',
          text: `${searchQuery} accessories`,
          type: 'category'
        },
        {
          id: '3',
          text: `Best ${searchQuery}`,
          type: 'category'
        }
      ];
      setSuggestions(mockSuggestions);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
    setRecentSearches(updatedRecent);
    localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

    // Close suggestions
    setIsOpen(false);
    setQuery('');

    // Execute search
    if (onSearch) {
      onSearch(searchQuery);
    } else {
      navigate(`/products?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'product') {
      navigate(`/product/${suggestion.id}`);
    } else {
      handleSearch(suggestion.text);
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent': return Clock;
      case 'product': return Search;
      default: return TrendingUp;
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400 group-focus-within:text-blue-500 transition-colors duration-300" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch(query);
            }
          }}
          placeholder={placeholder}
          className="input-search group-hover:shadow-md focus:shadow-lg"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute inset-y-0 right-0 pr-5 flex items-center hover-scale"
          >
            <div className="w-8 h-8 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-all duration-300">
              <X className="h-4 w-4 text-gray-500" />
            </div>
          </button>
        )}
        
        {/* Search Button */}
        <button
          onClick={() => handleSearch(query)}
          className="absolute inset-y-0 right-3 flex items-center"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-300 hover-scale">
            Search
          </div>
        </button>
      </div>

      {/* Suggestions Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-md border border-gray-100 rounded-2xl shadow-large z-50 max-h-96 overflow-y-auto scrollbar-modern animate-fade-in">
          {query.length === 0 ? (
            // Show recent and trending when no query
            <div className="p-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                      <Clock className="h-5 w-5 text-blue-500" />
                      <span>Recent Searches</span>
                    </h3>
                    <button
                      onClick={clearRecentSearches}
                      className="text-sm text-gray-500 hover:text-red-500 font-semibold transition-colors duration-300"
                    >
                      Clear All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {recentSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(search)}
                        className="w-full flex items-center space-x-4 p-3 hover:bg-blue-50 rounded-xl text-left transition-all duration-300 hover-lift group"
                      >
                        <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center transition-colors duration-300">
                          <Clock className="h-5 w-5 text-gray-500 group-hover:text-blue-500" />
                        </div>
                        <span className="text-gray-700 group-hover:text-gray-900 font-medium">{search}</span>
                        <ArrowUpRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 ml-auto opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Trending Searches */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Trending Searches</h3>
                <div className="space-y-1">
                  {trendingSearches.map((search, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearch(search)}
                      className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md text-left"
                    >
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-700">{search}</span>
                      <ArrowUpRight className="h-3 w-3 text-gray-400 ml-auto" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            // Show search suggestions
            <div className="p-2">
              {isLoading ? (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                </div>
              ) : suggestions.length > 0 ? (
                <div className="space-y-1">
                  {suggestions.map((suggestion) => {
                    const IconComponent = getSuggestionIcon(suggestion.type);
                    return (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="w-full flex items-center space-x-3 p-2 hover:bg-gray-50 rounded-md text-left"
                      >
                        {suggestion.image ? (
                          <img
                            src={suggestion.image}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                        ) : (
                          <IconComponent className="h-4 w-4 text-gray-400" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-900 truncate">
                            {suggestion.text}
                          </div>
                          {suggestion.price && (
                            <div className="text-xs text-gray-500">
                              ₹{suggestion.price.toLocaleString()}
                            </div>
                          )}
                        </div>
                        {suggestion.type === 'product' && (
                          <ArrowUpRight className="h-3 w-3 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-4 text-center text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No suggestions found</p>
                  <button
                    onClick={() => handleSearch(query)}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                  >
                    Search for "{query}"
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchWithSuggestions;