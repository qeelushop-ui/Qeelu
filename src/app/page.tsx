'use client';

import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '@/components/Header';
import SearchBar from '@/components/SearchBar';
import CategoryNav from '@/components/CategoryNav';
import ProductGrid from '@/components/ProductGrid';
import Footer from '@/components/Footer';
import WhatsAppFab from '@/components/WhatsAppFab';
import { useProducts } from '@/context/ProductContext';
import { getProductTitle } from '@/utils/getProductText';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { i18n } = useTranslation();
  const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
  
  // Get only active products from context
  const { getActiveProducts } = useProducts();
  const activeProducts = getActiveProducts();

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    let filtered = activeProducts;

    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(product => product.category === activeCategory);
    }

    // Filter by search query (title)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(product => {
        const productTitle = getProductTitle(product, currentLang);
        return productTitle.toLowerCase().includes(query);
      });
    }

    return filtered;
  }, [activeCategory, searchQuery, activeProducts, currentLang]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#eeeeee' }}>
      {/* Header with Logo and Language Selector */}
      <Header />
      
      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} searchQuery={searchQuery} />
      
      {/* Category Navigation with Filter */}
      <CategoryNav 
        activeCategory={activeCategory} 
        onCategoryChange={handleCategoryChange} 
      />
      
      {/* Main Content - Product Grid */}
      <main className="flex-1">
        <ProductGrid products={filteredProducts} />
      </main>
      
      {/* Footer */}
      <Footer />
      
      {/* WhatsApp Floating Action Button */}
      <WhatsAppFab />
    </div>
  );
}
