'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchBarProps {
  onSearch: (query: string) => void;
  searchQuery: string;
}

export default function SearchBar({ onSearch, searchQuery }: SearchBarProps) {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  // Prevent hydration mismatch by only rendering language-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch(value);
  };

  const handleClear = () => {
    setInputValue('');
    onSearch('');
  };

  return (
    <div 
      style={{ 
        backgroundColor: '#eeeeee',
        paddingTop: '20px',
        paddingBottom: '10px'
      }}
    >
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        {/* Search bar centered */}
        <div 
          style={{
            position: 'relative',
            maxWidth: '400px',
            margin: '0 auto'
          }}
        >
          {/* Search Icon */}
          <svg
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '18px',
              height: '18px',
              color: '#999'
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>

          {/* Search Input */}
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder={mounted ? t('search.placeholder') : 'Search products...'}
            style={{
              width: '100%',
              padding: '10px 36px 10px 40px',
              fontSize: '15px',
              border: '1px solid #ddd',
              borderRadius: '6px',
              backgroundColor: '#ffffff',
              color: '#000000',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
            }}
            suppressHydrationWarning
          />

          {/* Clear Button */}
          {inputValue && (
            <button
              onClick={handleClear}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <svg
                style={{
                  width: '16px',
                  height: '16px',
                  color: '#999'
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
