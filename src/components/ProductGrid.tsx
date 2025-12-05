import ProductCard from './ProductCard';
import { Product } from '@/data/products';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products = [] }: ProductGridProps) {
  return (
    <section 
      className="product-grid"
      style={{ 
        paddingTop: '20px',
        paddingBottom: '30px'
      }}
    >
      {/* Container with more width for bigger cards */}
      <div 
        style={{
          maxWidth: '1300px',
          margin: '0 auto',
          paddingLeft: '15px',
          paddingRight: '15px'
        }}
      >
        {/* 
          Responsive Grid:
          - Desktop: 3 columns with 16px gap
          - Tablet (640px+): 2 columns
          - Mobile: 1 column
          - Row gap: 20px
        */}
        <div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          style={{
            columnGap: '16px',
            rowGap: '20px'
          }}
        >
          {products && products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {/* Empty State */}
        {(!products || products.length === 0) && (
          <div className="text-center py-12">
            <p style={{ color: '#777777', fontSize: '16px' }}>No products found.</p>
          </div>
        )}
      </div>
    </section>
  );
}

