import { useLanguage } from '@/contexts/LanguageContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ReviewQuote from '@/components/about/ReviewQuote';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Heart, Award, Users, Cake, ArrowRight, Quote } from 'lucide-react';
import { featuredReviews } from '@/data/reviews';

const About = () => {
  const { t } = useLanguage();

  const values = [
    {
      icon: Heart,
      titleES: 'Hecho con Amor',
      titleEN: 'Made with Love',
      descES: 'Cada producto es elaborado con dedicación y pasión, siguiendo recetas familiares transmitidas por generaciones.',
      descEN: 'Every product is crafted with dedication and passion, following family recipes passed down through generations.',
    },
    {
      icon: Award,
      titleES: 'Sabores Auténticos',
      titleEN: 'Authentic Flavors',
      descES: 'Mantenemos la tradición mexicana viva con ingredientes frescos y técnicas tradicionales que capturan el verdadero sabor de casa.',
      descEN: 'We keep Mexican tradition alive with fresh ingredients and traditional techniques that capture the true taste of home.',
    },
    {
      icon: Users,
      titleES: 'Tradición Familiar',
      titleEN: 'Family Tradition',
      descES: 'Nuestras recetas han sido perfeccionadas a lo largo de los años, creando sabores que conectan con el corazón y el alma.',
      descEN: 'Our recipes have been perfected over the years, creating flavors that connect with the heart and soul.',
    },
    {
      icon: Cake,
      titleES: 'Servicio Personalizado',
      titleEN: 'Personalized Service',
      descES: 'Cada pastel cuenta una historia única. Trabajamos contigo para hacer realidad tu visión y crear momentos inolvidables.',
      descEN: 'Every cake tells a unique story. We work with you to bring your vision to life and create unforgettable moments.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="mb-6 font-display text-5xl font-bold text-gradient-gold md:text-6xl lg:text-7xl">
                {t('Nuestra Historia', 'Our Story')}
              </h1>
              <div className="mx-auto mb-8 h-1 w-32 rounded-full bg-gradient-to-r from-primary to-accent" />
              <p className="mx-auto max-w-2xl font-display text-2xl italic text-primary md:text-3xl">
                {t(
                  'Sabores que Celebran la Vida',
                  'Flavors that Celebrate Life'
                )}
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="relative bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="mb-12 text-center">
                <div className="mb-6 inline-flex items-center justify-center rounded-full bg-primary/10 p-4">
                  <Quote className="h-8 w-8 text-primary" />
                </div>
                <h2 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                  {t('Una Tradición de Excelencia', 'A Tradition of Excellence')}
                </h2>
              </div>

              <div className="space-y-8 text-center">
                <p className="mx-auto max-w-3xl font-sans text-lg leading-relaxed text-foreground md:text-xl">
                  {t(
                    'En Eli\'s Bakery Cafe, cada día comenzamos temprano con el mismo compromiso que ha guiado a nuestra familia por generaciones: crear productos que no solo alimenten el cuerpo, sino que nutran el alma. Nuestras recetas han sido transmitidas de abuela a madre, de madre a hija, cada una perfeccionada con amor y dedicación.',
                    'At Eli\'s Bakery Cafe, we start early each day with the same commitment that has guided our family for generations: creating products that not only nourish the body, but feed the soul. Our recipes have been passed down from grandmother to mother, from mother to daughter, each one perfected with love and dedication.'
                  )}
                </p>

                <p className="mx-auto max-w-3xl font-sans text-lg leading-relaxed text-muted-foreground md:text-xl">
                  {t(
                    'Lo que comenzó como un sueño familiar se ha convertido en un lugar donde la comunidad se reúne para celebrar los momentos más importantes de la vida. Desde pasteles de cumpleaños hasta bodas elegantes, desde pan dulce tradicional hasta postres especiales, cada producto lleva consigo la esencia de nuestra herencia mexicana y el compromiso con la calidad que nuestros clientes han llegado a esperar y amar.',
                    'What began as a family dream has become a place where the community gathers to celebrate life\'s most important moments. From birthday cakes to elegant weddings, from traditional sweet bread to specialty desserts, every product carries with it the essence of our Mexican heritage and the commitment to quality that our customers have come to expect and love.'
                  )}
                </p>

                <div className="mx-auto max-w-2xl rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/5 to-accent/5 p-8 shadow-elegant">
                  <p className="font-display text-2xl font-semibold italic text-primary md:text-3xl">
                  {t(
                    '"No solo hacemos pasteles, creamos recuerdos que duran toda la vida."',
                    '"We don\'t just make cakes, we create memories that last a lifetime."'
                  )}
                  </p>
                  <p className="mt-4 font-sans text-sm text-muted-foreground">
                    — {t('Eli y Familia', 'Eli & Family')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Customer Voices Section */}
        <section className="relative py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-6xl">
              <div className="mb-16 text-center">
                <h2 className="mb-4 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                  {t('Lo Que Dicen Nuestros Clientes', 'What Our Customers Say')}
                </h2>
                <div className="mx-auto h-1 w-24 rounded-full bg-gradient-to-r from-primary to-accent" />
                <p className="mx-auto mt-6 max-w-2xl font-sans text-lg text-muted-foreground">
                  {t(
                    'Descubre lo que nuestros clientes dicen sobre su experiencia en Eli\'s Bakery Cafe',
                    'Discover what our customers say about their experience at Eli\'s Bakery Cafe'
                  )}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {featuredReviews.map((review) => (
                  <ReviewQuote
                    key={review.id}
                    nameES={review.nameES}
                    nameEN={review.nameEN}
                    rating={review.rating}
                    textES={review.textES}
                    textEN={review.textEN}
                    dateES={review.dateES}
                    dateEN={review.dateEN}
                    theme={review.theme}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 via-accent/5 to-primary/10 p-12 text-center shadow-elegant md:p-16">
                <h2 className="mb-6 font-display text-4xl font-bold text-gradient-gold md:text-5xl">
                  {t('Únete a Nuestra Familia', 'Join Our Family')}
                </h2>
                <p className="mx-auto mb-8 max-w-2xl font-sans text-lg text-muted-foreground md:text-xl">
                  {t(
                    'Ven y experimenta la tradición, el sabor y el amor que ponemos en cada producto. Estamos aquí para hacer tus celebraciones inolvidables.',
                    'Come and experience the tradition, flavor, and love we put into every product. We\'re here to make your celebrations unforgettable.'
                  )}
                </p>
                <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                  <Button
                    asChild
                    size="lg"
                    className="group h-14 rounded-full bg-primary px-10 font-sans text-lg font-bold text-secondary shadow-glow transition-smooth hover:scale-105 hover:shadow-[0_0_45px_hsl(45_92%_63%/0.45)]"
                  >
                    <Link to="/order">
                      <Cake className="mr-2 h-5 w-5" />
                      {t('Ordenar Ahora', 'Order Now')}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="h-14 rounded-full border-2 border-primary px-10 font-sans text-lg font-bold text-primary transition-smooth hover:bg-primary hover:text-secondary"
                  >
                    <Link to="/menu">
                      {t('Ver Menú', 'View Menu')}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;
