import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'About Us - Mega Deals Oman',
  description: 'Learn about Mega Deals Oman - Your trusted source for genuine products with great deals.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main style={{ minHeight: '60vh', backgroundColor: '#f5f5f5' }}>
        <div 
          style={{ 
            maxWidth: '900px', 
            margin: '0 auto', 
            padding: '50px 20px' 
          }}
        >
          {/* Page Title */}
          <h1 
            style={{ 
              fontSize: '32px', 
              fontWeight: '700', 
              color: '#222', 
              marginBottom: '30px',
              textAlign: 'center'
            }}
          >
            About Us
          </h1>
          
          {/* Content Card */}
          <div 
            style={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              padding: '40px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
          >
            <p 
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.9', 
                color: '#444',
                marginBottom: '20px'
              }}
            >
              Finding the bargain of a lifetime while shopping online is quite commonplace with whole sellers and 3rd party retailers selling products without any assurance of source or authenticity.
            </p>
            
            <p 
              style={{ 
                fontSize: '16px', 
                lineHeight: '1.9', 
                color: '#444'
              }}
            >
              <strong style={{ color: '#2196F3' }}>SmartDeals.com.pk</strong> brings the value of outlet shopping to the convenience of e-commerce, while ensuring that every product you purchase is genuine and directly from sellers that manufacture them.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

