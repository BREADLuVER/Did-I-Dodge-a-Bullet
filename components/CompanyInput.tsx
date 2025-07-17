"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { Company, companyService, normalizeCompanyName } from '@/lib/companyUtils';
import { useDebounceAsync } from '@/lib/hooks';

interface CompanyInputProps {
  onCompanySelect: (company: Company | null) => void;
  onSkip: () => void;
  className?: string;
}

const CompanyInput = ({ onCompanySelect, onSkip, className = '' }: CompanyInputProps) => {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [error, setError] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search function that handles the actual API call
  const searchCompanies = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔍 Searching for:', query);
      const results = await companyService.searchCompanies(query, 6);
      
      // Deduplicate by normalizedName
      const uniqueMap = new Map<string, Company>();
      results.forEach(company => {
        const norm = normalizeCompanyName(company.name);
        if (!uniqueMap.has(norm)) {
          uniqueMap.set(norm, company);
        }
      });
      const uniqueResults = Array.from(uniqueMap.values());
      console.log('📋 Search results:', uniqueResults);
      setSuggestions(uniqueResults);
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search companies. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounced search using custom hook
  const debouncedSearch = useDebounceAsync(searchCompanies, 200);

  // Handle input changes with immediate feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    setSelectedIndex(-1);
    setShowSuggestions(true);
    
    // Clear suggestions immediately if input is too short
    if (value.length < 2) {
      setSuggestions([]);
      setIsLoading(false);
    } else {
      debouncedSearch(value);
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (company: Company) => {
    setInputValue(company.name);
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedIndex(-1);
    onCompanySelect(company);
  };

  // Handle manual company submission
  const handleSubmit = async () => {
    if (inputValue.trim()) {
              const company = await companyService.findOrCreateCompany(inputValue.trim());
      onCompanySelect(company);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        } else if (inputValue.trim()) {
          handleSubmit();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup on unmount - the custom hook handles its own cleanup
  useEffect(() => {
    return () => {
      // Custom hook handles cleanup automatically
    };
  }, []);

  return (
    <div className={`relative ${className}`}>
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Enter Company Name
          </h2>
          <p className="text-gray-600 mb-4">
            Get company-specific insights and compare your experience with others
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Select from suggestions or type your own company name
          </p>
        </div>

        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Start typing company name..."
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
            autoComplete="off"
            autoFocus
          />
          
          {isLoading && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {/* Dropdown positioned outside the input container */}
        {showSuggestions && (suggestions.length > 0 || isLoading) && (
          <div
            ref={suggestionsRef}
            className="relative z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg overflow-y-auto"
            style={{ maxHeight: '200px' }}
          >
            {isLoading && suggestions.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mx-auto mb-2"></div>
                Searching...
              </div>
            ) : (
              suggestions.map((company, index) => (
                <button
                  key={company.id}
                  onClick={() => handleSuggestionSelect(company)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-gray-900">{company.name}</div>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                      {company.industry && (
                        <span>{company.industry}</span>
                      )}
                    </div>
                    {company.submissionCount > 0 && (
                      <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                        {company.submissionCount} submission{company.submissionCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        )}

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSubmit}
            disabled={!inputValue.trim()}
            className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Use This Name
          </button>
          
          <button
            onClick={onSkip}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Skip for Anonymous
          </button>
        </div>

        {/* Benefits */}
        <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
          <h3 className="font-semibold mb-2">Why enter a company name?</h3>
          <ul className="space-y-1">
            <li>• Compare your experience with others at the same company</li>
            <li>• See common red flags patterns for this company</li>
            <li>• Help future candidates make informed decisions</li>
            <li>• Contribute to workplace transparency</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CompanyInput; 