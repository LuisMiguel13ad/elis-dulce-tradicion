import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import CustomCakeBanner from '@/components/home/CustomCakeBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import LocationSection from '@/components/home/LocationSection';
import TestimonialCarousel from '@/components/testimonials/TestimonialCarousel';
import NewsletterSignup from '@/components/newsletter/NewsletterSignup';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <CustomCakeBanner />
      <FeaturedProducts />
      <TestimonialCarousel />
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <NewsletterSignup />
          </div>
        </div>
      </section>
      <LocationSection />
      <Footer />
    </div>
  );
};

export default Index;
