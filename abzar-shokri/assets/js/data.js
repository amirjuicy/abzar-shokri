/* ================================================================
   Abzar Shokri — Mock Data (Expanded for Phase 3)
   ================================================================ */

const AppData = {
  categories: [
    { id: 1, name: 'ابزار برقی', icon: 'bolt', count: 245, slug: 'power-tools', description: 'مجموعه کامل ابزارهای برقی حرفه‌ای شامل دریل، اره، سنگ فرز و سایر ابزارهای برقی' },
    { id: 2, name: 'ابزار شارژی', icon: 'bolt', count: 189, slug: 'cordless-tools', description: 'ابزارهای شارژی با باتری قابل شارژ مناسب برای کار در محل‌های بدون برق' },
    { id: 3, name: 'ابزار دستی', icon: 'wrench', count: 156, slug: 'hand-tools', description: 'ابزارهای دستی شامل آچار، پیچ‌گوشتی، انبر و سایر ابزارهای دستی' },
    { id: 4, name: 'ابزار برش', icon: 'scissors', count: 98, slug: 'cutting-tools', description: 'ابزارهای برش شامل اره، تیغ اره، دیسک برش و متعلقات' },
    { id: 5, name: 'ابزار اندازه‌گیری', icon: 'ruler', count: 112, slug: 'measuring-tools', description: 'ابزارهای اندازه‌گیری شامل متر، تراز، گونیا و تجهیزات دقیق' },
    { id: 6, name: 'لوازم جانبی', icon: 'puzzle', count: 312, slug: 'accessories', description: 'لوازم جانبی ابزار شامل مته، دیسک، تیغ و سایر مصرفی‌ها' },
    { id: 7, name: 'ایمنی و حفاظت', icon: 'shield', count: 134, slug: 'safety', description: 'تجهیزات ایمنی و حفاظت فردی شامل کلاه ایمنی، دستکش، عینک و لباس کار' },
    { id: 8, name: 'ابزار نجاری', icon: 'tree', count: 87, slug: 'woodworking', description: 'ابزار تخصصی نجاری شامل اره نجاری، کام‌بازکن، رنده و سایر ابزارها' },
    { id: 9, name: 'تجهیزات کارگاهی', icon: 'garage', count: 143, slug: 'workshop', description: 'تجهیزات و ماشین‌آلات کارگاهی شامل میز کار، سنگ‌ساب و وسایل جانبی' },
    { id: 10, name: 'ابزار آهنگری', icon: 'anvil', count: 65, slug: 'metalworking', description: 'ابزار تخصصی آهنگری و فلزکاری' },
    { id: 11, name: 'ابزار لوله‌کشی', icon: 'pipe', count: 78, slug: 'plumbing', description: 'ابزار لوله‌کشی شامل آچار فرانسه، لوله‌بازکن و ابزار تخصصی' },
    { id: 12, name: 'ابزار باغبانی', icon: 'leaf', count: 112, slug: 'gardening', description: 'ابزار باغبانی شامل اره باغبانی، قیچی، کود و آبیاری' }
  ],

  brands: [
    { id: 1, name: 'bosch', displayName: 'بوش', country: 'آلمان', description: 'بوش یکی از بزرگترین تولیدکنندگان ابزارآلات صنعتی در جهان با بیش از ۱۳۰ سال سابقه.' },
    { id: 2, name: 'makita', displayName: 'ماکیتا', country: 'ژاپن', description: 'ماکیتا برند ژاپنی مطرح در زمینه ابزارآلات برقی و شارژی با کیفیت ساخت بالا.' },
    { id: 3, name: 'dewalt', displayName: 'دیوالت', country: 'آمریکا', description: 'دیوالت یکی از معروف‌ترین برندهای ابزارآلات حرفه‌ای با رنگ زرد شناخته شده.' },
    { id: 4, name: 'milwaukee', displayName: 'میلواکی', country: 'آمریکا', description: 'میلواکی برند آمریکایی تخصصی در زمینه ابزارآلات برقی و شارژی حرفه‌ای.' },
    { id: 5, name: 'stanley', displayName: 'استنلی', country: 'آمریکا', description: 'استنلی یکی از قدیمی‌ترین و محبوب‌ترین برندهای ابزارآلات دستی و برقی.' },
    { id: 6, name: 'matabo', displayName: 'متابو', country: 'آلمان', description: 'متابو برند آلمانی متخصص در ابزارهای برقی صنعتی با دوام بالا.' },
    { id: 7, name: 'total', displayName: 'توتال', country: 'چین', description: 'توتال برند چینی با کیفیت مناسب و قیمت رقابتی.' },
    { id: 8, name: 'ingco', displayName: 'اینگکو', country: 'چین', description: 'اینگکو برند بین‌المللی ابزارآلات با تمرکز بر کیفیت و نوآوری.' },
    { id: 9, name: 'reyal', displayName: 'ریال', country: 'ایران', description: 'ریال برند ایرانی تولیدکننده ابزارآلات و تجهیزات اندازه‌گیری.' },
    { id: 10, name: 'sepco', displayName: 'سپکو', country: 'ایران', description: 'سپکو تولیدکننده ایرانی تجهیزات ایمنی و حفاظت فردی.' },
    { id: 11, name: 'dongcheng', displayName: 'دونگ‌چنگ', country: 'چین', description: 'دونگ‌چنگ برند چینی مطرح در تولید ابزارهای برقی صنعتی.' },
    { id: 12, name: 'einhell', displayName: 'اینهل', country: 'آلمان', description: 'اینهل برند آلمانی تولیدکننده ابزارهای برقی و باغبانی.' },
    { id: 13, name: 'hikoki', displayName: 'هیتاچی', country: 'ژاپن', description: 'هیتاچی (هیکوکی) برند ژاپنی با سابقه طولانی در تولید ابزارآلات صنعتی.' },
    { id: 14, name: 'crown', displayName: 'کرون', country: 'چین', description: 'کرون برند ابزارآلات اقتصادی با کیفیت مناسب.' }
  ],

  products: [
    { id: 1, name: 'دریل شارژی بوش مدل GSR 180-LI', slug: 'bosch-gsr-180-li', brand: 'bosch', brandName: 'بوش', category: 'ابزار شارژی', categorySlug: 'cordless-tools', image: 'assets/images/products/bosch-gsr-180-li.svg', images: ['assets/images/products/bosch-gsr-180-li.svg'], categoryId: 2, price: 2850000, oldPrice: 3200000, rating: 4.5, reviewCount: 128, discount: 11, isNew: false, isBestSeller: true, inStock: true, sku: 'BSH-GSR180', shortDescription: 'دریل شارژی بوش با ولتاژ ۱۸ ولت و گشتاور بالا مناسب برای کارهای حرفه‌ای و خانگی.', description: 'دریل شارژی بوش مدل GSR 180-LI با ولتاژ ۱۸ ولت و باتری لیتیوم-یون قابلیت ارائه گشتاور بالا را دارد.', specs: { 'ولتاژ': '۱۸ ولت', 'ظرفیت باتری': '۱.۵ آمپر ساعت', 'حداکثر قطر سوراخکاری': '۳۵ میلیمتر', 'گشتاور': '۳۰ نیوتن‌متر', 'وزن': '۱.۵ کیلوگرم', 'سه‌نظام': '۱۰ میلیمتر اتوماتیک' } },
    { id: 2, name: 'اره دیسکی ماکیتا مدل 5903B', slug: 'makita-5903b', brand: 'makita', brandName: 'ماکیتا', category: 'ابزار برش', categorySlug: 'cutting-tools', image: 'assets/images/products/makita-5903b.svg', images: ['assets/images/products/makita-5903b.svg'], categoryId: 4, price: 4500000, oldPrice: null, rating: 4.8, reviewCount: 89, discount: 0, isNew: false, isBestSeller: true, inStock: true, sku: 'MKT-5903B', shortDescription: 'اره دیسکی ماکیتا با توان ۲۰۰۰ وات و قطر تیغ ۲۵۵ میلیمتر.', description: 'اره دیسکی ماکیتا 5903B یک اره حرفه‌ای با توان ۲۰۰۰ وات برای برش فلزات و سنگ.', specs: { 'توان': '۲۰۰۰ وات', 'قطر تیغ': '۲۵۵ میلیمتر', 'حداکثر عمق برش': '۸۵ میلیمتر', 'سرعت': '۲۸۰۰ دور در دقیقه', 'وزن': '۶.۵ کیلوگرم' } },
    { id: 3, name: 'پیچ‌گوشتی شارژی دیوالت DCD771', slug: 'dewalt-dcd771', brand: 'dewalt', brandName: 'دیوالت', category: 'ابزار شارژی', categorySlug: 'cordless-tools', image: 'assets/images/products/dewalt-dcd771.svg', images: ['assets/images/products/dewalt-dcd771.svg'], categoryId: 2, price: 1950000, oldPrice: 2100000, rating: 4.3, reviewCount: 234, discount: 7, isNew: false, isBestSeller: true, inStock: true, sku: 'DWT-DCD771', shortDescription: 'پیچ‌گوشتی شارژی دیوالت با طراحی ارگونومیک و باتری ۱۸ ولت.', description: 'پیچ‌گوشتی شارژی دیوالت DCD771 با طراحی سبک و ارگونومیک مناسب کارهای طولانی.', specs: { 'ولتاژ': '۱۸ ولت', 'گشتاور': '۴۲ نیوتن‌متر', 'سرعت': '۰-۱۵۰۰ دور در دقیقه', 'وزن': '۱.۱ کیلوگرم' } },
    { id: 4, name: 'دریل پیچ‌گوشتی میلواکی M18 FUEL', slug: 'milwaukee-m18-fuel', brand: 'milwaukee', brandName: 'میلواکی', category: 'ابزار شارژی', categorySlug: 'cordless-tools', image: 'assets/images/products/milwaukee-m18-fuel.svg', images: ['assets/images/products/milwaukee-m18-fuel.svg'], categoryId: 2, price: 5200000, oldPrice: 5800000, rating: 4.9, reviewCount: 67, discount: 10, isNew: true, isBestSeller: false, inStock: true, sku: 'MLW-M18FUEL', shortDescription: 'دریل میلواکی M18 FUEL با موتور براشلس و گشتاور بالا.', description: 'دریل پیچ‌گوشتی میلواکی M18 FUEL با فناوری موتور براشلس و گشتاور بالا.', specs: { 'ولتاژ': '۱۸ ولت', 'نوع موتور': 'براشلس', 'گشتاور': '۷۵ نیوتن‌متر', 'وزن': '۱.۷ کیلوگرم' } },
    { id: 5, name: 'ست آچار استنلی ۱۰ پارچه', slug: 'stanley-wrench-set-10', brand: 'stanley', brandName: 'استنلی', category: 'ابزار دستی', categorySlug: 'hand-tools', image: 'assets/images/products/stanley-wrench-set-10.svg', images: ['assets/images/products/stanley-wrench-set-10.svg'], categoryId: 3, price: 850000, oldPrice: null, rating: 4.2, reviewCount: 312, discount: 0, isNew: false, isBestSeller: true, inStock: true, sku: 'STN-ACH10', shortDescription: 'ست آچار استنلی شامل ۱۰ عدد آچار فرانسه با کروم-وانادیوم.', description: 'ست آچار ۱۰ پارچه استنلی با جنس کروم-وانادیوم و مقاومت بالا در برابر زنگ‌زدگی.', specs: { 'تعداد': '۱۰ پارچه', 'جنس': 'کروم-وانادیوم', 'سایزها': '۸ تا ۳۲ میلیمتر' } },
    { id: 6, name: 'سنباده متابو مدل WEV 17-125 Quick', slug: 'matabo-wev-17-125', brand: 'matabo', brandName: 'متابو', category: 'ابزار برقی', categorySlug: 'power-tools', image: 'assets/images/products/matabo-wev-17-125.svg', images: ['assets/images/products/matabo-wev-17-125.svg'], categoryId: 1, price: 3800000, oldPrice: 4200000, rating: 4.7, reviewCount: 45, discount: 10, isNew: false, isBestSeller: false, inStock: true, sku: 'MTB-WEV17', shortDescription: 'سنباده متابو با توان ۱۷۰۰ وات و قطر دیسک ۱۲۵ میلیمتر.', description: 'سنباده متابو WEV 17-125 Quick با توان بالا و سیستم ضد لرزش.', specs: { 'توان': '۱۷۰۰ وات', 'قطر دیسک': '۱۲۵ میلیمتر', 'سرعت': '۲۸۰۰-۱۱۰۰۰ دور در دقیقه', 'وزن': '۲.۱ کیلوگرم' } },
    { id: 7, name: 'جعبه ابزار توتال ۱۵۰ پارچه', slug: 'total-toolbox-150', brand: 'total', brandName: 'توتال', category: 'لوازم جانبی', categorySlug: 'accessories', image: 'assets/images/products/total-toolbox-150.svg', images: ['assets/images/products/total-toolbox-150.svg'], categoryId: 6, price: 1200000, oldPrice: 1450000, rating: 4.0, reviewCount: 178, discount: 17, isNew: false, isBestSeller: false, inStock: true, sku: 'TTL-BOX150', shortDescription: 'جعبه ابزار توتال شامل ۱۵۰ پارچه ابزار دستی.', description: 'جعبه ابزار توتال ۱۵۰ پارچه شامل مجموعه کاملی از ابزارهای دستی پرکاربرد.', specs: { 'تعداد پارچه': '۱۵۰', 'جنس': 'فولاد کربنی', 'وزن': '۸.۵ کیلوگرم' } },
    { id: 8, name: 'دریل چکشی اینگکو مدل ED5218', slug: 'ingco-ed5218', brand: 'ingco', brandName: 'اینگکو', category: 'ابزار برقی', categorySlug: 'power-tools', image: 'assets/images/products/ingco-ed5218.svg', images: ['assets/images/products/ingco-ed5218.svg'], categoryId: 1, price: 980000, oldPrice: null, rating: 3.9, reviewCount: 89, discount: 0, isNew: true, isBestSeller: false, inStock: true, sku: 'ING-ED5218', shortDescription: 'دریل چکشی اینگکو با توان ۸۵۰ وات مناسب برای دیوار و بتن.', description: 'دریل چکشی اینگکو ED5218 با توان ۸۵۰ وات انتخابی اقتصادی.', specs: { 'توان': '۸۵۰ وات', 'حداکثر قطر سوراخکاری': '۱۳ میلیمتر', 'وزن': '۲.۸ کیلوگرم' } },
    { id: 9, name: 'متر لیزری ریال ۴۰ متری', slug: 'reyal-laser-40m', brand: 'reyal', brandName: 'ریال', category: 'ابزار اندازه‌گیری', categorySlug: 'measuring-tools', image: 'assets/images/products/reyal-laser-40m.svg', images: ['assets/images/products/reyal-laser-40m.svg'], categoryId: 5, price: 1650000, oldPrice: 1800000, rating: 4.4, reviewCount: 56, discount: 8, isNew: false, isBestSeller: false, inStock: true, sku: 'RYL-L40', shortDescription: 'متر لیزری ریال با برد ۴۰ متر و دقت بالا.', description: 'متر لیزری ریال ۴۰ متری با دقت بالا و صفحه نمایش بزرگ.', specs: { 'برد': '۴۰ متر', 'دقت': '±۱.۵ میلیمتر', 'وزن': '۱۲۰ گرم' } },
    { id: 10, name: 'کلاه ایمنی سپکو HardHat', slug: 'sepco-hardhat', brand: 'sepco', brandName: 'سپکو', category: 'ایمنی و حفاظت', categorySlug: 'safety', image: 'assets/images/products/sepco-hardhat.svg', images: ['assets/images/products/sepco-hardhat.svg'], categoryId: 7, price: 120000, oldPrice: null, rating: 4.1, reviewCount: 234, discount: 0, isNew: false, isBestSeller: true, inStock: true, sku: 'SPC-HH01', shortDescription: 'کلاه ایمنی سپکو با استاندارد ملی.', description: 'کلاه ایمنی سپکو با استاندارد ملی ایران مناسب پروژه‌های ساختمانی.', specs: { 'استاندارد': 'ملی ایران', 'جنس': 'پلی‌اتیلن', 'رنگ': 'سفید/زرد/آبی' } },
    { id: 11, name: 'اره عمود بر دونگ‌چنگ J0Z-FC', slug: 'dongcheng-j0z-fc', brand: 'dongcheng', brandName: 'دونگ‌چنگ', category: 'ابزار برش', categorySlug: 'cutting-tools', image: 'assets/images/products/dongcheng-j0z-fc.svg', images: ['assets/images/products/dongcheng-j0z-fc.svg'], categoryId: 4, price: 1350000, oldPrice: 1500000, rating: 4.2, reviewCount: 78, discount: 10, isNew: false, isBestSeller: false, inStock: true, sku: 'DC-J0Z', shortDescription: 'اره عمود بر دونگ‌چنگ با توان ۸۰۰ وات.', description: 'اره عمود بر دونگ‌چنگ J0Z-FC با توان ۸۰۰ وات و قابلیت تنظیم سرعت.', specs: { 'توان': '۸۰۰ وات', 'عمق برش چوب': '۶۵ میلیمتر', 'عمق برش فلز': '۸ میلیمتر', 'وزن': '۲.۲ کیلوگرم' } },
    { id: 12, name: 'تراز لیزری اینهل PM 30', slug: 'einhell-pm-30', brand: 'einhell', brandName: 'اینهل', category: 'ابزار اندازه‌گیری', categorySlug: 'measuring-tools', image: 'assets/images/products/einhell-pm-30.svg', images: ['assets/images/products/einhell-pm-30.svg'], categoryId: 5, price: 2100000, oldPrice: 2400000, rating: 4.6, reviewCount: 34, discount: 13, isNew: true, isBestSeller: false, inStock: true, sku: 'EIN-PM30', shortDescription: 'تراز لیزری اینهل با برد ۳۰ متر.', description: 'تراز لیزری اینهل PM 30 با برد ۳۰ متر و دقت بالا.', specs: { 'برد': '۳۰ متر', 'دقت': '±۱ میلیمتر در ۱۰ متر', 'تعداد خط لیزر': '۱ افقی + ۱ عمودی', 'وزن': '۵۰۰ گرم' } },
    { id: 13, name: 'چسب‌کاری بوش GCF 200', slug: 'bosch-gcf-200', brand: 'bosch', brandName: 'بوش', category: 'ابزار برقی', categorySlug: 'power-tools', image: 'assets/images/products/bosch-gcf-200.svg', images: ['assets/images/products/bosch-gcf-200.svg'], categoryId: 1, price: 780000, oldPrice: null, rating: 4.3, reviewCount: 145, discount: 0, isNew: false, isBestSeller: false, inStock: true, sku: 'BSH-GCF200', shortDescription: 'چسب‌کاری بوش با توان ۲۰۰ وات.', description: 'چسب‌کاری بوش GCF 200 مناسب برای چسباندن انواع مصالح.', specs: { 'توان': '۲۰۰ وات', 'دما': '۲۰۰ درجه', 'وزن': '۰.۵ کیلوگرم' } },
    { id: 14, name: 'انبردست ماکیتا ۲۵۰ میلیمتری', slug: 'makita-pliers-250', brand: 'makita', brandName: 'ماکیتا', category: 'ابزار دستی', categorySlug: 'hand-tools', image: 'assets/images/products/makita-pliers-250.svg', images: ['assets/images/products/makita-pliers-250.svg'], categoryId: 3, price: 320000, oldPrice: 380000, rating: 4.1, reviewCount: 98, discount: 16, isNew: false, isBestSeller: false, inStock: true, sku: 'MKT-PL250', shortDescription: 'انبردست ماکیتا ۲۵۰ میلیمتری با دسته ضد لغزش.', description: 'انبردست ماکیتا با فولاد سخت‌کاری شده و دسته ارگونومیک.', specs: { 'طول': '۲۵۰ میلیمتر', 'جنس': 'فولاد کربنی', 'دسته': 'پلاستیک ضد لغزش' } },
    { id: 15, name: 'گونیای دیوالت DW488', slug: 'dewalt-dw488', brand: 'dewalt', brandName: 'دیوالت', category: 'ابزار دستی', categorySlug: 'hand-tools', image: 'assets/images/products/dewalt-dw488.svg', images: ['assets/images/products/dewalt-dw488.svg'], categoryId: 3, price: 210000, oldPrice: null, rating: 4.5, reviewCount: 67, discount: 0, isNew: false, isBestSeller: false, inStock: true, sku: 'DWT-DW488', shortDescription: 'گونیای دیوالت با جنس آلومینیوم.', description: 'گونیای دیوالت DW488 با جنس آلومینیوم مقاوم و علائم خوانا.', specs: { 'طول': '۳۰۰ میلیمتر', 'جنس': 'آلومینیوم', 'دقت': '±۰.۵ میلیمتر' } },
    { id: 16, name: 'سنگ فرز بوش GWS 800', slug: 'bosch-gws-800', brand: 'bosch', brandName: 'بوش', category: 'ابزار برقی', categorySlug: 'power-tools', image: 'assets/images/products/bosch-gws-800.svg', images: ['assets/images/products/bosch-gws-800.svg'], categoryId: 1, price: 1450000, oldPrice: 1650000, rating: 4.4, reviewCount: 156, discount: 12, isNew: false, isBestSeller: true, inStock: true, sku: 'BSH-GWS800', shortDescription: 'سنگ فرز بوش با توان ۸۰۰ وات.', description: 'سنگ فرز بوش GWS 800 مناسب برای برش فلزات و سنگ.', specs: { 'توان': '۸۰۰ وات', 'قطر دیسک': '۱۱۵ میلیمتر', 'سرعت': '۱۱۰۰۰ دور در دقیقه', 'وزن': '۱.۸ کیلوگرم' } },
    { id: 17, name: 'اره زنجیری شارژی دیوالت DCM563', slug: 'dewalt-dcm563', brand: 'dewalt', brandName: 'دیوالت', category: 'ابزار برش', categorySlug: 'cutting-tools', image: 'assets/images/products/dewalt-dcm563.svg', images: ['assets/images/products/dewalt-dcm563.svg'], categoryId: 4, price: 3600000, oldPrice: null, rating: 4.6, reviewCount: 42, discount: 0, isNew: true, isBestSeller: false, inStock: true, sku: 'DWT-DCM563', shortDescription: 'اره زنجیری شارژی دیوالت با باتری ۱۸ ولت.', description: 'اره زنجیری شارژی دیوالت با طول تیغه ۳۰ سانتیمتر مناسب هرس درختان.', specs: { 'ولتاژ': '۱۸ ولت', 'طول تیغه': '۳۰ سانتیمتر', 'نوع موتور': 'براشلس' } },
    { id: 18, name: 'ست پیچ‌گوشتی استنلی ۶ پارچه', slug: 'stanley-screwdriver-6', brand: 'stanley', brandName: 'استنلی', category: 'ابزار دستی', categorySlug: 'hand-tools', image: 'assets/images/products/stanley-screwdriver-6.svg', images: ['assets/images/products/stanley-screwdriver-6.svg'], categoryId: 3, price: 280000, oldPrice: 350000, rating: 4.0, reviewCount: 189, discount: 20, isNew: false, isBestSeller: false, inStock: true, sku: 'STN-SCR6', shortDescription: 'ست پیچ‌گوشتی استنلی ۶ پارچه تخت و چهارگوش.', description: 'ست پیچ‌گوشتی ۶ پارچه استنلی با دسته ارگونومیک و نوک مقاوم.', specs: { 'تعداد': '۶ پارچه', 'جنس نوک': 'فولاد آلیاژی', 'انواع': 'تخت و چهارگوش' } },
    { id: 19, name: 'دریل رادیالی توتال TB-13R', slug: 'total-tb-13r', brand: 'total', brandName: 'توتال', category: 'ابزار برقی', categorySlug: 'power-tools', image: 'assets/images/products/total-tb-13r.svg', images: ['assets/images/products/total-tb-13r.svg'], categoryId: 1, price: 680000, oldPrice: null, rating: 3.8, reviewCount: 201, discount: 0, isNew: false, isBestSeller: false, inStock: false, sku: 'TTL-TB13R', shortDescription: 'دریل رادیالی توتال با توان ۵۵۰ وات.', description: 'دریل رادیالی توتال TB-13R مناسب برای سوراخکاری چندمنظوره.', specs: { 'توان': '۵۵۰ وات', 'حداکثر قطر سوراخکاری': '۱۳ میلیمتر', 'وزن': '۲.۵ کیلوگرم' } },
    { id: 20, name: 'دستکش کار سپکو GL-01', slug: 'sepco-gl-01', brand: 'sepco', brandName: 'سپکو', category: 'ایمنی و حفاظت', categorySlug: 'safety', image: 'assets/images/products/sepco-gl-01.svg', images: ['assets/images/products/sepco-gl-01.svg'], categoryId: 7, price: 45000, oldPrice: null, rating: 4.3, reviewCount: 456, discount: 0, isNew: false, isBestSeller: true, inStock: true, sku: 'SPC-GL01', shortDescription: 'دستکش کار سپکو با روکش نیتریل.', description: 'دستکش کار سپکو با روکش نیتریل مقاوم در برابر لغزش.', specs: { 'جنس': 'نیتریل', 'سایز': 'M/L/XL', 'مقاومت': 'ضد لغزش' } },
    { id: 21, name: 'تیغ اره الماسه بوش ۵ پارچه', slug: 'bosch-diamond-blade-5', brand: 'bosch', brandName: 'بوش', category: 'لوازم جانبی', categorySlug: 'accessories', image: 'assets/images/products/bosch-diamond-blade-5.svg', images: ['assets/images/products/bosch-diamond-blade-5.svg'], categoryId: 6, price: 350000, oldPrice: 420000, rating: 4.5, reviewCount: 123, discount: 17, isNew: false, isBestSeller: false, inStock: true, sku: 'BSH-DB5', shortDescription: 'ست ۵ عددی تیغ اره الماسه بوش.', description: 'تیغ اره الماسه بوش مناسب برش سنگ و سرامیک.', specs: { 'تعداد': '۵ پارچه', 'قطر': '۱۱۵ میلیمتر', 'جنس': 'الماسه صنعتی' } },
    { id: 22, name: 'میت برقی ماکیتا 2706', slug: 'makita-2706', brand: 'makita', brandName: 'ماکیتا', category: 'ابزار نجاری', categorySlug: 'woodworking', image: 'assets/images/products/makita-2706.svg', images: ['assets/images/products/makita-2706.svg'], categoryId: 8, price: 6500000, oldPrice: 7200000, rating: 4.7, reviewCount: 31, discount: 10, isNew: true, isBestSeller: false, inStock: true, sku: 'MKT-2706', shortDescription: 'میت برقی ماکیتا با توان ۱۶۵۰ وات.', description: 'میت برقی ماکیتا 2706 انتخابی حرفه‌ای برای نجاران.', specs: { 'توان': '۱۶۵۰ وات', 'قطر تیغ': '۲۵۵ میلیمتر', 'وزن': '۱۴.۵ کیلوگرم' } },
    { id: 23, name: 'پمپ باد اینهل ECW 200/8', slug: 'einhell-ecw-200-8', brand: 'einhell', brandName: 'اینهل', category: 'تجهیزات کارگاهی', categorySlug: 'workshop', image: 'assets/images/products/einhell-ecw-200-8.svg', images: ['assets/images/products/einhell-ecw-200-8.svg'], categoryId: 9, price: 2800000, oldPrice: 3100000, rating: 4.2, reviewCount: 28, discount: 10, isNew: false, isBestSeller: false, inStock: true, sku: 'EIN-ECW200', shortDescription: 'پمپ باد اینهل با مخزن ۲۰۰ لیتر.', description: 'پمپ باد اینهل مناسب کارگاه‌ها و تعمیرگاه‌ها.', specs: { 'حجم مخزن': '۲۰۰ لیتر', 'فشار': '۸ بار', 'توان موتور': '۲.۲ کیلووات', 'وزن': '۶۵ کیلوگرم' } },
    { id: 24, name: 'انبر قفلی هیتاچی HTP13', slug: 'hikoki-htp13', brand: 'hikoki', brandName: 'هیتاچی', category: 'ابزار دستی', categorySlug: 'hand-tools', image: 'assets/images/products/hikoki-htp13.svg', images: ['assets/images/products/hikoki-htp13.svg'], categoryId: 3, price: 520000, oldPrice: null, rating: 4.4, reviewCount: 67, discount: 0, isNew: false, isBestSeller: false, inStock: true, sku: 'HIK-HTP13', shortDescription: 'انبر قفلی هیتاچی ۲۵۰ میلیمتری.', description: 'انبر قفلی هیتاچی با طراحی ارگونومیک و قفل خودکار.', specs: { 'طول': '۲۵۰ میلیمتر', 'حداکثر بازشوندگی': '۵۰ میلیمتر', 'جنس': 'فولاد کربنی' } },
    { id: 25, name: 'عینک ایمنی کرون SG-02', slug: 'crown-sg-02', brand: 'crown', brandName: 'کرون', category: 'ایمنی و حفاظت', categorySlug: 'safety', image: 'assets/images/products/crown-sg-02.svg', images: ['assets/images/products/crown-sg-02.svg'], categoryId: 7, price: 35000, oldPrice: null, rating: 4.0, reviewCount: 345, discount: 0, isNew: false, isBestSeller: false, inStock: true, sku: 'CRN-SG02', shortDescription: 'عینک ایمنی کرون با شیشه ضد خش.', description: 'عینک ایمنی کرون با شیشه ضد خش و UV400.', specs: { 'جنس شیشه': 'پلی‌کربنات', 'محافظت': 'UV400', 'استاندارد': 'CE' } },
    { id: 26, name: 'رنده برقی شارژی میلواکی M18', slug: 'milwaukee-m18-planer', brand: 'milwaukee', brandName: 'میلواکی', category: 'ابزار نجاری', categorySlug: 'woodworking', image: 'assets/images/products/milwaukee-m18-planer.svg', images: ['assets/images/products/milwaukee-m18-planer.svg'], categoryId: 8, price: 4800000, oldPrice: 5400000, rating: 4.8, reviewCount: 19, discount: 11, isNew: true, isBestSeller: false, inStock: true, sku: 'MLW-PLANER', shortDescription: 'رنده برقی شارژی میلواکی با عرض ۸۲ میلیمتر.', description: 'رنده برقی شارژی میلواکی M18 FUEL حرفه‌ای.', specs: { 'ولتاژ': '۱۸ ولت', 'عرض رنده': '۸۲ میلیمتر', 'حداکثر عمق رنده': '۳ میلیمتر', 'وزن': '۲.۸ کیلوگرم' } },
    { id: 27, name: 'پولیش اینگکو AO5128', slug: 'ingco-ao5128', brand: 'ingco', brandName: 'اینگکو', category: 'ابزار برقی', categorySlug: 'power-tools', image: 'assets/images/products/ingco-ao5128.svg', images: ['assets/images/products/ingco-ao5128.svg'], categoryId: 1, price: 1100000, oldPrice: 1300000, rating: 4.1, reviewCount: 43, discount: 15, isNew: false, isBestSeller: false, inStock: true, sku: 'ING-AO5128', shortDescription: 'پولیش اینگکو با توان ۱۲۰۰ وات.', description: 'پولیش اینگکو AO5128 مناسب صیقل و پولیش سطوح.', specs: { 'توان': '۱۲۰۰ وات', 'سرعت': '۰-۳۰۰۰ دور در دقیقه', 'قطر صفحه': '۱۸۰ میلیمتر', 'وزن': '۲.۳ کیلوگرم' } }
  ],

  articleCategories: [
    { id: 1, name: 'راهنمای خرید', slug: 'buying-guide', count: 8 },
    { id: 2, name: 'آموزش ابزار', slug: 'tool-tutorial', count: 12 },
    { id: 3, name: 'مقایسه ابزار', slug: 'tool-comparison', count: 6 },
    { id: 4, name: 'نگهداری ابزار', slug: 'tool-maintenance', count: 9 },
    { id: 5, name: 'اخبار ابزار', slug: 'tool-news', count: 5 }
  ],

  articles: [
    { id: 1, slug: 'best-cordless-drill-guide', title: 'راهنمای خرید دریل شارژی مناسب', excerpt: 'انتخاب دریل شارژی مناسب نیاز به بررسی عوامل مختلفی از جمله ولتاژ باتری، گشتاور و کاربرد مورد نظر دارد.', category: 'راهنمای خرید', categorySlug: 'buying-guide', date: '۱۵ مرداد ۱۴۰۵', readTime: '۵ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>انتخاب دریل شارژی مناسب یکی از مهم‌ترین تصمیمات هر استادکار است.</p><h2>ولتاژ باتری</h2><p>ولتاژ باتری یکی از مهم‌ترین مشخصات است. دریل‌های ۱۲ ولت برای کارهای سبک و ۱۸ ولت برای کارهای حرفه‌ای مناسب‌اند.</p><h2>گشتاور</h2><p>گشتاور بالاتر یعنی قدرت بیشتر در بستن پیچ‌ها.</p><h2>برندهای پیشنهادی</h2><p>بوش، ماکیتا، دیوالت و میلواکی از بهترین برندها هستند.</p>' },
    { id: 2, slug: 'power-tool-maintenance-tips', title: 'نکات مهم در نگهداری ابزار برقی', excerpt: 'نگهداری صحیح از ابزار برقی عمر مفید آن‌ها را افزایش می‌دهد و از خرابی زودهنگام جلوگیری می‌کند.', category: 'نگهداری ابزار', categorySlug: 'tool-maintenance', date: '۱۲ مرداد ۱۴۰۵', readTime: '۴ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>نگهداری صحیح از ابزار برقی بسیار مهم است.</p><h2>تمیز کردن منظم</h2><p>ابزار را پس از هر بار استفاده تمیز کنید.</p><h2>روغن‌کاری</h2><p>قطعات متحرک را دوره‌ای روغن‌کاری کنید.</p>' },
    { id: 3, slug: 'bosch-vs-makita-comparison', title: 'مقایسه برندهای ابزار: بوش یا ماکیتا؟', excerpt: 'بررسی تفصیلی و مقایسه دو برند مطرح بازار ابزار ایران.', category: 'مقایسه ابزار', categorySlug: 'tool-comparison', date: '۱۰ مرداد ۱۴۰۵', readTime: '۷ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>بوش و ماکیتا دو برند برتر بازار ابزار ایران هستند.</p><h2>کیفیت ساخت</h2><p>هر دو برند کیفیت بالایی دارند.</p><h2>قیمت</h2><p>قیمت محصولات نسبتاً مشابه است.</p>' },
    { id: 4, slug: 'woodworking-tools-beginner', title: 'ابزار ضروری برای کارگاه نجاری', excerpt: 'لیست کامل ابزار مورد نیاز برای راه‌اندازی کارگاه نجاری حرفه‌ای.', category: 'آموزش ابزار', categorySlug: 'tool-tutorial', date: '۸ مرداد ۱۴۰۵', readTime: '۶ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>برای راه‌اندازی کارگاه نجاری به ابزارهای مختلفی نیاز دارید.</p><h2>ابزارهای پایه</h2><p>اره، اره میت، رنده و میز کار از ابزارهای پایه هستند.</p>' },
    { id: 5, slug: 'cutting-tools-safety', title: 'ایمنی در استفاده از ابزار برش', excerpt: 'رعایت نکات ایمنی هنگام کار با ابزار برش از اهمیت بالایی برخوردار است.', category: 'آموزش ابزار', categorySlug: 'tool-tutorial', date: '۵ مرداد ۱۴۰۵', readTime: '۳ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>ایمنی در استفاده از ابزارهای برش بسیار مهم است.</p><h2>تجهیزات حفاظتی</h2><p>همیشه از عینک و دستکش ایمنی استفاده کنید.</p>' },
    { id: 6, slug: 'new-tools-2026', title: 'معرفی جدیدترین ابزارهای ۲۰۲۶', excerpt: 'نگاهی به جدیدترین ابزارهای عرضه شده در بازار ایران.', category: 'اخبار ابزار', categorySlug: 'tool-news', date: '۳ مرداد ۱۴۰۵', readTime: '۵ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>ابزارهای جدید و نوآورانه‌ای در بازار عرضه شده‌اند.</p><h2>باتری‌های نسل جدید</h2><p>ظرفیت بالاتر و شارژ سریع‌تر.</p>' },
    { id: 7, slug: 'measure-tools-guide', title: 'راهنمای انتخاب ابزار اندازه‌گیری', excerpt: 'انتخاب ابزار اندازه‌گیری مناسب برای هر پروژه‌ای.', category: 'راهنمای خرید', categorySlug: 'buying-guide', date: '۱ مرداد ۱۴۰۵', readTime: '۴ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>ابزارهای اندازه‌گیری دقیق از ملزومات هر پروژه هستند.</p>' },
    { id: 8, slug: 'hand-tools-essentials', title: 'ابزارهای دستی ضروری در هر خانه', excerpt: 'هر خانه‌ای به مجموعه‌ای از ابزارهای دستی پایه نیاز دارد.', category: 'راهنمای خرید', categorySlug: 'buying-guide', date: '۲۸ تیر ۱۴۰۵', readTime: '۳ دقیقه', author: 'تیم تحریریه ابزار شکری', content: '<p>داشتن ابزار دستی پایه در هر خانه ضروری است.</p><h2>ابزارهای پایه</h2><p>چکش، پیچ‌گوشتی، آچار فرانسه و متر.</p>' }
  ],

  reviews: [
    { id: 1, productId: 1, author: 'علی محمدی', date: '۱۰ مرداد ۱۴۰۵', rating: 5, title: 'عالی و با کیفیت', text: 'دریل بسیار خوبی است. باتری عمر طولانی دارد و گشتاورش عالی است.' },
    { id: 2, productId: 1, author: 'رضا احمدی', date: '۸ مرداد ۱۴۰۵', rating: 4, title: 'خوب ولی گران', text: 'کیفیت عالی ولی قیمت نسبت به رقبا بالاتر است.' },
    { id: 3, productId: 1, author: 'حسن رضایی', date: '۵ مرداد ۱۴۰۵', rating: 5, title: 'پیشنهاد می‌کنم', text: 'چند ماه است استفاده می‌کنم، کاملاً راضی‌ام.' },
    { id: 4, productId: 2, author: 'امیر حسینی', date: '۱۲ مرداد ۱۴۰۵', rating: 5, title: 'بهترین اره بازار', text: 'اره دیسکی ماکیتا واقعاً حرفه‌ای است.' },
    { id: 5, productId: 2, author: 'سعید کریمی', date: '۹ مرداد ۱۴۰۵', rating: 5, title: 'ارزش خرید بالا', text: 'با توجه به کیفیت ژاپنی، قیمت مناسبی دارد.' },
    { id: 6, productId: 3, author: 'مهدی عباسی', date: '۷ مرداد ۱۴۰۵', rating: 4, title: 'مناسب برای نصب', text: 'برای کارهای نصب بسیار مناسب است. وزن سبکی دارد.' },
    { id: 7, productId: 4, author: 'کامران نوری', date: '۱۱ مرداد ۱۴۰۵', rating: 5, title: 'حرفه‌ای و قدرتمند', text: 'میلواکی واقعاً بهترین برند بازار است.' },
    { id: 8, productId: 5, author: 'فریدون صالحی', date: '۶ مرداد ۱۴۰۵', rating: 4, title: 'ست کامل و خوب', text: 'ست آچار کامل و با کیفیتی است.' }
  ],

  /* orders, addresses, and user data are stored per-user in localStorage.
     See common.js for user management (register/login/session).
     User-specific data keys: as_user_{id}_orders, as_user_{id}_addresses, as_user_{id}_profile */

  provinces: [
    { name: 'تهران', cities: ['تهران', 'ری', 'اسلامشهر', 'ورامین', 'پاکدشت'] },
    { name: 'اصفهان', cities: ['اصفهان', 'کاشان', 'نائین', 'خمینی‌شهر', 'گلپایگان'] },
    { name: 'فارس', cities: ['شیراز', 'مرودشت', 'جهرم', 'فسا', 'لار'] },
    { name: 'خراسان رضوی', cities: ['مشهد', 'نیشابور', 'سبزوار', 'تربت حیدریه'] },
    { name: 'آذربایجان شرقی', cities: ['تبریز', 'مراغه', 'اهر', 'میانه'] },
    { name: 'خوزستان', cities: ['اهواز', 'آبادان', 'خرمشهر', 'ماهشهر'] },
    { name: 'مازندران', cities: ['ساری', 'بابل', 'آمل', 'قائم‌شهر'] },
    { name: 'کرمان', cities: ['کرمان', 'رفسنجان', 'جیرفت', 'بم'] },
    { name: 'گیلان', cities: ['رشت', 'انزلی', 'لاهیجان', 'لنگرود'] },
    { name: 'البرز', cities: ['کرج', 'هشتگرد', 'نظرآباد', 'محمدشهر'] }
  ],

  faqCategories: [
    { id: 'orders', name: 'سفارش' },
    { id: 'payment', name: 'پرداخت' },
    { id: 'shipping', name: 'ارسال' },
    { id: 'returns', name: 'مرجوعی' },
    { id: 'products', name: 'محصولات' },
    { id: 'account', name: 'حساب کاربری' }
  ],

  faqItems: [
    { id: 1, category: 'orders', question: 'چگونه سفارش خود را ثبت کنم؟', answer: 'محصول مورد نظر را به سبد خرید اضافه کنید و مراحل تکمیل اطلاعات و پرداخت را طی کنید.' },
    { id: 2, category: 'orders', question: 'آیا امکان لغو سفارش وجود دارد؟', answer: 'بله، تا زمانی که سفارش ارسال نشده باشد، امکان لغو آن وجود دارد.' },
    { id: 3, category: 'orders', question: 'چگونه سفارش خود را پیگیری کنم؟', answer: 'با ورود به حساب کاربری و بخش سفارش‌های من، وضعیت سفارش را مشاهده کنید.' },
    { id: 4, category: 'payment', question: 'چه روش‌های پرداختی پذیرفته می‌شود؟', answer: 'پرداخت آنلاین از طریق کلیه کارت‌های بانکی عضو شتاب.' },
    { id: 5, category: 'payment', question: 'آیا پرداخت امن است؟', answer: 'بله، از پروتکل امنیتی SSL استفاده می‌شود.' },
    { id: 6, category: 'shipping', question: 'هزینه ارسال چقدر است؟', answer: 'ارسال برای سفارش‌های بالای ۵۰۰ هزار تومان رایگان است.' },
    { id: 7, category: 'shipping', question: 'زمان تحویل سفارش چقدر است؟', answer: 'ارسال عادی ۳ تا ۵ روز و ارسال سریع ۱ تا ۲ روز کاری.' },
    { id: 8, category: 'returns', question: 'آیا امکان مرجوعی کالا وجود دارد؟', answer: 'بله، تا ۷ روز پس از تحویل در صورت عدم رضایت.' },
    { id: 9, category: 'products', question: 'آیا محصولات ضمانت اصالت دارند؟', answer: 'بله، تمامی محصولات با ضمانت اصالت از نمایندگی‌های رسمی تأمین شده‌اند.' },
    { id: 10, category: 'account', question: 'چگونه حساب کاربری بسازم؟', answer: 'با کلیک روی آیکون حساب کاربری و انتخاب ثبت‌نام.' }
  ],

  shippingMethods: [
    { id: 'normal', name: 'ارسال عادی', description: 'تحویل ۳ تا ۵ روز کاری', price: 0 },
    { id: 'express', name: 'ارسال سریع', description: 'تحویل ۱ تا ۲ روز کاری', price: 35000 }
  ],

  searchSuggestions: ['دریل شارژی', 'اره دیسکی', 'پیچ‌گوشتی', 'آچار', 'متر', 'کلاه ایمنی', 'دستکش کار', 'سنگ فرز', 'سنباده']
};

