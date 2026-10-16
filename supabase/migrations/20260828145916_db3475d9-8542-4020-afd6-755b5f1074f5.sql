-- ============ CLEANUP BEFORE SETUP ============
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TABLE IF EXISTS public.wishlist_items CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.coupons CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.addresses CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.store_settings CASCADE;
DROP TYPE IF EXISTS public.app_role CASCADE;
DROP TYPE IF EXISTS public.order_status CASCADE;
DROP TYPE IF EXISTS public.product_condition CASCADE;

-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin','customer');
CREATE TYPE public.order_status AS ENUM ('placed','confirmed','processing','packed','shipped','out_for_delivery','delivered','cancelled');
CREATE TYPE public.product_condition AS ENUM ('new','used','refurbished');

-- ============ UTIL ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE POLICY "own profile read" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid()) WITH CHECK (id = auth.uid());

CREATE POLICY "read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, phone, email)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'phone', NEW.email)
  ON CONFLICT (id) DO NOTHING;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'customer') ON CONFLICT DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ CATEGORIES ============
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_slug TEXT,
  icon TEXT,
  image_url TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT ALL ON public.categories TO service_role;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "categories public read" ON public.categories FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "categories admin write" ON public.categories FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ PRODUCTS ============
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  sku TEXT,
  title TEXT NOT NULL,
  brand TEXT NOT NULL DEFAULT 'Generic',
  category_slug TEXT NOT NULL,
  short_description TEXT,
  description TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  specs JSONB NOT NULL DEFAULT '{}'::jsonb,
  whats_included JSONB NOT NULL DEFAULT '[]'::jsonb,
  compatibility TEXT,
  warranty TEXT,
  condition public.product_condition NOT NULL DEFAULT 'new',
  price NUMERIC(12,2) NOT NULL,
  sale_price NUMERIC(12,2),
  cost_price NUMERIC(12,2),
  stock INT NOT NULL DEFAULT 0,
  low_stock_level INT NOT NULL DEFAULT 5,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  badges JSONB NOT NULL DEFAULT '[]'::jsonb,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  rating NUMERIC(3,2) NOT NULL DEFAULT 0,
  review_count INT NOT NULL DEFAULT 0,
  sold_count INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  flash_sale_ends_at TIMESTAMPTZ,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX products_category_idx ON public.products(category_slug);
CREATE INDEX products_brand_idx ON public.products(brand);
GRANT SELECT ON public.products TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "products public read" ON public.products FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "products admin write" ON public.products FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER products_updated BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ COUPONS ============
CREATE TABLE public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent',
  discount_value NUMERIC(12,2) NOT NULL,
  min_order NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(12,2),
  category_slug TEXT,
  usage_limit INT,
  used_count INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.coupons TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.coupons TO authenticated;
