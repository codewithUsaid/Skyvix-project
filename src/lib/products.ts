export type Product = {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  originalPrice: number;
  rating: number;
  reviews: number;
  sold: number;
  badge?: string;
  gradient: string;
  emoji: string;
  image?: string;
  description: string;
  stock: number;
  condition?: "New" | "Used - Like New" | "Used - Good";
};

const cu = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&h=600&q=80`;

export const categories = [
  { slug: "laptops", name: "Laptops", emoji: "💻", count: 86, image: cu("1496181133206-80ce9b88a853") },
  { slug: "printers", name: "Printers", emoji: "🖨️", count: 42, image: cu("1612815154858-60aa4c59eaa6") },
  { slug: "mouse-keyboard", name: "Mouse & Keyboard", emoji: "⌨️", count: 124, image: cu("1587829741301-dc798b83add3") },
  { slug: "graphic-cards", name: "Graphic Cards", emoji: "🎮", count: 38, image: cu("1591488320449-011701bb6704") },
  { slug: "speakers", name: "Speakers", emoji: "🔊", count: 67, image: cu("1608043152269-423dbba4e7e1") },
  { slug: "headphones", name: "Headphones", emoji: "🎧", count: 91, image: cu("1505740420928-5e560c06d30e") },
  { slug: "accessories", name: "Accessories", emoji: "🔌", count: 215, image: cu("1625948515291-69613efd103f") },
  { slug: "networking", name: "Networking", emoji: "📡", count: 53, image: cu("1606765962248-7ff407b51667") },
];

const grads = [
  "from-blue-500/20 via-blue-600/10 to-indigo-700/30",
  "from-zinc-900 via-zinc-800 to-zinc-950",
  "from-purple-500/20 via-fuchsia-500/10 to-blue-600/30",
  "from-orange-400/20 via-amber-500/10 to-rose-500/30",
  "from-emerald-400/20 via-teal-500/10 to-cyan-600/30",
  "from-slate-800 via-slate-900 to-black",
];

// Unsplash CDN — reliable hosted product photos
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&h=900&q=80`;

const IMG = {
  laptopDell: u("1496181133206-80ce9b88a853"),
  laptopHp: u("1593642632559-0c6d3fc62b89"),
  laptopLenovo: u("1541807084-5c52b6b3adef"),
  laptopThinkpad: u("1588872657578-7efd1f1555ed"),
  laptopSilver: u("1531297484001-80022131f5a1"),
  laptopOpen: u("1517336714731-489689fd1ca8"),
  laptopGaming: u("1603481546238-487240415921"),
  laptopBlack: u("1484788984921-03950022c9ef"),
  laptopWork: u("1542751371-adc38448a05e"),
  laptopApple: u("1525547719571-a2d4ac8945e2"),
  laptopLegion: u("1611078489935-0cb964de46d6"),
  printerHp: u("1612815154858-60aa4c59eaa6"),
  printerOffice: u("1612815292258-f4354f7f93a4"),
  printerEpson: u("1563770660941-20978e870e26"),
  printerCanon: u("1625961326500-2c0e9b3e3a30"),
  printerMono: u("1589758438368-0ad531db3366"),
  speaker: u("1608043152269-423dbba4e7e1"),
  jbl: u("1608043152269-423dbba4e7e1"),
  airpods: u("1606220588913-b3aacb4d2f46"),
  mouse: u("1527864550417-7fd91fc51a46"),
  keyboard: u("1587829741301-dc798b83add3"),
  powerbank: u("1609592786331-0b66a8f5f5b1"),
  dock: u("1625948515291-69613efd103f"),
};