/* ================================================================
   Format Helpers
   ================================================================ */
const Format = {
  price(v) { return new Intl.NumberFormat('fa-IR').format(v); },
  priceWithCurrency(v) { return this.price(v) + ' تومان'; },
  rating(v) { const f = Math.floor(v); const h = v % 1 >= 0.5 ? 1 : 0; return { full: f, half: h, empty: 5 - f - h }; },
  starHtml(v) { const r = this.rating(v); let s = ''; for (let i = 0; i < r.full; i++) s += Icons.star; for (let i = 0; i < r.empty; i++) s += Icons.starEmpty; return s; },
  productSlug(p) { return p.slug || 'product-' + p.id; },
  categorySlug(c) { return c.slug || 'category-' + c.id; },
  brandSlug(b) { return b.name || 'brand-' + b.id; },
  toPersianNumber(n) { const d = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹']; return String(n).replace(/\d/g, x => d[x]); }
};

/* ================================================================
   Derived review helpers — always computed from actual reviews array
   ================================================================ */
function getReviewCount(productId) {
  return AppData.reviews.filter(function (r) { return r.productId === productId; }).length;
}
function getAvgRating(productId) {
  var list = AppData.reviews.filter(function (r) { return r.productId === productId; });
  if (list.length === 0) return 0;
  return list.reduce(function (s, r) { return s + r.rating; }, 0) / list.length;
}
