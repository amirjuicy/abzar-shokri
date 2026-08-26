/* ================================================================
   Abzar Shokri — Mock Data
   ================================================================ */

const AppData = {
  categories: [
    { id: 1, name: 'ابزار برقی', icon: 'bolt', count: 245, slug: 'power-tools' },
    { id: 2, name: 'ابزار دستی', icon: 'wrench', count: 189, slug: 'hand-tools' },
    { id: 3, name: 'ابزار برش', icon: 'scissors', count: 156, slug: 'cutting-tools' },
    { id: 4, name: 'ابزار اندازه‌گیری', icon: 'ruler', count: 98, slug: 'measuring-tools' },
    { id: 5, name: 'لوازم جانبی', icon: 'puzzle', count: 312, slug: 'accessories' },
    { id: 6, name: 'ایمنی و حفاظت', icon: 'shield', count: 134, slug: 'safety' },
    { id: 7, name: 'ابزار نجاری', icon: 'tree', count: 87, slug: 'woodworking' },
    { id: 8, name: 'ابزار آهنگری', icon: 'anvil', count: 65, slug: 'metalworking' },
    { id: 9, name: 'ابزار لوله‌کشی', icon: 'pipe', count: 78, slug: 'plumbing' },
    { id: 10, name: 'ابزار باغبانی', icon: 'leaf', count: 112, slug: 'gardening' },
    { id: 11, name: 'رنگ و پوشش', icon: 'paintbrush', count: 94, slug: 'paint' },
    { id: 12, name: 'ابزار تعمیرگاهی', icon: 'garage', count: 143, slug: 'workshop' }
  ],

  brands: [
    { id: 1, name: 'bosch', displayName: 'بوش', country: 'آلمان' },
    { id: 2, name: 'makita', displayName: 'ماکیتا', country: 'ژاپن' },
    { id: 3, name: 'dewalt', displayName: 'دیوالت', country: 'آمریکا' },
    { id: 4, name: 'milwaukee', displayName: 'میلواکی', country: 'آمریکا' },
    { id: 5, name: 'stanley', displayName: 'استنلی', country: 'آمریکا' },
    { id: 6, name: 'matabo', displayName: 'متابو', country: 'آلمان' },
    { id: 7, name: 'total', displayName: 'توتال', country: 'چین' },
    { id: 8, name: 'ingco', displayName: 'اینگکو', country: 'چین' },
    { id: 9, name: 'reyal', displayName: 'ریال', country: 'ایران' },
    { id: 10, name: 'sepco', displayName: 'سپکو', country: 'ایران' },
    { id: 11, name: 'dongcheng', displayName: 'دونگ‌چنگ', country: 'چین' },
    { id: 12, name: 'einhell', displayName: 'اینهل', country: 'آلمان' }
  ],

  products: [
    {
      id: 1,
      name: 'دریل شارژی بوش مدل GSR 180-LI',
      brand: 'bosch',
      brandName: 'بوش',
      category: 'ابزار برقی',
      price: 2850000,
      oldPrice: 3200000,
      rating: 4.5,
      reviewCount: 128,
      discount: 11,
      isNew: false,
      isBestSeller: true,
      image: null
    },
    {
      id: 2,
      name: 'اره دیسکی ماکیتا مدل 5903B',
      brand: 'makita',
      brandName: 'ماکیتا',
      category: 'ابزار برش',
      price: 4500000,
      oldPrice: null,
      rating: 4.8,
      reviewCount: 89,
      discount: 0,
      isNew: false,
      isBestSeller: true,
      image: null
    },
    {
      id: 3,
      name: 'پیچ‌گوشتی شارژی دیوالت DCD771',
      brand: 'dewalt',
      brandName: 'دیوالت',
      category: 'ابزار برقی',
      price: 1950000,
      oldPrice: 2100000,
      rating: 4.3,
      reviewCount: 234,
      discount: 7,
      isNew: false,
      isBestSeller: true,
      image: null
    },
    {
      id: 4,
      name: 'دریل پیچ‌گوشتی میلواکی M18 FUEL',
      brand: 'milwaukee',
      brandName: 'میلواکی',
      category: 'ابزار برقی',
      price: 5200000,
      oldPrice: 5800000,
      rating: 4.9,
      reviewCount: 67,
      discount: 10,
      isNew: true,
      isBestSeller: false,
      image: null
    },
    {
      id: 5,
      name: 'ست آچار استنلی ۱۰ پارچه',
      brand: 'stanley',
      brandName: 'استنلی',
      category: 'ابزار دستی',
      price: 850000,
      oldPrice: null,
      rating: 4.2,
      reviewCount: 312,
      discount: 0,
      isNew: false,
      isBestSeller: true,
      image: null
    },
    {
      id: 6,
      name: 'سنباده متابو مدل WEV 17-125 Quick',
      brand: 'matabo',
      brandName: 'متابو',
      category: 'ابزار برقی',
      price: 3800000,
      oldPrice: 4200000,
      rating: 4.7,
      reviewCount: 45,
      discount: 10,
      isNew: false,
      isBestSeller: false,
      image: null
    },
    {
      id: 7,
      name: 'جعبه ابزار توتال مدل ۱۵۰ پارچه',
      brand: 'total',
      brandName: 'توتال',
      category: 'لوازم جانبی',
      price: 1200000,
      oldPrice: 1450000,
      rating: 4.0,
      reviewCount: 178,
      discount: 17,
      isNew: false,
      isBestSeller: false,
      image: null
    },
    {
      id: 8,
      name: 'دریل چکشی اینگکو مدل ED5218',
      brand: 'ingco',
      brandName: 'اینگکو',
      category: 'ابزار برقی',
      price: 980000,
      oldPrice: null,
      rating: 3.9,
      reviewCount: 89,
      discount: 0,
      isNew: true,
      isBestSeller: false,
      image: null
    },
    {
      id: 9,
      name: 'متر لیزری ریال مدل ۴۰ متری',
      brand: 'reyal',
      brandName: 'ریال',
      category: 'ابزار اندازه‌گیری',
      price: 1650000,
      oldPrice: 1800000,
      rating: 4.4,
      reviewCount: 56,
      discount: 8,
      isNew: false,
      isBestSeller: false,
      image: null
    },
    {
      id: 10,
      name: 'کلاه ایمنی سپکو مدل HardHat',
      brand: 'sepco',
      brandName: 'سپکو',
      category: 'ایمنی و حفاظت',
      price: 120000,
      oldPrice: null,
      rating: 4.1,
      reviewCount: 234,
      discount: 0,
      isNew: false,
      isBestSeller: true,
      image: null
    },
    {
      id: 11,
      name: 'اره عمود بر دونگ‌چنگ مدل J0Z-FC',
      brand: 'dongcheng',
      brandName: 'دونگ‌چنگ',
      category: 'ابزار برش',
      price: 1350000,
      oldPrice: 1500000,
      rating: 4.2,
      reviewCount: 78,
      discount: 10,
      isNew: false,
      isBestSeller: false,
      image: null
    },
    {
      id: 12,
      name: 'تراز لیزری اینهل مدل PM 30',
      brand: 'einhell',
      brandName: 'اینهل',
      category: 'ابزار اندازه‌گیری',
      price: 2100000,
      oldPrice: 2400000,
      rating: 4.6,
      reviewCount: 34,
      discount: 13,
      isNew: true,
      isBestSeller: false,
      image: null
    },
    {
      id: 13,
      name: 'چسب‌کاری بوش مدل GCF 200',
      brand: 'bosch',
      brandName: 'بوش',
      category: 'ابزار برقی',
      price: 780000,
      oldPrice: null,
      rating: 4.3,
      reviewCount: 145,
      discount: 0,
      isNew: false,
      isBestSeller: false,
      image: null
    },
    {
      id: 14,
      name: 'انبردست ماکیتا مدل ۲۵۰ میلیمتری',
      brand: 'makita',
      brandName: 'ماکیتا',
      category: 'ابزار دستی',
      price: 320000,
      oldPrice: 380000,
      rating: 4.1,
      reviewCount: 98,
      discount: 16,
      isNew: false,
      isBestSeller: false,
      image: null
    },
    {
      id: 15,
      name: 'گونیای دیوالت مدل DW488',
      brand: 'dewalt',
      brandName: 'دیوالت',
      category: 'ابزار دستی',
      price: 210000,
      oldPrice: null,
      rating: 4.5,
      reviewCount: 67,
      discount: 0,
      isNew: false,
      isBestSeller: false,
      image: null
    }
  ],

  articles: [
    {
      id: 1,
      title: 'راهنمای خرید دریل شارژی مناسب',
      excerpt: 'انتخاب دریل شارژی مناسب نیاز به بررسی عوامل مختلفی از جمله ولتاژ باتری، گشتاور و کاربرد مورد نظر دارد.',
      category: 'راهنمای خرید',
      date: '۱۵ مرداد ۱۴۰۵',
      readTime: '۵ دقیقه',
      image: null
    },
    {
      id: 2,
      title: 'نکات مهم در نگهداری ابزار برقی',
      excerpt: 'نگهداری صحیح از ابزار برقی عمر مفید آن‌ها را افزایش می‌دهد و از خرابی زودهنگام جلوگیری می‌کند.',
      category: 'آموزشی',
      date: '۱۲ مرداد ۱۴۰۵',
      readTime: '۴ دقیقه',
      image: null
    },
    {
      id: 3,
      title: 'مقایسه برندهای ابزار: بوش یا ماکیتا؟',
      excerpt: 'بررسی تفصیلی و مقایسه دو برند مطرح بازار ابزار ایران از نظر کیفیت، قیمت و خدمات پس از فروش.',
      category: 'مقایسه',
      date: '۱۰ مرداد ۱۴۰۵',
      readTime: '۷ دقیقه',
      image: null
    },
    {
      id: 4,
      title: 'ابزار ضروری برای کارگاه نجاری',
      excerpt: 'لیست کامل ابزار مورد نیاز برای راه‌اندازی یک کارگاه نجاری حرفه‌ای با بودجه‌های مختلف.',
      category: 'آموزشی',
      date: '۸ مرداد ۱۴۰۵',
      readTime: '۶ دقیقه',
      image: null
    },
    {
      id: 5,
      title: 'ایمنی در استفاده از ابزار برش',
      excerpt: 'رعایت نکات ایمنی هنگام کار با ابزار برش از اهمیت بالایی برخوردار است و از بروز حوادث جلوگیری می‌کند.',
      category: 'ایمنی',
      date: '۵ مرداد ۱۴۰۵',
      readTime: '۳ دقیقه',
      image: null
    },
    {
      id: 6,
      title: 'معرفی جدیدترین ابزارهای ۲۰۲۶',
      excerpt: 'نگاهی به جدیدترین ابزارهای عرضه شده در بازار ایران در سال جاری و ویژگی‌های منحصربه‌فرد آن‌ها.',
      category: 'اخبار',
      date: '۳ مرداد ۱۴۰۵',
      readTime: '۵ دقیقه',
      image: null
    }
  ],

  searchSuggestions: [
    'دریل شارژی',
    'اره دیسکی',
    'پیچ‌گوشتی',
    'آچار',
    'متر',
    'کلاه ایمنی',
    'دستکش کار',
    'عینک ایمنی'
  ]
};

/* ================================================================
   Format helpers
   ================================================================ */
const Format = {
  price(value) {
    return new Intl.NumberFormat('fa-IR').format(value);
  },

  priceWithCurrency(value) {
    return `${this.price(value)} تومان`;
  },

  rating(value) {
    const full = Math.floor(value);
    const half = value % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    return { full, half, empty };
  }
};
