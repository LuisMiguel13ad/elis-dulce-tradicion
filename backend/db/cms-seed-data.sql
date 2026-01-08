-- Seed Data for Business Configuration and CMS

-- Insert default business settings
INSERT INTO business_settings (
    business_name,
    business_name_es,
    tagline,
    tagline_es,
    address_street,
    address_city,
    address_state,
    address_zip,
    phone,
    email,
    minimum_lead_time_hours,
    maximum_advance_days,
    service_area_type,
    service_radius_miles,
    about_us_content,
    about_us_content_es
) VALUES (
    'Eli''s Dulce Tradición',
    'Eli''s Dulce Tradición',
    'Flavors that Celebrate Life',
    'Sabores que Celebran la Vida',
    '846 Street Rd.',
    'Bensalem',
    'PA',
    '19020',
    '610-910-9067',
    'info@elisdulcetradicion.com',
    24,
    90,
    'radius',
    10,
    'At Eli''s Bakery Cafe, we start early each day with the same commitment that has guided our family for generations: creating products that not only nourish the body, but feed the soul. Our recipes have been passed down from grandmother to mother, from mother to daughter, each one perfected with love and dedication.',
    'En Eli''s Bakery Cafe, cada día comenzamos temprano con el mismo compromiso que ha guiado a nuestra familia por generaciones: crear productos que no solo alimenten el cuerpo, sino que nutran el alma. Nuestras recetas han sido transmitidas de abuela a madre, de madre a hija, cada una perfeccionada con amor y dedicación.'
) ON CONFLICT (id) DO NOTHING;

-- Insert default business hours (Monday-Sunday, 9 AM - 8 PM)
INSERT INTO business_hours (day_of_week, is_open, open_time, close_time, is_closed) VALUES
    (0, true, '09:00', '20:00', false), -- Sunday
    (1, true, '09:00', '20:00', false), -- Monday
    (2, true, '09:00', '20:00', false), -- Tuesday
    (3, true, '09:00', '20:00', false), -- Wednesday
    (4, true, '09:00', '20:00', false), -- Thursday
    (5, true, '09:00', '20:00', false), -- Friday
    (6, true, '09:00', '20:00', false)  -- Saturday
ON CONFLICT (day_of_week) DO NOTHING;

-- Insert sample social media links
INSERT INTO social_media_links (platform, url, is_active, display_order) VALUES
    ('facebook', 'https://facebook.com/elisdulcetradicion', true, 1),
    ('instagram', 'https://instagram.com/elisdulcetradicion', true, 2),
    ('whatsapp', 'https://wa.me/16109109067', true, 3)
ON CONFLICT (platform) DO NOTHING;

