import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HeroSection from '@/components/home/HeroSection';
import AboutSection from '@/components/home/AboutSection';
import CustomCakeBanner from '@/components/home/CustomCakeBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CakeSection from '@/components/home/CakeSection';

import { VisitUs } from '@/components/home/VisitUs';
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
      <CakeSection />
      <TestimonialCarousel />
      <NewsletterSignup />
      <VisitUs />
      <Footer />
    </div>
  );
};

export default Index;
