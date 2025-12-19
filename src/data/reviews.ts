export interface Review {
  id: number;
  nameES: string;
  nameEN: string;
  rating: number;
  textES: string;
  textEN: string;
  dateES: string;
  dateEN: string;
  theme: 'authentic' | 'family' | 'quality' | 'service' | 'custom';
}

export const reviews: Review[] = [
  {
    id: 1,
    nameES: 'Elise Harrison',
    nameEN: 'Elise Harrison',
    rating: 5,
    textES: 'Eli\'s Bakery hizo el pastel para nuestra boda y fue increíble!! Fue entregado a tiempo y se veía exactamente como lo imaginamos. El pastel estaba delicioso y nuestros invitados no paraban de hablar de lo bueno que estaba!',
    textEN: 'Eli\'s Bakery made the cake for our wedding and it was amazing!! It was delivered on time and looked exactly how we pictured. The cake was so delicious and our guests couldn\'t stop talking about how good it was!',
    dateES: 'Hace 2 meses',
    dateEN: '2 months ago',
    theme: 'custom',
  },
  {
    id: 2,
    nameES: 'Kevin L.',
    nameEN: 'Kevin L.',
    rating: 5,
    textES: '¡Qué agradable sorpresa! Hermoso y delicioso pastel de tres leches, digno de su reputación. La tienda huele a cielo y está llena hasta el borde de productos recién horneados.',
    textEN: 'What a pleasant surprise. Beautiful and delicious tres leches cake, worthy of their reputation. The store smells like heaven and is filled to the brim with freshly baked goods.',
    dateES: 'Hace 4 semanas',
    dateEN: '4 weeks ago',
    theme: 'quality',
  },
  {
    id: 3,
    nameES: 'Manpreet Kaur',
    nameEN: 'Manpreet Kaur',
    rating: 5,
    textES: 'Compramos el pastel de durazno y fresa recientemente, ¡y fue encantador! El pastel estaba suave, esponjoso e increíblemente sabroso.',
    textEN: 'We recently bought the peach and strawberry cake from this bakery, and it was delightful! The cake was soft, spongy, and incredibly tasty.',
    dateES: 'Hace 1 mes',
    dateEN: '1 month ago',
    theme: 'quality',
  },
  {
    id: 4,
    nameES: 'Jessie A.',
    nameEN: 'Jessie A.',
    rating: 5,
    textES: 'El mejor tres leches de PA. Sus pasteles personalizados son increíbles y muy asequibles. 10/10 en experiencia y calidad.',
    textEN: 'Best tres leches in PA. Their custom cakes are amazing and very affordable. 10/10 experience and quality.',
    dateES: 'Hace 10 meses',
    dateEN: '10 months ago',
    theme: 'custom',
  },
  {
    id: 5,
    nameES: 'Vanessa Louis',
    nameEN: 'Vanessa Louis',
    rating: 5,
    textES: 'Me recomendaron esta panadería como el mejor lugar para pastel de tres leches en la zona y no me decepcionó. ¡Conseguí una napolitana y estaba absolutamente deliciosa!',
    textEN: 'The bakery was recommended as the best place for tres leches cake in the area and it didn\'t disappoint. I got a neapolitan and it was absolutely delicious!',
    dateES: 'Hace 4 años',
    dateEN: '4 years ago',
    theme: 'authentic',
  },
  {
    id: 6,
    nameES: 'Kaushik Jagini',
    nameEN: 'Kaushik Jagini',
    rating: 5,
    textES: 'Fue mi primera vez aquí y los pasteles eran realmente deliciosos. Me gusta el hecho de que ofrecen una amplia variedad de opciones. ¡Espero volver a visitarlos!',
    textEN: 'It was my first time here and the cakes were really delicious. I like the fact that they offer wide variety of options. Looking forward to visit again!',
    dateES: 'Hace 2 años',
    dateEN: '2 years ago',
    theme: 'service',
  },
  {
    id: 7,
    nameES: 'Ranji Dandu',
    nameEN: 'Ranji Dandu',
    rating: 5,
    textES: '¡Los pasteles aquí son muy buenos y deliciosos! No tengo ningún problema con su comida.',
    textEN: 'The cakes here are very good and delicious. I have no problem with their food.',
    dateES: 'Hace 2 semanas',
    dateEN: '2 weeks ago',
    theme: 'quality',
  },
  {
    id: 8,
    nameES: 'Yasaswini P',
    nameEN: 'Yasaswini P',
    rating: 5,
    textES: '¡Una panadería increíble! Tienen galletas, pasteles, panes y mucho más recién horneados. ¡El lugar huele a una delicia deliciosa! Mi esposo compró un pastel para mi cumpleaños y estaba tan delicioso que a todos les encantó.',
    textEN: 'Such an amazing bakery. They have freshly baked cookies, cakes, breads, croissants and many more. The place itself smells like yummy treats! My Husband bought a cake for my birthday and it was so so delicious everyone loved it.',
    dateES: 'Hace 11 meses',
    dateEN: '11 months ago',
    theme: 'family',
  },
  {
    id: 9,
    nameES: 'Caramel Princess Conner',
    nameEN: 'Caramel Princess Conner',
    rating: 5,
    textES: '¡Este lugar es increíble! Gran servicio y selección. Estaba de visita desde fuera del estado.',
    textEN: 'This place is amazing. Great service and selection. I was visiting from out of State.',
    dateES: 'Hace 3 semanas',
    dateEN: '3 weeks ago',
    theme: 'service',
  },
  {
    id: 10,
    nameES: 'Karina Van Schaick',
    nameEN: 'Karina Van Schaick',
    rating: 5,
    textES: 'Uno de mis lugares favoritos de panadería. Tengo que conducir todo el camino desde Collegeville para conseguir las famosas conchas y pan casero.',
    textEN: 'One of my favorite bakery place , I have to drive all the way from Collegeville to get the famous conchas and homemade bread.',
    dateES: 'Hace 4 meses',
    dateEN: '4 months ago',
    theme: 'authentic',
  },
  {
    id: 11,
    nameES: 'Marshia Amin',
    nameEN: 'Marshia Amin',
    rating: 5,
    textES: '¡Su producto de panadería es increíble! ¡Pasteles alucinantes también! Pedí un pastel personalizado e hicieron exactamente lo mismo.',
    textEN: 'Their bakery item is awesome! Mindblowing cakes toooo! I ordered a customized cake and they made it exactly the same!',
    dateES: 'Hace 1 año',
    dateEN: '1 year ago',
    theme: 'custom',
  }
];

export const featuredReviews = reviews;

export const reviewsByTheme = {
  authentic: reviews.filter(r => r.theme === 'authentic'),
  family: reviews.filter(r => r.theme === 'family'),
  quality: reviews.filter(r => r.theme === 'quality'),
  service: reviews.filter(r => r.theme === 'service'),
  custom: reviews.filter(r => r.theme === 'custom'),
};