-- Insert default FAQs
INSERT INTO faqs (question_en, question_es, answer_en, answer_es, display_order, is_active) VALUES
    ('How much advance notice do I need to order a cake?', 
     '¿Cuánto tiempo de anticipación necesito para ordenar un pastel?',
     'We recommend ordering at least 24 hours in advance to ensure availability. For more elaborate cakes or large orders, we suggest 48-72 hours notice.',
     'Recomendamos ordenar con al menos 24 horas de anticipación para asegurar disponibilidad. Para pasteles más elaborados o grandes pedidos, sugerimos 48-72 horas de anticipación.',
     1, true),
    ('What are the prices for cakes?',
     '¿Cuáles son los precios de los pasteles?',
     'Prices vary depending on size and design complexity. Small cakes (8") start from $40, while larger cakes can cost up to $200 or more. Contact us for an accurate quote.',
     'Los precios varían según el tamaño y la complejidad del diseño. Los pasteles pequeños (8") comienzan desde $40, mientras que los más grandes pueden costar hasta $200 o más. Contáctenos para una cotización precisa.',
     2, true),
    ('Do you offer delivery?',
     '¿Ofrecen entrega a domicilio?',
     'Yes, we offer delivery for an additional fee of $15. You can also pick up your order at our location at no additional cost.',
     'Sí, ofrecemos entrega a domicilio por una tarifa adicional de $15. También puede recoger su pedido en nuestra ubicación sin costo adicional.',
     3, true),
    ('Can I fully customize my cake?',
     '¿Puedo personalizar completamente mi pastel?',
     'Absolutely! We offer full customization including size, flavor, filling, theme, and dedication text. You can send us a reference photo via WhatsApp at 610-910-9067.',
     '¡Absolutamente! Ofrecemos personalización completa incluyendo tamaño, sabor, relleno, tema y dedicatoria. Puede enviarnos una foto de referencia por WhatsApp al 610-910-9067.',
     4, true),
    ('What payment methods do you accept?',
     '¿Qué métodos de pago aceptan?',
     'We accept online payments through Square (credit/debit cards) and also accept cash in-store.',
     'Aceptamos pagos en línea a través de Square (tarjetas de crédito/débito) y también aceptamos efectivo en la tienda.',
     5, true),
    ('Do you make gluten-free or vegan cakes?',
     '¿Hacen pasteles sin gluten o veganos?',
     'Yes, we offer gluten-free and vegan options. Please contact us at least 48 hours in advance for these special orders.',
     'Sí, ofrecemos opciones sin gluten y veganas. Por favor, contáctenos con al menos 48 horas de anticipación para estos pedidos especiales.',
     6, true),
    ('What are your hours?',
     '¿Cuál es su horario de atención?',
     'We are open Monday through Sunday from 9:00 AM to 8:00 PM. You can visit us at 846 Street Rd., Bensalem, PA 19020.',
     'Estamos abiertos de lunes a domingo de 9:00 AM a 8:00 PM. Puede visitarnos en 846 Street Rd., Bensalem, PA 19020.',
     7, true),
    ('Can I cancel or modify my order?',
     '¿Puedo cancelar o modificar mi pedido?',
     'Cancellations or modifications must be made at least 24 hours in advance. Please contact us as soon as possible if you need to make changes.',
     'Las cancelaciones o modificaciones deben realizarse con al menos 24 horas de anticipación. Por favor, contáctenos lo antes posible si necesita hacer cambios.',
     8, true)
ON CONFLICT DO NOTHING;

-- Insert default content pages
INSERT INTO content_pages (page_slug, title_en, title_es, content_en, content_es, meta_title_en, meta_title_es, meta_description_en, meta_description_es) VALUES
    ('about',
     'Our Story',
     'Nuestra Historia',
     'At Eli''s Bakery Cafe, we start early each day with the same commitment that has guided our family for generations: creating products that not only nourish the body, but feed the soul.',
     'En Eli''s Bakery Cafe, cada día comenzamos temprano con el mismo compromiso que ha guiado a nuestra familia por generaciones: crear productos que no solo alimenten el cuerpo, sino que nutran el alma.',
     'About Us - Eli''s Dulce Tradición',
     'Sobre Nosotros - Eli''s Dulce Tradición',
     'Learn about our family tradition and commitment to quality at Eli''s Bakery Cafe.',
     'Conozca nuestra tradición familiar y compromiso con la calidad en Eli''s Bakery Cafe.'),
    ('contact',
     'Contact Us',
     'Contáctenos',
     'We''d love to hear from you! Reach out to us for orders, questions, or just to say hello.',
     '¡Nos encantaría saber de usted! Contáctenos para pedidos, preguntas o simplemente para saludar.',
     'Contact - Eli''s Dulce Tradición',
     'Contacto - Eli''s Dulce Tradición',
     'Get in touch with Eli''s Bakery Cafe. We''re here to help with your cake orders and questions.',
     'Póngase en contacto con Eli''s Bakery Cafe. Estamos aquí para ayudarle con sus pedidos y preguntas.')
ON CONFLICT (page_slug) DO NOTHING;