GRANT ALL ON public.coupons TO service_role;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "coupons public read active" ON public.coupons FOR SELECT TO anon, authenticated USING (is_active OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "coupons admin write" ON public.coupons FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============ ORDERS ============
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  address_line TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  delivery_method TEXT NOT NULL DEFAULT 'standard',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  subtotal NUMERIC(12,2) NOT NULL,
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 0,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  coupon_code TEXT,
  total NUMERIC(12,2) NOT NULL,
  status public.order_status NOT NULL DEFAULT 'placed',
  tracking_number TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.orders TO authenticated;
GRANT ALL ON public.orders TO service_role;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders own read" ON public.orders FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "orders own insert" ON public.orders FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "orders admin update" ON public.orders FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER orders_updated BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  image_url TEXT,
  variant_label TEXT,
  sku TEXT,
  unit_price NUMERIC(12,2) NOT NULL,
  qty INT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.order_items TO authenticated;
GRANT ALL ON public.order_items TO service_role;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order items read" ON public.order_items FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND (o.user_id = auth.uid() OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "order items insert" ON public.order_items FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = order_id AND o.user_id = auth.uid()));

-- ============ REVIEWS ============
CREATE TABLE public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  author_name TEXT,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  body TEXT,
  photos JSONB NOT NULL DEFAULT '[]'::jsonb,
  verified_purchase BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN NOT NULL DEFAULT true,
  helpful_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.reviews TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews public read" ON public.reviews FOR SELECT TO anon, authenticated USING (is_approved OR user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reviews own insert" ON public.reviews FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews own update" ON public.reviews FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin')) WITH CHECK (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "reviews delete" ON public.reviews FOR DELETE TO authenticated USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin'));

-- ============ WISHLIST ============
CREATE TABLE public.wishlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, product_id)
);
GRANT SELECT, INSERT, DELETE ON public.wishlist_items TO authenticated;
GRANT ALL ON public.wishlist_items TO service_role;
ALTER TABLE public.wishlist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wishlist own" ON public.wishlist_items FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ ADDRESSES ============
CREATE TABLE public.addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  label TEXT,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  address_line TEXT NOT NULL,
  area TEXT,
  city TEXT NOT NULL,
  province TEXT,
  postal_code TEXT,
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.addresses TO authenticated;
GRANT ALL ON public.addresses TO service_role;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "addresses own" ON public.addresses FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- ============ SETTINGS ============
CREATE TABLE public.store_settings (
  id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  store_name TEXT NOT NULL DEFAULT 'Super Computers',
  tagline TEXT NOT NULL DEFAULT 'Smart Electronics. Better Prices.',
  phone TEXT NOT NULL DEFAULT '+92 332 299 2026',
  whatsapp TEXT NOT NULL DEFAULT '923322992026',
  whatsapp_greeting TEXT NOT NULL DEFAULT 'Hi! I need help with an order.',
  email TEXT NOT NULL DEFAULT 'supercomputer.2526@gmail.com',
  address TEXT NOT NULL DEFAULT 'PIB Colony, near Faizan-e-Madinah, Karachi',
  currency TEXT NOT NULL DEFAULT 'PKR',
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 250,
  free_delivery_threshold NUMERIC(12,2) NOT NULL DEFAULT 10000,
  return_policy TEXT NOT NULL DEFAULT '7-day easy returns on eligible items.',
  warranty_text TEXT NOT NULL DEFAULT 'Warranty varies by product. Check the product page.',
  trust_badges JSONB NOT NULL DEFAULT '["Secure Checkout","Cash on Delivery","Fast Delivery Across Pakistan","Verified Products","Easy Returns","Customer Support"]'::jsonb,
  social_links JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.store_settings TO anon, authenticated;
GRANT INSERT, UPDATE ON public.store_settings TO authenticated;
GRANT ALL ON public.store_settings TO service_role;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "settings public read" ON public.store_settings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "settings admin write" ON public.store_settings FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
INSERT INTO public.store_settings (id) VALUES (1);

-- ============ SEED CATEGORIES ============
INSERT INTO public.categories (slug, name, parent_slug, icon, image_url, sort_order) VALUES
('electronics','Electronics',NULL,'Zap','https://images.unsplash.com/photo-1625948515291-69613efd103f?auto=format&fit=crop&w=600&q=80',1),
('batteries','Batteries','electronics','BatteryCharging','https://images.unsplash.com/photo-1619641805634-b7c9a5c1a1d1?auto=format&fit=crop&w=600&q=80',2),
('chargers','Chargers & Adapters','electronics','Plug','https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',3),
('cables','Cables','electronics','Cable','https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&w=600&q=80',4),
('power-banks','Power Banks','electronics','BatteryFull','https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=600&q=80',5),
('audio','Audio & Headphones','electronics','Headphones','https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',6),
('speakers','Speakers','electronics','Speaker','https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=600&q=80',7),
('mini-gadgets','Mini Electronics','electronics','Lightbulb','https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80',8),
('computer-accessories','Computer Accessories',NULL,'Mouse','https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',9),
('storage','Storage Devices','computer-accessories','HardDrive','https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=600&q=80',10),
('laptops','Laptops',NULL,'Laptop','https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=600&q=80',11),
('laptop-accessories','Laptop Accessories','laptops','Cpu','https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80',12),
('printers','Printers',NULL,'Printer','https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=600&q=80',13),
('printer-supplies','Toners & Cartridges','printers','Droplet','https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&q=80',14),
('networking','Networking & WiFi',NULL,'Wifi','https://images.unsplash.com/photo-1606765962248-7ff407b51667?auto=format&fit=crop&w=600&q=80',15),
('cctv','CCTV & Security',NULL,'Cctv','https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=600&q=80',16);

-- ============ SEED COUPONS ============
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order, max_discount) VALUES
('WELCOME100','Rs. 100 off your first order over Rs. 1,500','fixed',100,1500,NULL),
('TECH10','10% off orders over Rs. 5,000 (max Rs. 2,000)','percent',10,5000,2000),
('BIGSAVE20','20% off orders over Rs. 25,000 (max Rs. 6,000)','percent',20,25000,6000);