export const products: Product[] = [
  // ===== USED LAPTOPS (Pakistan market — up to 7th gen) =====
  {
    id: "u1", slug: "dell-latitude-e7270-i5-6th-used",
    title: "Dell Latitude E7270 Core i5 6th Gen / 8GB / 256GB SSD",
    brand: "Dell", category: "laptops", price: 38500, originalPrice: 52000,
    rating: 4.6, reviews: 218, sold: 940, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopDell, stock: 9,
    condition: "Used - Like New",
    description: "12.5\" business ultrabook. Intel Core i5-6300U, 8GB DDR4, 256GB NVMe SSD, backlit keyboard, fingerprint reader. Imported stock, A-grade condition.",
  },
  {
    id: "u2", slug: "hp-elitebook-840-g3-i5-6th-used",
    title: "HP EliteBook 840 G3 Core i5 6th Gen / 8GB / 256GB SSD",
    brand: "HP", category: "laptops", price: 36500, originalPrice: 49000,
    rating: 4.7, reviews: 412, sold: 1530, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopHp, stock: 14,
    condition: "Used - Like New",
    description: "14\" FHD business laptop. i5-6300U, 8GB RAM, 256GB SSD, backlit keys, ~6hr battery. Genuine A-grade import.",
  },
  {
    id: "u3", slug: "lenovo-thinkpad-t460-i5-6th-used",
    title: "Lenovo ThinkPad T460 Core i5 6th Gen / 8GB / 256GB SSD",
    brand: "Lenovo", category: "laptops", price: 35000, originalPrice: 47000,
    rating: 4.8, reviews: 524, sold: 2120, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopThinkpad, stock: 17,
    condition: "Used - Like New",
    description: "Legendary ThinkPad keyboard, 14\" HD, i5-6300U, 8GB DDR4, 256GB SSD, dual battery — ideal for students & office use.",
  },
  {
    id: "u4", slug: "hp-elitebook-840-g4-i5-7th-used",
    title: "HP EliteBook 840 G4 Core i5 7th Gen / 8GB / 256GB SSD",
    brand: "HP", category: "laptops", price: 42500, originalPrice: 58000,
    rating: 4.7, reviews: 380, sold: 1240, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopWork, stock: 11,
    condition: "Used - Like New",
    description: "14\" FHD slim business laptop. Intel Core i5-7300U, 8GB DDR4, 256GB NVMe SSD, backlit keyboard, fingerprint scanner.",
  },
  {
    id: "u5", slug: "dell-latitude-7480-i5-7th-used",
    title: "Dell Latitude 7480 Core i5 7th Gen / 8GB / 256GB SSD",
    brand: "Dell", category: "laptops", price: 44000, originalPrice: 60000,
    rating: 4.8, reviews: 296, sold: 1080, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopBlack, stock: 8,
    condition: "Used - Like New",
    description: "14\" FHD ultraportable. i5-7300U, 8GB, 256GB SSD, backlit keys, premium aluminium body — Pakistan's best-selling import.",
  },
  {
    id: "u6", slug: "lenovo-thinkpad-t470-i5-7th-used",
    title: "Lenovo ThinkPad T470 Core i5 7th Gen / 8GB / 256GB SSD",
    brand: "Lenovo", category: "laptops", price: 43500, originalPrice: 57000,
    rating: 4.9, reviews: 612, sold: 2480, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopLenovo, stock: 21,
    condition: "Used - Like New",
    description: "14\" business laptop with i5-7300U, 8GB DDR4, 256GB NVMe, backlit keyboard, dual battery — most reliable used choice.",
  },
  {
    id: "u7", slug: "dell-latitude-e7470-i7-6th-used",
    title: "Dell Latitude E7470 Core i7 6th Gen / 16GB / 512GB SSD",
    brand: "Dell", category: "laptops", price: 52000, originalPrice: 72000,
    rating: 4.7, reviews: 184, sold: 720, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopSilver, stock: 6,
    condition: "Used - Like New",
    description: "14\" FHD premium ultrabook. i7-6600U, 16GB DDR4, 512GB NVMe SSD, backlit keyboard, fingerprint reader.",
  },
  {
    id: "u8", slug: "hp-probook-440-g3-i3-6th-used",
    title: "HP ProBook 440 G3 Core i3 6th Gen / 4GB / 256GB SSD",
    brand: "HP", category: "laptops", price: 26500, originalPrice: 36000,
    rating: 4.4, reviews: 342, sold: 1620, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopOpen, stock: 19,
    condition: "Used - Good",
    description: "Budget-friendly 14\" laptop for students. Intel i3-6100U, 4GB RAM, 256GB SSD upgrade. Perfect for office & online classes.",
  },
  {
    id: "u9", slug: "lenovo-thinkpad-x270-i5-6th-used",
    title: "Lenovo ThinkPad X270 Core i5 6th Gen / 8GB / 256GB SSD",
    brand: "Lenovo", category: "laptops", price: 39500, originalPrice: 53000,
    rating: 4.8, reviews: 268, sold: 980, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopBlack, stock: 12,
    condition: "Used - Like New",
    description: "Compact 12.5\" ultraportable. i5-6300U, 8GB, 256GB NVMe, dual battery — ideal travel companion.",
  },
  {
    id: "u10", slug: "dell-latitude-5480-i5-7th-used",
    title: "Dell Latitude 5480 Core i5 7th Gen / 8GB / 256GB SSD",
    brand: "Dell", category: "laptops", price: 41000, originalPrice: 55000,
    rating: 4.6, reviews: 224, sold: 860, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopDell, stock: 15,
    condition: "Used - Like New",
    description: "14\" business laptop. i5-7300U, 8GB DDR4, 256GB SSD, backlit keyboard. Excellent battery health.",
  },
  {
    id: "u11", slug: "hp-elitebook-820-g3-i5-6th-used",
    title: "HP EliteBook 820 G3 Core i5 6th Gen / 8GB / 256GB SSD",
    brand: "HP", category: "laptops", price: 34500, originalPrice: 46000,
    rating: 4.5, reviews: 192, sold: 740, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopHp, stock: 13,
    condition: "Used - Like New",
    description: "12.5\" compact business ultrabook. i5-6300U, 8GB, 256GB SSD, backlit keyboard, fingerprint reader.",
  },
  {
    id: "u12", slug: "lenovo-thinkpad-l470-i5-7th-used",
    title: "Lenovo ThinkPad L470 Core i5 7th Gen / 8GB / 256GB SSD",
    brand: "Lenovo", category: "laptops", price: 38000, originalPrice: 51000,
    rating: 4.6, reviews: 158, sold: 620, badge: "USED",
    gradient: grads[5], emoji: "💻", image: IMG.laptopLenovo, stock: 10,
    condition: "Used - Like New",
    description: "14\" durable business laptop. i5-7200U, 8GB DDR4, 256GB SSD — built to last with ThinkPad reliability.",
  },

  // ===== PRINTERS =====
  {
    id: "p1", slug: "hp-laserjet-pro-m404n",
    title: "HP LaserJet Pro M404n Mono Laser Printer",
    brand: "HP", category: "printers", price: 47000, originalPrice: 55000,
    rating: 4.6, reviews: 312, sold: 1840, badge: "-15%",
    gradient: grads[1], emoji: "🖨️", image: IMG.printerHp, stock: 24,
    description: "Fast, reliable monochrome laser printing. Up to 38 ppm with Ethernet networking and easy mobile printing.",
  },
  {
    id: "p2", slug: "epson-ecotank-l3250",
    title: "Epson EcoTank L3250 Wi-Fi All-in-One Printer",
    brand: "Epson", category: "printers", price: 42000, originalPrice: 49000,
    rating: 4.7, reviews: 528, sold: 2410, badge: "SALE",
    gradient: grads[1], emoji: "🖨️", image: IMG.printerEpson, stock: 31,
    description: "Cartridge-free printing with high-capacity ink tanks. Print, scan, copy with seamless Wi-Fi.",
  },
  {
    id: "p13", slug: "hp-laserjet-1006-used",
    title: "HP LaserJet P1006 Mono Printer (Used)",
    brand: "HP", category: "printers", price: 9500, originalPrice: 14000,
    rating: 4.5, reviews: 612, sold: 3120, badge: "USED",
    gradient: grads[1], emoji: "🖨️", image: IMG.printerMono, stock: 38,
    condition: "Used - Good",
    description: "Reliable compact mono laser printer for home & small office. New toner included, tested 100%.",
  },
  {
    id: "p14", slug: "canon-lbp-2900-used",
    title: "Canon LBP 2900 Mono Laser Printer (Used)",
    brand: "Canon", category: "printers", price: 11500, originalPrice: 16000,
    rating: 4.6, reviews: 824, sold: 4210, badge: "USED",
    gradient: grads[1], emoji: "🖨️", image: IMG.printerCanon, stock: 42,
    condition: "Used - Good",
    description: "Pakistan's most popular office printer. Fast B&W, low running cost, fresh toner, 90-day warranty.",
  },
  {
    id: "p15", slug: "hp-laserjet-m1136-mfp",
    title: "HP LaserJet M1136 MFP — Print, Scan, Copy",
    brand: "HP", category: "printers", price: 32500, originalPrice: 38000,
    rating: 4.7, reviews: 1240, sold: 5680, badge: "HOT",
    gradient: grads[1], emoji: "🖨️", image: IMG.printerOffice, stock: 27,
    description: "All-in-one mono laser printer. Print, scan and copy with high-speed performance. Perfect for SOHO.",
  },
  {
    id: "p16", slug: "canon-pixma-g2010-tank",
    title: "Canon PIXMA G2010 Ink Tank All-in-One Printer",
    brand: "Canon", category: "printers", price: 36500, originalPrice: 42000,
    rating: 4.6, reviews: 482, sold: 1980, badge: "SALE",
    gradient: grads[1], emoji: "🖨️", image: IMG.printerCanon, stock: 19,
    description: "Refillable ink-tank colour printer. Ultra low-cost printing for office and home photos.",
  },

  // ===== EXISTING NEW PRODUCTS =====
  { id: "p3", slug: "anker-737-power-bank", title: "Anker 737 PowerCore 24K Portable Charger", brand: "Anker", category: "accessories", price: 32000, originalPrice: 38000, rating: 4.8, reviews: 1204, sold: 5630, badge: "HOT", gradient: grads[5], emoji: "🔋", image: IMG.powerbank, stock: 47, description: "140W tri-port power bank with 24,000mAh capacity. Charge laptops, phones and tablets at full speed." },
  { id: "p4", slug: "anker-soundcore-bt", title: "Anker Soundcore Bluetooth Speaker", brand: "Anker", category: "speakers", price: 9400, originalPrice: 12000, rating: 4.5, reviews: 2104, sold: 8940, badge: "-20%", gradient: grads[2], emoji: "🔊", image: IMG.speaker, stock: 89, description: "Punchy bass, 24-hour battery, IPX7 waterproof. The portable speaker that goes everywhere." },
  { id: "p5", slug: "apple-airpods-pro-2", title: "Apple AirPods Pro 2nd Generation", brand: "Apple", category: "headphones", price: 62000, originalPrice: 72000, rating: 4.9, reviews: 3241, sold: 12450, badge: "NEW", gradient: grads[0], emoji: "🎧", image: IMG.airpods, stock: 18, description: "Active Noise Cancellation, Adaptive Audio, personalized Spatial Audio with H2 chip." },
  { id: "p6", slug: "ugreen-usb-c-dock", title: "UGREEN USB-C 9-in-1 Docking Station", brand: "UGREEN", category: "accessories", price: 18900, originalPrice: 24000, rating: 4.7, reviews: 892, sold: 3120, badge: "SALE", gradient: grads[5], emoji: "🔌", image: IMG.dock, stock: 56, description: "Expand your laptop with HDMI 4K, Ethernet, USB 3.0, SD reader and 100W PD." },
  { id: "p7", slug: "logitech-mx-anywhere-3s", title: "Logitech MX Anywhere 3S Wireless Mouse", brand: "Logitech", category: "mouse-keyboard", price: 14900, originalPrice: 17500, rating: 4.8, reviews: 1532, sold: 6420, badge: "-15%", gradient: grads[5], emoji: "🖱️", image: IMG.mouse, stock: 73, description: "Compact performance mouse with 8K DPI tracking, MagSpeed scrolling and multi-device pairing." },
  { id: "p8", slug: "keychron-k8-pro", title: "Keychron K8 Pro Mechanical Keyboard", brand: "Keychron", category: "mouse-keyboard", price: 28500, originalPrice: 34000, rating: 4.7, reviews: 921, sold: 2840, badge: "HOT", gradient: grads[1], emoji: "⌨️", image: IMG.keyboard, stock: 22, description: "Hot-swappable wireless mechanical keyboard with QMK/VIA, RGB and aluminum frame." },
  { id: "p9", slug: "lenovo-legion-5-pro", title: "Lenovo Legion 5 Pro Ryzen 7 RTX 4060 Gaming Laptop", brand: "Lenovo", category: "laptops", price: 389000, originalPrice: 425000, rating: 4.8, reviews: 287, sold: 540, badge: "-15%", gradient: grads[3], emoji: "💻", image: IMG.laptopGaming, stock: 8, description: "Ryzen 7, RTX 4060, 16GB DDR5, 16\" 165Hz QHD display." },
  { id: "p10", slug: "hp-pavilion-gaming-15", title: "HP Pavilion Gaming 15.6\" Core i7 RTX 3050", brand: "HP", category: "laptops", price: 185000, originalPrice: 215000, rating: 4.6, reviews: 412, sold: 1120, badge: "SALE", gradient: grads[3], emoji: "💻", image: IMG.laptopLegion, stock: 14, description: "144Hz gaming with Core i7, RTX 3050, 16GB RAM and NVMe storage." },
  { id: "p11", slug: "jbl-flip-6", title: "JBL Flip 6 Portable Bluetooth Speaker", brand: "JBL", category: "speakers", price: 28500, originalPrice: 33000, rating: 4.7, reviews: 1840, sold: 7230, badge: "-15%", gradient: grads[2], emoji: "🔊", image: IMG.jbl, stock: 41, description: "Bold sound, 12 hours of playtime, IP67 waterproof and PartyBoost ready." },
  { id: "p12", slug: "razer-deathadder-v3", title: "Razer DeathAdder V3 Pro Wireless Gaming Mouse", brand: "Razer", category: "mouse-keyboard", price: 38000, originalPrice: 44000, rating: 4.8, reviews: 654, sold: 1890, badge: "NEW", gradient: grads[2], emoji: "🖱️", image: IMG.mouse, stock: 19, description: "Esports-grade ergonomic wireless mouse, 30K Focus Pro sensor, 90-hour battery life." },

  // ===== UNDER Rs. 1,000 — Daily-use small electronics =====
  { id: "s1", slug: "otg-usb-c-adapter", title: "OTG USB-C to USB 3.0 Adapter", brand: "UGREEN", category: "accessories", price: 350, originalPrice: 600, rating: 4.5, reviews: 1820, sold: 9400, badge: "-40%", gradient: grads[0], emoji: "🔌", image: u("1625948515291-69613efd103f"), stock: 240, description: "Compact OTG adapter to connect USB flash drives, keyboards and mice to USB-C phones and laptops." },
  { id: "s2", slug: "mobile-ring-holder", title: "360° Metal Ring Holder & Phone Stand", brand: "Generic", category: "accessories", price: 199, originalPrice: 450, rating: 4.3, reviews: 3240, sold: 18200, badge: "-55%", gradient: grads[3], emoji: "📱", image: u("1592434134753-a70baf7979d5"), stock: 410, description: "Magnetic finger-ring grip with 360° rotation. Doubles as a kickstand for any smartphone." },
  { id: "s3", slug: "usb-led-light", title: "USB Mini LED Light for Laptop / Power Bank", brand: "Generic", category: "accessories", price: 249, originalPrice: 500, rating: 4.4, reviews: 2104, sold: 14250, badge: "-50%", gradient: grads[1], emoji: "💡", image: u("1518770660439-4636190af475"), stock: 320, description: "Flexible neck USB LED reading light. Perfect for laptops, power banks and night study." },
  { id: "s4", slug: "type-c-cable-1m", title: "Type-C Fast Charging Cable 1M (3A)", brand: "Anker", category: "accessories", price: 499, originalPrice: 900, rating: 4.7, reviews: 5240, sold: 28400, badge: "HOT", gradient: grads[4], emoji: "🔌", image: u("1583394838336-acd977736f90"), stock: 580, description: "Premium braided USB-A to Type-C cable. Supports up to 3A fast charging and high-speed data transfer." },
  { id: "s5", slug: "earphones-wired-hifi", title: "HiFi Wired Earphones with Mic", brand: "OEM", category: "headphones", price: 699, originalPrice: 1200, rating: 4.4, reviews: 4120, sold: 21300, badge: "SALE", gradient: grads[2], emoji: "🎧", image: u("1505740420928-5e560c06d30e"), stock: 480, description: "Deep bass in-ear earphones with built-in microphone. Compatible with all 3.5mm devices." },
  { id: "s6", slug: "mouse-pad-large", title: "Anti-Slip Mouse Pad (Large 30x25cm)", brand: "OEM", category: "mouse-keyboard", price: 299, originalPrice: 600, rating: 4.5, reviews: 1620, sold: 8420, badge: "-50%", gradient: grads[5], emoji: "🖱️", image: u("1527864550417-7fd91fc51a46"), stock: 290, description: "Smooth-glide mouse pad with non-slip rubber base. Ideal for office and gaming." },
  { id: "s7", slug: "laptop-cooling-pad", title: "Mini Laptop Cooling Pad USB Fan", brand: "Generic", category: "accessories", price: 899, originalPrice: 1500, rating: 4.3, reviews: 980, sold: 5240, badge: "SALE", gradient: grads[1], emoji: "🌀", image: u("1517336714731-489689fd1ca8"), stock: 140, description: "USB-powered cooling pad to keep your laptop temperature down during long work sessions." },
  { id: "s8", slug: "card-reader-usb", title: "All-in-One USB Card Reader (SD / Micro SD / TF)", brand: "UGREEN", category: "accessories", price: 549, originalPrice: 1000, rating: 4.6, reviews: 2240, sold: 11800, badge: "-45%", gradient: grads[0], emoji: "💾", image: u("1625948515291-69613efd103f"), stock: 360, description: "Plug-and-play multi-slot card reader. Reads SD, Micro SD and TF cards over USB 2.0." },
  { id: "s9", slug: "phone-stand-aluminium", title: "Aluminium Phone & Tablet Stand", brand: "Generic", category: "accessories", price: 799, originalPrice: 1400, rating: 4.7, reviews: 1480, sold: 6920, badge: "HOT", gradient: grads[5], emoji: "📱", image: u("1592434134753-a70baf7979d5"), stock: 220, description: "Heavy-duty aluminium desk stand. Adjustable angle, fits phones up to 13\" tablets." },
  { id: "s10", slug: "lan-cable-3m", title: "CAT-6 LAN Ethernet Cable — 3 Meters", brand: "D-Link", category: "networking", price: 399, originalPrice: 700, rating: 4.5, reviews: 1140, sold: 5840, badge: "SALE", gradient: grads[4], emoji: "📡", image: u("1606765962248-7ff407b51667"), stock: 330, description: "High-speed CAT-6 Gigabit Ethernet cable. Snag-less RJ45 connectors, 3 meter length." },
];

export function getProduct(slug: string) {
  return products.find((p) => p.slug === slug);
}

export function relatedProducts(category: string, excludeId: string, limit = 4) {
  return products.filter((p) => p.category === category && p.id !== excludeId).slice(0, limit);
}

export function formatPrice(n: number) {
  return `Rs. ${n.toLocaleString("en-PK")}`;
}