-- Insert default homepage content
INSERT INTO homepage_content (section, title_en, title_es, subtitle_en, subtitle_es, content_en, content_es, button_text_en, button_text_es, button_link, display_order, is_active) VALUES
    ('hero',
     'Welcome to Eli''s Dulce Tradición',
     'Bienvenido a Eli''s Dulce Tradición',
     'Flavors that Celebrate Life',
     'Sabores que Celebran la Vida',
     'Experience authentic Mexican bakery traditions with our handcrafted cakes, pastries, and sweet bread.',
     'Experimenta tradiciones auténticas de panadería mexicana con nuestros pasteles, pasteles y pan dulce hechos a mano.',
     'Order Now',
     'Ordenar Ahora',
     '/order',
     1, true),
    ('featured_products',
     'Featured Products',
     'Productos Destacados',
     'Our Most Popular Items',
     'Nuestros Productos Más Populares',
     NULL,
     NULL,
     'View Menu',
     'Ver Menú',
     '/menu',
     2, true),
    ('testimonials',
     'What Our Customers Say',
     'Lo Que Dicen Nuestros Clientes',
     'Real reviews from satisfied customers',
     'Reseñas reales de clientes satisfechos',
     NULL,
     NULL,
     NULL,
     NULL,
     NULL,
     3, true),
    ('cta',
     'Ready to Order?',
     '¿Listo para Ordenar?',
     'Let us make your celebration special',
     'Déjanos hacer tu celebración especial',
     'Contact us today to place your order or visit us at our location.',
     'Contáctenos hoy para realizar su pedido o visítenos en nuestra ubicación.',
     'Order Now',
     'Ordenar Ahora',
     '/order',
     4, true)
ON CONFLICT (section) DO NOTHING;

-- Insert default footer configuration
INSERT INTO footer_config (
    business_info_en,
    business_info_es,
    quick_links,
    show_newsletter,
    newsletter_text_en,
    newsletter_text_es,
    copyright_text_en,
    copyright_text_es
) VALUES (
    'Eli''s Dulce Tradición - Authentic Mexican Bakery in Bensalem, PA',
    'Eli''s Dulce Tradición - Panadería Mexicana Auténtica en Bensalem, PA',
    '[
        {"label_en": "Home", "label_es": "Inicio", "url": "/"},
        {"label_en": "Menu", "label_es": "Menú", "url": "/menu"},
        {"label_en": "About", "label_es": "Sobre Nosotros", "url": "/about"},
        {"label_en": "Gallery", "label_es": "Galería", "url": "/gallery"},
        {"label_en": "FAQ", "label_es": "Preguntas Frecuentes", "url": "/faq"},
        {"label_en": "Contact", "label_es": "Contacto", "url": "/contact"},
        {"label_en": "Privacy Policy", "label_es": "Política de Privacidad", "url": "/privacy"},
        {"label_en": "Terms of Service", "label_es": "Términos de Servicio", "url": "/terms"}
    ]'::jsonb,
    true,
    'Subscribe to our newsletter for special offers and updates',
    'Suscríbase a nuestro boletín para ofertas especiales y actualizaciones',
    '© {year} Eli''s Dulce Tradición. All rights reserved.',
    '© {year} Eli''s Dulce Tradición. Todos los derechos reservados.'
) ON CONFLICT (id) DO NOTHING;

