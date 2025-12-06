'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  BiSpa,
  BiChip,
  BiTime,
  BiPhone,
  BiDish,
  BiShoppingBag,
  BiBox,
  BiGridAlt
} from 'react-icons/bi';

interface CategoryNavProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

// Category icons mapping (same as admin sidebar)
const categoryIcons: Record<string, any> = {
  'all': BiGridAlt,
  'cosmetics': BiSpa,
  'electronics': BiChip,
  'watches': BiTime,
  'mobile': BiPhone,
  'kitchen': BiDish,
  'ladiesbag': BiShoppingBag,
  'other': BiBox,
};

const categoryIds = ['all', 'cosmetics', 'electronics', 'watches', 'mobile', 'kitchen', 'ladiesbag', 'other'];

export default function CategoryNav({ activeCategory, onCategoryChange }: CategoryNavProps) {
  const [mounted, setMounted] = useState(false);
  const { t } = useTranslation();

  // Prevent hydration mismatch by only rendering language-dependent content after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <nav 
      className="category-nav"
      style={{ 
        backgroundColor: '#eeeeee'
      }}
    >
      {/* Centered Container */}
      <div
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        <ul 
          className="category-list flex items-center justify-center overflow-x-auto scrollbar-hide"
          style={{
            paddingTop: '18px',
            paddingBottom: '18px'
          }}
        >
          {categoryIds.map((categoryId) => {
            const IconComponent = categoryIcons[categoryId];
            return (
              <li key={categoryId}>
                <button
                  onClick={() => onCategoryChange(categoryId)}
                  style={{
                    fontSize: '15px',
                    fontWeight: '400',
                    color: activeCategory === categoryId ? '#000000' : '#333333',
                    paddingLeft: '18px',
                    paddingRight: '18px',
                    paddingBottom: activeCategory === categoryId ? '3px' : '0',
                    borderBottom: activeCategory === categoryId ? '2px solid #000000' : 'none',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    backgroundColor: 'transparent',
                    border: 'none',
                    outline: 'none'
                  }}
                  className="hover:text-black"
                  suppressHydrationWarning
                >
                  {IconComponent && <IconComponent size={18} style={{ flexShrink: 0 }} />}
                  {mounted ? t(`categories.${categoryId}`) : categoryId === 'all' ? 'All' : categoryId}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </nav>
  );
}
