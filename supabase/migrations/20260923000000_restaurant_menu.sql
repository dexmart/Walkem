-- Restaurant & Bar dishes become regular products so they can be added to the cart
-- and managed (price, photos, availability) from the admin like everything else.

insert into public.categories (name, slug, sort_order)
values ('Restaurant & Bar', 'restaurant-bar', 7)
on conflict (slug) do nothing;

insert into public.products (name, slug, description, price, unit, category_id, images, quantity, is_fresh, is_featured)
select p.name, p.slug, p.description, p.price, p.unit, c.id, p.images, 50, false, false
from (values
  ('Jollof Rice Special', 'jollof-rice-special', 'Authentic Nigerian jollof rice with fried plantains and grilled chicken', 18.99, 'per plate', array['/seed/nigerian-jollof-rice.jpg']),
  ('Egusi Soup & Pounded Yam', 'egusi-soup-pounded-yam', 'Traditional egusi soup served with fresh pounded yam', 22.99, 'per plate', array['/seed/nigerian-egusi-soup.jpg']),
  ('Suya Platter', 'suya-platter', 'Grilled spicy beef skewers with onions and peppers', 16.99, 'per platter', array['/seed/nigerian-suya.jpg']),
  ('Nigerian Drinks', 'nigerian-drinks', 'Chapman, Zobo, Palm Wine and more refreshing beverages — tell us your pick on WhatsApp', 5.99, 'per drink', array['/seed/nigerian-drinks.jpg'])
) as p(name, slug, description, price, unit, images)
join public.categories c on c.slug = 'restaurant-bar'
on conflict (slug) do nothing;