-- Insert default SEO configuration for main pages
INSERT INTO seo_config (page_path, meta_title_en, meta_title_es, meta_description_en, meta_description_es, og_title_en, og_title_es, og_description_en, og_description_es) VALUES
    ('/',
     'Eli''s Dulce Tradición - Authentic Mexican Bakery | Bensalem, PA',
     'Eli''s Dulce Tradición - Panadería Mexicana Auténtica | Bensalem, PA',
     'Order custom cakes, pastries, and traditional Mexican sweet bread. Made with love in Bensalem, PA.',
     'Ordene pasteles personalizados, pasteles y pan dulce mexicano tradicional. Hecho con amor en Bensalem, PA.',
     'Eli''s Dulce Tradición - Authentic Mexican Bakery',
     'Eli''s Dulce Tradición - Panadería Mexicana Auténtica',
     'Custom cakes and traditional Mexican bakery products',
     'Pasteles personalizados y productos de panadería mexicana tradicional'),
    ('/menu',
     'Menu - Eli''s Dulce Tradición',
     'Menú - Eli''s Dulce Tradición',
     'Browse our selection of cakes, pastries, and sweet bread. Order online or visit us in Bensalem, PA.',
     'Explore nuestra selección de pasteles, pasteles y pan dulce. Ordene en línea o visítenos en Bensalem, PA.',
     'Menu - Eli''s Dulce Tradición',
     'Menú - Eli''s Dulce Tradición',
     'Fresh baked goods daily',
     'Productos horneados frescos diariamente'),
    ('/about',
     'About Us - Eli''s Dulce Tradición',
     'Sobre Nosotros - Eli''s Dulce Tradición',
     'Learn about our family tradition and commitment to quality at Eli''s Bakery Cafe.',
     'Conozca nuestra tradición familiar y compromiso con la calidad en Eli''s Bakery Cafe.',
     'About Us - Eli''s Dulce Tradición',
     'Sobre Nosotros - Eli''s Dulce Tradición',
     'Family tradition since generations',
     'Tradición familiar desde generaciones'),
    ('/gallery',
     'Gallery - Eli''s Dulce Tradición',
     'Galería - Eli''s Dulce Tradición',
     'View our portfolio of custom cakes, wedding cakes, and special occasion desserts.',
     'Vea nuestro portafolio de pasteles personalizados, pasteles de boda y postres para ocasiones especiales.',
     'Gallery - Eli''s Dulce Tradición',
     'Galería - Eli''s Dulce Tradición',
     'Our beautiful cake creations',
     'Nuestras hermosas creaciones de pasteles')

-- Insert default gallery items
INSERT INTO gallery_items (image_url, category, category_en, category_es, caption_en, caption_es, display_order, is_active) VALUES
    -- Birthday Cakes
    ('/images/CarBirthdayCake.jpg', 'birthday', 'Birthday Cakes', 'Pasteles de Cumpleaños', 'Car Themed Cake', 'Pastel con Tema de Autos', 1, true),
    ('/images/ButterflyBirthdayCake.jpg', 'birthday', 'Birthday Cakes', 'Pasteles de Cumpleaños', 'Butterfly Themed Cake', 'Pastel con Tema de Mariposas', 2, true),
    ('/images/PawPatrolBirthdayCake.jpg', 'birthday', 'Birthday Cakes', 'Pasteles de Cumpleaños', 'Paw Patrol Cake', 'Pastel de Paw Patrol', 3, true),
    
    -- Wedding Cakes
    ('/images/ALWeddingCake.jpg', 'wedding', 'Weddings', 'Bodas', 'Elegant Wedding Cake', 'Pastel de Boda Elegante', 4, true),
    ('/images/weddingCake.jpg', 'wedding', 'Weddings', 'Bodas', 'Classic Wedding Cake', 'Pastel de Boda Clásico', 5, true),
    ('/images/JMWeddingCake.jpg', 'wedding', 'Weddings', 'Bodas', 'Floral Wedding Cake', 'Pastel de Boda Floral', 6, true),
    
    -- Quinceañera (Using the number files based on previous inspection: 3.png, 4.png, 6.png)
    ('/images/3.png', 'quince', 'My Sweet Fifteen', 'Mis Quince Años', 'Quinceañera Cake 1', 'Pastel de Quince Años 1', 7, true),
    ('/images/4.png', 'quince', 'My Sweet Fifteen', 'Mis Quince Años', 'Quinceañera Cake 2', 'Pastel de Quince Años 2', 8, true),
    ('/images/6.png', 'quince', 'My Sweet Fifteen', 'Mis Quince Años', 'Quinceañera Cake 3', 'Pastel de Quince Años 3', 9, true)
ON CONFLICT DO NOTHING;