-- ============ SEED PRODUCTS ============
INSERT INTO public.products (slug, sku, title, brand, category_slug, short_description, description, features, specs, whats_included, warranty, condition, price, sale_price, cost_price, stock, images, variants, badges, tags, rating, review_count, sold_count, is_featured) VALUES
('rechargeable-aa-battery-set-4','SC-BAT-001','Rechargeable AA Battery Set (4 Pcs, 2800mAh)','Generic','batteries','Demo sample inventory — high-capacity rechargeable AA cells.','Reusable AA Ni-MH rechargeable batteries suitable for remotes, toys, wireless mice and clocks. Sample/demo inventory.','["2800mAh capacity","Up to 500 recharge cycles","Fits all standard AA devices","Low self-discharge"]','{"Type":"Ni-MH AA","Capacity":"2800mAh","Voltage":"1.2V","Pack Size":"4 pieces"}','["4x AA rechargeable cells","Storage case"]','No warranty (consumable)','new',900,690,520,64,'["https://images.unsplash.com/photo-1619641805634-b7c9a5c1a1d1?auto=format&fit=crop&w=900&q=80"]','[{"label":"4 Pcs","price":690,"stock":64,"sku":"SC-BAT-001-4"},{"label":"8 Pcs","price":1290,"stock":30,"sku":"SC-BAT-001-8"}]','["HOT DEAL"]','["battery","aa","rechargeable"]',4.4,86,940,true),
('usb-type-c-fast-cable','SC-CBL-001','USB Type-C Fast Charging Cable (3A)','Baseus','cables','Demo sample inventory — braided 3A Type-C cable.','Nylon-braided USB-A to Type-C cable supporting 3A fast charging and data sync. Sample/demo inventory.','["3A fast charging","Braided anti-tangle jacket","480Mbps data transfer","Reinforced connectors"]','{"Connector":"USB-A to Type-C","Current":"3A","Data Speed":"480Mbps","Jacket":"Nylon braided"}','["1x Type-C cable"]','7 days replacement','new',650,449,270,120,'["https://images.unsplash.com/photo-1601524909162-ae8725290836?auto=format&fit=crop&w=900&q=80"]','[{"label":"1m / Black","price":449,"stock":60,"sku":"CBL-1M-BK"},{"label":"2m / Black","price":649,"stock":40,"sku":"CBL-2M-BK"},{"label":"2m / White","price":649,"stock":20,"sku":"CBL-2M-WH"}]','["BEST SELLER"]','["cable","type-c","fast charging"]',4.6,203,2140,true),
('fast-usb-wall-charger-20w','SC-CHG-001','20W Fast USB Wall Charger (PD + QC)','Generic','chargers','Demo sample inventory — dual-port 20W fast charger.','Compact 20W wall adapter with USB-C Power Delivery and USB-A Quick Charge ports. Sample/demo inventory.','["20W USB-C Power Delivery","Quick Charge 3.0 USB-A","Over-current protection","Compact travel size"]','{"Output":"20W","Ports":"USB-C + USB-A","Input":"100-240V","Protection":"OCP / OVP"}','["1x wall charger"]','3 months warranty','new',1450,1099,720,48,'["https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80"]','[]','["SALE"]','["charger","20w","pd"]',4.5,131,760,true),
('mini-bluetooth-speaker','SC-SPK-001','Mini Bluetooth Speaker 5.0 (Portable)','Generic','speakers','Demo sample inventory — pocket-size Bluetooth speaker.','Portable Bluetooth 5.0 speaker with TF card slot and built-in rechargeable battery. Sample/demo inventory.','["Bluetooth 5.0","Up to 4h playback","TF card + AUX support","Built-in microphone"]','{"Bluetooth":"5.0","Battery":"400mAh","Output":"3W","Ports":"TF, AUX, USB-C"}','["1x speaker","1x charging cable"]','7 days checking warranty','new',1990,1490,980,35,'["https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=900&q=80"]','[{"label":"Black","price":1490,"stock":20},{"label":"Blue","price":1490,"stock":15}]','["NEW"]','["speaker","bluetooth","portable"]',4.2,58,410,false),
('wireless-mouse-2-4ghz','SC-MOU-001','Wireless Mouse 2.4GHz (1600 DPI)','Logitech','computer-accessories','Demo sample inventory — silent wireless mouse.','Silent-click 2.4GHz wireless mouse with nano receiver and adjustable DPI. Sample/demo inventory.','["1600 DPI adjustable","Silent click buttons","Nano USB receiver","Up to 10m range"]','{"DPI":"1000/1200/1600","Connection":"2.4GHz","Battery":"1x AA","Buttons":"4"}','["1x mouse","1x nano receiver"]','1 month warranty','new',1800,1350,900,52,'["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=900&q=80"]','[]','["BEST SELLER"]','["mouse","wireless"]',4.5,174,1320,true),
('usb-hub-4-port','SC-HUB-001','4-Port USB 3.0 Hub','Generic','computer-accessories','Demo sample inventory — 4-port USB 3.0 hub.','Slim aluminium-finish 4-port USB 3.0 hub for laptops and desktops. Sample/demo inventory.','["4x USB 3.0 ports","5Gbps transfer","Plug and play","No driver needed"]','{"Ports":"4x USB 3.0","Speed":"5Gbps","Cable":"20cm"}','["1x USB hub"]','7 days replacement','new',1290,899,540,40,'["https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=900&q=80"]','[]','[]','["usb","hub"]',4.3,64,380,false),
('hdmi-to-vga-adapter','SC-ADP-001','HDMI to VGA Adapter (1080p)','Generic','chargers','Demo sample inventory — HDMI to VGA converter.','Connect a laptop HDMI output to a VGA monitor or projector at up to 1080p. Sample/demo inventory.','["1080p @60Hz","Plug and play","Compact ABS body","Works with projectors"]','{"Input":"HDMI Male","Output":"VGA Female","Resolution":"1920x1080"}','["1x adapter"]','7 days replacement','new',950,699,380,45,'["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80"]','[]','["UNDER 1000"]','["hdmi","vga","adapter"]',4.1,42,290,false),
('otg-adapter-type-c','SC-ADP-002','Type-C OTG Adapter','Generic','chargers','Demo sample inventory — USB-C OTG connector.','Connect USB flash drives, keyboards or mice to a Type-C phone or tablet. Sample/demo inventory.','["USB-C to USB-A OTG","Supports flash drives","Compact keychain size"]','{"Interface":"USB-C to USB-A","Speed":"USB 2.0"}','["1x OTG adapter"]','No warranty','new',350,199,90,150,'["https://images.unsplash.com/photo-1591290619762-c2b5d3f7ac1e?auto=format&fit=crop&w=900&q=80"]','[]','["UNDER 1000"]','["otg","adapter","type-c"]',4.0,120,1650,false),
('memory-card-reader','SC-ADP-003','Memory Card Reader (SD + Micro SD)','Generic','storage','Demo sample inventory — dual-slot card reader.','USB card reader supporting SD and Micro SD cards for photo and file transfer. Sample/demo inventory.','["SD + Micro SD slots","USB 2.0","Plug and play"]','{"Slots":"SD, Micro SD","Interface":"USB 2.0"}','["1x card reader"]','7 days replacement','new',600,399,200,80,'["https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80"]','[]','["UNDER 1000"]','["card reader","sd"]',4.2,55,470,false),
('led-usb-light','SC-LED-001','Flexible LED USB Light','Generic','mini-gadgets','Demo sample inventory — flexible USB reading light.','Bendable USB LED lamp for laptops, power banks and car chargers. Sample/demo inventory.','["Flexible gooseneck","Cool white LEDs","Low power draw"]','{"Power":"1W","Interface":"USB-A"}','["1x LED light"]','No warranty','new',300,149,60,200,'["https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80"]','[]','["UNDER 1000"]','["led","usb","light"]',4.1,96,2100,false),
('wired-earphones-hifi','SC-AUD-001','Wired Earphones with Mic (HiFi Bass)','Generic','audio','Demo sample inventory — 3.5mm wired earphones.','In-ear wired earphones with inline microphone and bass-tuned drivers. Sample/demo inventory.','["10mm bass drivers","Inline mic and control","3.5mm jack","Tangle-resistant cable"]','{"Driver":"10mm","Jack":"3.5mm","Cable":"1.2m"}','["1x earphones","2x extra ear tips"]','7 days checking warranty','new',850,549,260,90,'["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=900&q=80"]','[]','["UNDER 1000"]','["earphones","wired"]',4.0,138,1780,false),
('bluetooth-audio-receiver','SC-AUD-002','Bluetooth 5.0 Audio Receiver (AUX)','Generic','audio','Demo sample inventory — Bluetooth AUX receiver.','Add Bluetooth to any car stereo or speaker with a 3.5mm AUX input. Sample/demo inventory.','["Bluetooth 5.0","Hands-free calling","Built-in battery","3.5mm AUX output"]','{"Bluetooth":"5.0","Battery":"200mAh","Range":"10m"}','["1x receiver","1x AUX cable"]','7 days replacement','new',1250,899,470,38,'["https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80"]','[]','[]','["bluetooth","receiver","aux"]',4.2,49,320,false),
('laptop-cooling-pad','SC-LAC-001','Laptop Cooling Pad (5 Fans)','Generic','laptop-accessories','Demo sample inventory — 5-fan laptop cooler.','Adjustable-height laptop cooling stand with five silent fans and USB pass-through. Sample/demo inventory.','["5 silent fans","2 height levels","USB powered","Fits up to 17 inch"]','{"Fans":"5","Fits":"Up to 17 inch","Power":"USB"}','["1x cooling pad","1x USB cable"]','1 month warranty','new',2900,1990,1200,26,'["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=900&q=80"]','[]','["SALE"]','["cooling pad","laptop"]',4.3,71,410,false),
('premium-power-bank-20000','SC-PWB-001','20000mAh Fast Power Bank (22.5W)','Xiaomi','power-banks','Demo sample inventory — 20000mAh fast power bank.','High-capacity power bank with 22.5W fast output, dual USB-A and USB-C in/out. Sample/demo inventory.','["20000mAh capacity","22.5W fast charge","Dual USB-A + USB-C","LED battery indicator"]','{"Capacity":"20000mAh","Output":"22.5W","Ports":"2x USB-A, 1x USB-C"}','["1x power bank","1x charging cable"]','6 months warranty','new',7900,6490,4800,22,'["https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80"]','[{"label":"10000mAh","price":3990,"stock":18},{"label":"20000mAh","price":6490,"stock":22}]','["TOP RATED"]','["power bank","fast charging"]',4.7,215,930,true),
('bluetooth-headphones-anc','SC-AUD-003','Bluetooth Over-Ear Headphones (ANC)','Generic','audio','Demo sample inventory — ANC wireless headphones.','Over-ear wireless headphones with active noise cancellation and up to 30h battery. Sample/demo inventory.','["Active noise cancellation","Up to 30h playback","Bluetooth 5.3","Foldable design"]','{"Bluetooth":"5.3","Battery":"30 hours","Driver":"40mm","Charging":"USB-C"}','["1x headphones","1x USB-C cable","1x AUX cable"]','3 months warranty','new',8900,5990,4200,18,'["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80"]','[{"label":"Black","price":5990,"stock":10},{"label":"White","price":5990,"stock":8}]','["BEST SELLER"]','["headphones","anc","bluetooth"]',4.6,182,640,true),
('tplink-wifi-router-ac1200','SC-NET-001','TP-Link AC1200 Dual Band WiFi Router','TP-Link','networking','Demo sample inventory — AC1200 dual-band router.','Dual-band wireless router with four antennas, ideal for homes and small offices. Sample/demo inventory.','["AC1200 dual band","4x external antennas","4x LAN ports","Parental controls"]','{"Speed":"1200Mbps","Bands":"2.4GHz + 5GHz","Ports":"1 WAN + 4 LAN","Antennas":"4"}','["1x router","1x power adapter","1x LAN cable"]','1 year warranty','new',9500,7490,6100,15,'["https://images.unsplash.com/photo-1606765962248-7ff407b51667?auto=format&fit=crop&w=900&q=80"]','[]','["TOP RATED"]','["router","wifi","tp-link"]',4.5,97,380,true),
('mechanical-keyboard-rgb','SC-KBD-001','RGB Mechanical Keyboard (Blue Switch)','Generic','computer-accessories','Demo sample inventory — RGB mechanical keyboard.','Full-size mechanical keyboard with blue switches and RGB backlighting. Sample/demo inventory.','["Blue clicky switches","RGB backlight modes","Anti-ghosting","Braided USB cable"]','{"Switches":"Blue","Layout":"104 keys","Backlight":"RGB","Interface":"USB"}','["1x keyboard","1x keycap puller"]','3 months warranty','new',6500,4790,3400,20,'["https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80"]','[]','["HOT DEAL"]','["keyboard","mechanical","rgb"]',4.4,88,300,false),
('ssd-256gb-sata','SC-STO-001','256GB SATA SSD 2.5"','Generic','storage','Demo sample inventory — 256GB SATA SSD.','2.5-inch SATA III solid state drive for laptop and desktop upgrades. Sample/demo inventory.','["Up to 550MB/s read","SATA III 6Gb/s","Shock resistant","3-year rated endurance"]','{"Capacity":"256GB","Interface":"SATA III","Read":"550MB/s","Write":"500MB/s"}','["1x SSD"]','1 year warranty','new',6900,5490,4300,34,'["https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=900&q=80"]','[{"label":"128GB","price":3990,"stock":20},{"label":"256GB","price":5490,"stock":34},{"label":"512GB","price":9490,"stock":12}]','["BEST SELLER"]','["ssd","storage"]',4.6,142,510,true),
('cctv-camera-wifi-indoor','SC-CCT-001','WiFi Indoor CCTV Camera (1080p)','Generic','cctv','Demo sample inventory — 1080p WiFi camera.','Indoor WiFi security camera with night vision, motion alerts and two-way audio. Sample/demo inventory.','["1080p Full HD","Night vision","Motion detection alerts","Two-way audio"]','{"Resolution":"1080p","Storage":"Micro SD up to 128GB","Connectivity":"WiFi 2.4GHz"}','["1x camera","1x power adapter","1x mount kit"]','6 months warranty','new',6500,4990,3800,17,'["https://images.unsplash.com/photo-1557324232-b8917d3c3dcb?auto=format&fit=crop&w=900&q=80"]','[]','["NEW"]','["cctv","camera","wifi"]',4.3,63,240,false),
('hp-elitebook-840-g5','SC-LAP-001','HP EliteBook 840 G5 — Core i5 8th Gen, 8GB, 256GB SSD','HP','laptops','Demo sample inventory — used business ultrabook.','Refurbished HP EliteBook 840 G5 business laptop with 8th generation Core i5, 8GB RAM and a 256GB SSD. Sample/demo inventory; condition and specs may vary per unit.','["Intel Core i5-8250U","8GB DDR4 RAM","256GB NVMe SSD","14 inch Full HD display","Backlit keyboard"]','{"Brand":"HP","Model":"EliteBook 840 G5","Processor":"Intel Core i5-8250U","Generation":"8th Gen","RAM":"8GB DDR4","Storage":"256GB SSD","Display":"14 inch FHD","Graphics":"Intel UHD 620","OS":"Windows 10 Pro","Condition":"Used"}','["1x laptop","1x original charger"]','7 days checking warranty','used',72000,58900,50000,6,'["https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=900&q=80"]','[{"label":"8GB / 256GB","price":58900,"stock":6},{"label":"16GB / 512GB","price":72900,"stock":3}]','["BEST SELLER"]','["laptop","hp","used","i5"]',4.5,64,180,true),
('dell-latitude-7490','SC-LAP-002','Dell Latitude 7490 — Core i5 8th Gen, 8GB, 256GB SSD','Dell','laptops','Demo sample inventory — used business laptop.','Refurbished Dell Latitude 7490 with 8th gen Core i5, 8GB RAM, 256GB SSD and a durable business chassis. Sample/demo inventory.','["Intel Core i5-8350U","8GB DDR4 RAM","256GB SSD","14 inch display","Long battery life"]','{"Brand":"Dell","Model":"Latitude 7490","Processor":"Intel Core i5-8350U","Generation":"8th Gen","RAM":"8GB DDR4","Storage":"256GB SSD","Display":"14 inch FHD","Condition":"Used"}','["1x laptop","1x charger"]','7 days checking warranty','used',69000,56500,48000,5,'["https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=900&q=80"]','[]','["LIMITED STOCK"]','["laptop","dell","used"]',4.4,41,120,true),
('lenovo-thinkpad-t480','SC-LAP-003','Lenovo ThinkPad T480 — Core i5 8th Gen, 8GB, 256GB SSD','Lenovo','laptops','Demo sample inventory — used ThinkPad.','Refurbished Lenovo ThinkPad T480 with legendary keyboard, dual battery design and 8th gen Core i5. Sample/demo inventory.','["Intel Core i5-8250U","8GB DDR4 RAM","256GB SSD","Dual battery system","Spill-resistant keyboard"]','{"Brand":"Lenovo","Model":"ThinkPad T480","Processor":"Intel Core i5-8250U","Generation":"8th Gen","RAM":"8GB DDR4","Storage":"256GB SSD","Display":"14 inch","Condition":"Used"}','["1x laptop","1x charger"]','7 days checking warranty','used',74000,61900,53000,4,'["https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=900&q=80"]','[]','["TOP RATED"]','["laptop","lenovo","thinkpad"]',4.6,73,150,true),
('hp-laserjet-pro-m15w','SC-PRN-001','HP LaserJet Pro M15w Wireless Printer','HP','printers','Demo sample inventory — compact wireless laser printer.','Compact monochrome laser printer with WiFi printing, ideal for home offices and small shops. Sample/demo inventory.','["Wireless printing","19 ppm print speed","600x600 dpi","Compact footprint"]','{"Print Technology":"Monochrome Laser","Speed":"19 ppm","Resolution":"600x600 dpi","Connectivity":"WiFi, USB","Paper Size":"A4","Cartridge":"HP 48A"}','["1x printer","1x starter toner","1x power cable"]','3 months warranty','new',34000,28900,25000,9,'["https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=900&q=80"]','[]','["BEST SELLER"]','["printer","hp","laser"]',4.5,58,210,true),
('canon-pixma-g2010','SC-PRN-002','Canon PIXMA G2010 Ink Tank All-in-One','Canon','printers','Demo sample inventory — ink tank all-in-one printer.','Refillable ink tank printer with print, scan and copy for low cost per page. Sample/demo inventory.','["Refillable ink tank","Print, scan, copy","Up to 4800x1200 dpi","Low running cost"]','{"Print Technology":"Inkjet Ink Tank","Functions":"Print / Scan / Copy","Resolution":"4800x1200 dpi","Connectivity":"USB","Paper Size":"A4"}','["1x printer","4x ink bottles","1x power cable"]','1 year warranty','new',52000,45900,41000,7,'["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80"]','[]','["TOP RATED"]','["printer","canon","ink tank"]',4.6,84,260,true),
('epson-l3210-ecotank','SC-PRN-003','Epson EcoTank L3210 All-in-One Printer','Epson','printers','Demo sample inventory — EcoTank all-in-one.','Epson EcoTank L3210 multifunction printer with high-yield refillable ink tanks. Sample/demo inventory.','["EcoTank refillable ink","Print, scan, copy","Heat-free technology","High page yield"]','{"Print Technology":"Inkjet EcoTank","Functions":"Print / Scan / Copy","Speed":"33 ppm draft","Connectivity":"USB","Paper Size":"A4"}','["1x printer","4x ink bottles","1x power cable"]','1 year warranty','new',56000,49900,44000,6,'["https://images.unsplash.com/photo-1585672840563-f2af2ced56cb?auto=format&fit=crop&w=900&q=80"]','[]','[]','["printer","epson","ecotank"]',4.5,66,190,false),
('hp-48a-toner-cartridge','SC-TON-001','HP 48A Compatible Toner Cartridge','HP','printer-supplies','Demo sample inventory — compatible toner.','Compatible black toner cartridge for HP LaserJet Pro M15/M28 series. Sample/demo inventory.','["Approx 1000 page yield","Compatible with M15/M28","Sharp black text"]','{"Type":"Compatible Toner","Color":"Black","Yield":"~1000 pages","For":"HP LaserJet M15/M28"}','["1x toner cartridge"]','7 days replacement','new',4200,2990,2100,25,'["https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=900&q=80"]','[]','["SALE"]','["toner","hp"]',4.2,37,160,false),
('laptop-charger-65w-universal','SC-LAC-002','Universal Laptop Charger 65W (Multi-Tip)','Generic','laptop-accessories','Demo sample inventory — 65W universal laptop charger.','65W universal laptop adapter with multiple interchangeable tips for HP, Dell and Lenovo laptops. Sample/demo inventory.','["65W output","8 interchangeable tips","Short-circuit protection","1.5m cable"]','{"Output":"65W","Tips":"8 included","Input":"100-240V"}','["1x adapter","8x tips","1x power cable"]','3 months warranty','new',3500,2490,1700,28,'["https://images.unsplash.com/photo-1585790050230-5dd28404ccb9?auto=format&fit=crop&w=900&q=80"]','[]','[]','["laptop charger","universal"]',4.1,52,230,false),
('mini-usb-fan','SC-MIN-001','Mini USB Desk Fan','Generic','mini-gadgets','Demo sample inventory — small USB fan.','Quiet USB-powered desk fan for laptops, power banks and car chargers. Sample/demo inventory.','["USB powered","Quiet operation","Adjustable tilt"]','{"Power":"2.5W","Interface":"USB-A","Blade":"Soft plastic"}','["1x mini fan"]','No warranty','new',700,449,220,110,'["https://images.unsplash.com/photo-1527359443443-84a48aec73d2?auto=format&fit=crop&w=900&q=80"]','[]','["UNDER 1000"]','["fan","usb","mini"]',3.9,74,880,false),
('webcam-1080p-usb','SC-WEB-001','1080p USB Webcam with Mic','Generic','computer-accessories','Demo sample inventory — 1080p webcam.','Full HD USB webcam with built-in microphone for online classes and meetings. Sample/demo inventory.','["1080p Full HD","Built-in microphone","Plug and play","Clip-on mount"]','{"Resolution":"1080p","Frame Rate":"30fps","Interface":"USB 2.0"}','["1x webcam"]','3 months warranty','new',4500,3290,2400,21,'["https://images.unsplash.com/photo-1587826080692-f439cd0b70da?auto=format&fit=crop&w=900&q=80"]','[]','[]','["webcam","1080p"]',4.2,45,190,false),
('wireless-keyboard-mouse-combo','SC-KBD-002','Wireless Keyboard & Mouse Combo','Logitech','computer-accessories','Demo sample inventory — wireless combo set.','Wireless keyboard and mouse set sharing a single nano receiver. Sample/demo inventory.','["Single nano receiver","Full-size keyboard","Silent mouse clicks","Long battery life"]','{"Connection":"2.4GHz","Keyboard":"Full size","Mouse DPI":"1200"}','["1x keyboard","1x mouse","1x receiver","Batteries"]','6 months warranty','new',5900,4290,3200,19,'["https://images.unsplash.com/photo-1541140532154-b024d705b90a?auto=format&fit=crop&w=900&q=80"]','[]','["HOT DEAL"]','["keyboard","mouse","combo"]',4.4,79,310,true);