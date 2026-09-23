-- Starter catalogue taken from the original site. Safe to re-run.

insert into public.categories (name, slug, sort_order) values
  ('Grains & Flours', 'grains-flours', 1),
  ('Oils & Fats', 'oils-fats', 2),
  ('Plantains & Bananas', 'plantains-bananas', 3),
  ('Proteins', 'proteins', 4),
  ('Root Vegetables', 'root-vegetables', 5),
  ('Spices & Seasonings', 'spices-seasonings', 6)
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, unit, category_id, images, quantity, is_fresh, is_featured)
select p.name, p.slug, p.description, p.price, p.unit, c.id, p.images, 20, p.is_fresh, p.is_featured
from (values
  ('African Curry Powder', 'african-curry-powder', 'Aromatic curry blend, 200g', 7.99, 'per pack', 'spices-seasonings', array['/seed/product-spices.jpg'], false, true),
  ('Premium Yam', 'premium-yam', 'Fresh white yam, perfect for pounding', 5.49, 'per lb', 'root-vegetables', array['/seed/product-yam.jpg'], true, true),
  ('Green Plantains', 'green-plantains', 'Firm green plantains for frying or boiling', 2.99, 'per lb', 'plantains-bananas', array['/seed/product-plantain.jpg'], true, true),
  ('Red Palm Oil', 'red-palm-oil', 'Authentic red palm oil, 1 liter bottle', 12.99, 'per bottle', 'oils-fats', array['/seed/product-palm-oil.jpg'], false, true),
  ('Ground Cayenne Pepper', 'ground-cayenne-pepper', 'Hot cayenne pepper powder, 100g', 5.99, 'per pack', 'spices-seasonings', array['/seed/product-spices.jpg'], false, false),
  ('Cassava Flour', 'cassava-flour', 'Fine cassava flour for baking, 2lb', 6.99, 'per bag', 'grains-flours', array['/seed/product-yam.jpg'], false, false),
  ('Ripe Plantains', 'ripe-plantains', 'Sweet yellow plantains ready to fry', 3.49, 'per lb', 'plantains-bananas', array['/seed/product-plantain.jpg'], true, false),
  ('Coconut Oil', 'coconut-oil', 'Pure coconut oil for cooking, 500ml', 9.99, 'per bottle', 'oils-fats', array['/seed/product-palm-oil.jpg'], false, false)
) as p(name, slug, description, price, unit, category_slug, images, is_fresh, is_featured)
join public.categories c on c.slug = p.category_slug
on conflict (slug) do nothing;

insert into public.store_settings (id, name, tagline, hero_title, hero_subtitle, about_text, hours)
values (
  1,
  'Walkem Farm Market',
  'Bringing Africa''s Flavours Closer to You',
  'Authentic African Groceries in Moncton',
  'Your Home for Authentic African & Caribbean Foods',
  'Walkem Farm Market is your premier destination for authentic African groceries. We''re passionate about connecting our community with the flavors of home through quality products, exceptional service, and a commitment to cultural excellence.',
  '[
    {"day": "Monday", "open": "09:00", "close": "20:00", "closed": false},
    {"day": "Tuesday", "open": "09:00", "close": "20:00", "closed": false},
    {"day": "Wednesday", "open": "09:00", "close": "20:00", "closed": false},
    {"day": "Thursday", "open": "09:00", "close": "20:00", "closed": false},
    {"day": "Friday", "open": "09:00", "close": "20:00", "closed": false},
    {"day": "Saturday", "open": "09:00", "close": "21:00", "closed": false},
    {"day": "Sunday", "open": "10:00", "close": "18:00", "closed": false}
  ]'::jsonb
)
on conflict (id) do nothing;
