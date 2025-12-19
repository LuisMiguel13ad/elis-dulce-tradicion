/**
 * SearchBar Component
 * Debounced search input with suggestions and recent searches
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { debounce } from 'lodash';
import { cn } from '@/lib/utils';

interface SearchSuggestion {
  id: string;
  type: 'order' | 'customer' | 'recent';
  label: string;
  subtitle?: string;
  value: string;
}

interface SearchBarProps {
  onSearch: (query: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  placeholder?: string;
  debounceMs?: number;
  showRecentSearches?: boolean;
  className?: string;
  initialValue?: string;
}

const RECENT_SEARCHES_KEY = 'recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const SearchBar = ({
  onSearch,
  onSuggestionSelect,
  placeholder,
  debounceMs = 300,
  showRecentSearches = true,
  className,
  initialValue = '',
}: SearchBarProps) => {
  const { t } = useLanguage();
  const [query, setQuery] = useState(initialValue);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (stored) {
        try {
          setRecentSearches(JSON.parse(stored));
        } catch (e) {
          console.error('Error parsing recent searches:', e);
        }
      }
    }
  }, [showRecentSearches]);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        onSearch(searchQuery);
        setIsSearching(false);

        // Save to recent searches
        if (showRecentSearches && searchQuery.trim().length > 0) {
          setRecentSearches((prev) => {
            const updated = [
              searchQuery.trim(),
              ...prev.filter((s) => s !== searchQuery.trim()),
            ].slice(0, MAX_RECENT_SEARCHES);
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      }
    }, debounceMs),
    [onSearch, debounceMs, showRecentSearches]
  );

  // Handle input change
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    if (value.trim().length > 0) {
      // Show suggestions based on query
      generateSuggestions(value);
      setShowSuggestions(true);
      debouncedSearch(value);
    } else {
      setShowSuggestions(false);
      setSuggestions([]);
      onSearch('');
    }
  };

  // Generate suggestions based on query
  const generateSuggestions = (searchQuery: string) => {
    const queryLower = searchQuery.toLowerCase();
    const newSuggestions: SearchSuggestion[] = [];

    // Add recent searches that match
    if (showRecentSearches) {
      recentSearches
        .filter((recent) => recent.toLowerCase().includes(queryLower))
        .forEach((recent) => {
          newSuggestions.push({
            id: `recent-${recent}`,
            type: 'recent',
            label: recent,
            value: recent,
          });
        });
    }

    // Add common search patterns
    if (queryLower.startsWith('ord-') || /^\d+/.test(queryLower)) {
      newSuggestions.push({
        id: 'order-pattern',
        type: 'order',
        label: t('Buscar por número de orden', 'Search by order number'),
        value: searchQuery,
      });
    }

    setSuggestions(newSuggestions);
  };

  // Handle suggestion select
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.value);
    setShowSuggestions(false);
    onSuggestionSelect?.(suggestion);
    onSearch(suggestion.value);
  };

  // Handle clear
  const handleClear = () => {
    setQuery('');
    setShowSuggestions(false);
    setSuggestions([]);
    onSearch('');
    inputRef.current?.focus();
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (query.trim().length > 0) {
          onSearch(query);
          setShowSuggestions(false);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim().length > 0 || recentSearches.length > 0) {
              setShowSuggestions(true);
            }
          }}
          placeholder={
            placeholder ||
            t('Buscar órdenes...', 'Search orders...')
          }
          className="pl-10 pr-10 min-h-[44px]"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {isSearching && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          {query.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClear}
              className="h-6 w-6"
              aria-label={t('Limpiar búsqueda', 'Clear search')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (suggestions.length > 0 || recentSearches.length > 0) && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <div className="max-h-60 overflow-auto p-1">
            {/* Recent Searches */}
            {showRecentSearches &&
              query.trim().length === 0 &&
              recentSearches.length > 0 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  {t('Búsquedas Recientes', 'Recent Searches')}
                </div>
              )}
            {showRecentSearches &&
              query.trim().length === 0 &&
              recentSearches.map((recent, index) => (
                <button
                  key={`recent-${index}`}
                  onClick={() => {
                    setQuery(recent);
                    onSearch(recent);
                    setShowSuggestions(false);
                  }}
                  className="w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                >
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 text-left">{recent}</span>
                </button>
              ))}

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <>
                {query.trim().length > 0 && (
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {t('Sugerencias', 'Suggestions')}
                  </div>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    key={suggestion.id}
                    onClick={() => handleSuggestionSelect(suggestion)}
                    className={cn(
                      'w-full flex items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-left transition-colors',
                      index === selectedIndex
                        ? 'bg-accent text-accent-foreground'
                        : 'hover:bg-accent hover:text-accent-foreground'
                    )}
                  >
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{suggestion.label}</div>
                      {suggestion.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </>
            )}

            {/* No results */}
            {query.trim().length > 0 &&
              suggestions.length === 0 &&
              !isSearching && (
                <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                  {t('No se encontraron sugerencias', 'No suggestions found')}
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};
