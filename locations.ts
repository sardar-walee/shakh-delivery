export interface SubDistrict {
  id: string;
  nameEn: string;
  nameKu: string;
  nameAr: string;
  latitude?: number;
  longitude?: number;
}

export interface District {
  id: string;
  nameEn: string;
  nameKu: string;
  nameAr: string;
  latitude?: number;
  longitude?: number;
  subDistricts: SubDistrict[];
}

export interface Governorate {
  id: string;
  nameEn: string;
  nameKu: string;
  nameAr: string;
  region: 'Kurdistan' | 'Federal Iraq';
  latitude: number;
  longitude: number;
  districts: District[];
}

export const ALL_GOVERNORATES: Governorate[] = [
  // ================= KURDISTAN REGION =================
  {
    id: 'erbil',
    nameEn: 'Erbil',
    nameKu: 'هەولێر',
    nameAr: 'أربيل',
    region: 'Kurdistan',
    latitude: 36.1911,
    longitude: 44.0092,
    districts: [
      {
        id: 'erbil-center',
        nameEn: 'Erbil Center',
        nameKu: 'ناوەندی هەولێر',
        nameAr: 'مركز أربيل',
        latitude: 36.1911,
        longitude: 44.0092,
        subDistricts: [
          { id: 'ankawa', nameEn: 'Ankawa', nameKu: 'عەنکاوە', nameAr: 'عنكاوا', latitude: 36.2307, longitude: 43.9944 },
          { id: 'baharka', nameEn: 'Baharka', nameKu: 'بەحرکە', nameAr: 'بحركة', latitude: 36.3117, longitude: 44.0322 },
          { id: 'rizgari-erbil', nameEn: 'Rizgari', nameKu: 'ڕزگاری', nameAr: 'رزكاري', latitude: 36.1855, longitude: 44.0155 },
          { id: 'kasnazan', nameEn: 'Kasnazan', nameKu: 'کەسنەزان', nameAr: 'كسنزان', latitude: 36.2166, longitude: 44.1500 },
          { id: 'banaslawa', nameEn: 'Banaslawa', nameKu: 'بنەسڵاوە', nameAr: 'بنصلاوة', latitude: 36.1438, longitude: 44.1032 },
          { id: 'daratu', nameEn: 'Daratu', nameKu: 'دارەتوو', nameAr: 'دارتوو', latitude: 36.1042, longitude: 44.0833 },
          { id: 'pirmam', nameEn: 'Pirmam (Salahaddin)', nameKu: 'پیرمام (مەسیف)', nameAr: 'صلاح الدين (بيرمام)', latitude: 36.3861, longitude: 44.2028 },
          { id: 'qushtapa', nameEn: 'Qushtapa', nameKu: 'قوشتەپە', nameAr: 'قوشتبة', latitude: 35.9833, longitude: 44.0333 },
          { id: 'shamamak', nameEn: 'Shamamak', nameKu: 'شەمامک', nameAr: 'شمامك', latitude: 36.0667, longitude: 43.8333 },
          { id: 'gwer', nameEn: 'Gwer', nameKu: 'گوێڕ', nameAr: 'الكوير', latitude: 36.0083, longitude: 43.5111 },
        ],
      },
      {
        id: 'shaqlawa',
        nameEn: 'Shaqlawa',
        nameKu: 'شەقڵاوە',
        nameAr: 'شقلاوة',
        latitude: 36.4069,
        longitude: 44.3411,
        subDistricts: [
          { id: 'shaqlawa-center', nameEn: 'Shaqlawa Center', nameKu: 'ناوەندی شەقڵاوە', nameAr: 'مركز شقلاوة', latitude: 36.4069, longitude: 44.3411 },
          { id: 'hiran', nameEn: 'Hiran', nameKu: 'هیران', nameAr: 'هيران', latitude: 36.3667, longitude: 44.4167 },
          { id: 'basirma', nameEn: 'Basirma', nameKu: 'باسرمە', nameAr: 'باسرمة', latitude: 36.5000, longitude: 44.3333 },
          { id: 'balisan', nameEn: 'Balisan', nameKu: 'بالیسان', nameAr: 'باليسان', latitude: 36.3500, longitude: 44.5333 },
          { id: 'bastora', nameEn: 'Bastora', nameKu: 'بەستۆڕە', nameAr: 'بستورة', latitude: 36.3333, longitude: 44.1500 },
        ],
      },
      {
        id: 'soran',
        nameEn: 'Soran (Independent Admin)',
        nameKu: 'ئیدارەی سەربەخۆی سۆران',
        nameAr: 'إدارة سوران المستقلة',
        latitude: 36.6542,
        longitude: 44.5417,
        subDistricts: [
          { id: 'diana', nameEn: 'Diana', nameKu: 'دیانا', nameAr: 'ديانا', latitude: 36.6667, longitude: 44.5500 },
          { id: 'khalifan', nameEn: 'Khalifan', nameKu: 'خەلیفان', nameAr: 'خليفان', latitude: 36.6000, longitude: 44.4000 },
          { id: 'sidakan', nameEn: 'Sidakan', nameKu: 'سیدەکان', nameAr: 'سيدكان', latitude: 36.8000, longitude: 44.7000 },
          { id: 'bradost', nameEn: 'Bradost', nameKu: 'برادۆست', nameAr: 'برادوست', latitude: 36.8500, longitude: 44.6000 },
          { id: 'bekhal', nameEn: 'Bekhal', nameKu: 'بێخاڵ', nameAr: 'بيخال', latitude: 36.6167, longitude: 44.5000 },
        ],
      },
      {
        id: 'rawanduz',
        nameEn: 'Rawanduz',
        nameKu: 'ڕواندز',
        nameAr: 'رواندز',
        latitude: 36.6111,
        longitude: 44.5250,
        subDistricts: [
          { id: 'rawanduz-center', nameEn: 'Rawanduz Center', nameKu: 'ناوەندی ڕواندز', nameAr: 'مركز رواندز', latitude: 36.6111, longitude: 44.5250 },
          { id: 'warte', nameEn: 'Warte', nameKu: 'وەرتێ', nameAr: 'ورتي', latitude: 36.5167, longitude: 44.7500 },
        ],
      },
      {
        id: 'choman',
        nameEn: 'Choman',
        nameKu: 'چۆمان',
        nameAr: 'چومان',
        latitude: 36.6333,
        longitude: 44.8833,
        subDistricts: [
          { id: 'choman-center', nameEn: 'Choman Center', nameKu: 'ناوەندی چۆمان', nameAr: 'مركز چومان', latitude: 36.6333, longitude: 44.8833 },
          { id: 'haji-omaran', nameEn: 'Haji Omaran', nameKu: 'حاجی ئۆمەران', nameAr: 'حاجي عمران', latitude: 36.6833, longitude: 45.0500 },
          { id: 'galala', nameEn: 'Galala', nameKu: 'گەڵاڵە', nameAr: 'كلالة', latitude: 36.6000, longitude: 44.8167 },
          { id: 'qasre', nameEn: 'Qasre', nameKu: 'قەسرێ', nameAr: 'قسري', latitude: 36.5500, longitude: 44.8000 },
        ],
      },
      {
        id: 'mergasor',
        nameEn: 'Mergasor',
        nameKu: 'مێرگەسۆر',
        nameAr: 'ميركسور',
        latitude: 36.8500,
        longitude: 44.3000,
        subDistricts: [
          { id: 'barzan', nameEn: 'Barzan', nameKu: 'بارزان', nameAr: 'بارزان', latitude: 36.9000, longitude: 44.0333 },
          { id: 'piran', nameEn: 'Piran', nameKu: 'پیران', nameAr: 'بيران', latitude: 36.9167, longitude: 44.3833 },
          { id: 'shirwan-mazan', nameEn: 'Shirwan Mazan', nameKu: 'شێروان مەزن', nameAr: 'شيروان مازن', latitude: 36.9833, longitude: 44.4000 },
          { id: 'ble', nameEn: 'Ble', nameKu: 'بلێ', nameAr: 'بلي', latitude: 36.8333, longitude: 44.1667 },
          { id: 'goratu', nameEn: 'Goratu', nameKu: 'گۆڕەتوو', nameAr: 'كوروتو', latitude: 36.8667, longitude: 44.3167 },
        ],
      },
      {
        id: 'koya',
        nameEn: 'Koya',
        nameKu: 'کۆیە',
        nameAr: 'كويسنجق',
        latitude: 36.0833,
        longitude: 44.6333,
        subDistricts: [
          { id: 'koya-center', nameEn: 'Koya Center', nameKu: 'ناوەندی کۆیە', nameAr: 'مركز كويسنجق', latitude: 36.0833, longitude: 44.6333 },
          { id: 'taqtaq', nameEn: 'Taqtaq', nameKu: 'تەقتەق', nameAr: 'طقطق', latitude: 35.8833, longitude: 44.5833 },
          { id: 'shorsh-koya', nameEn: 'Shorsh', nameKu: 'شۆڕش', nameAr: 'شورش', latitude: 36.0167, longitude: 44.6000 },
          { id: 'ashti', nameEn: 'Ashti', nameKu: 'ئاشتی', nameAr: 'آشتي', latitude: 35.9500, longitude: 44.7333 },
          { id: 'sektan', nameEn: 'Sektan', nameKu: 'سکتان', nameAr: 'سكتان', latitude: 36.1833, longitude: 44.5667 },
        ],
      },
      {
        id: 'khabat',
        nameEn: 'Khabat',
        nameKu: 'خەبات',
        nameAr: 'خباط',
        latitude: 36.2667,
        longitude: 43.6833,
        subDistricts: [
          { id: 'khabat-center', nameEn: 'Khabat Center', nameKu: 'ناوەندی خەبات', nameAr: 'مركز خباط', latitude: 36.2667, longitude: 43.6833 },
          { id: 'rizgari-kalak', nameEn: 'Kalak / Rizgari', nameKu: 'کەڵەک', nameAr: 'كلك', latitude: 36.2667, longitude: 43.6500 },
          { id: 'darashakran', nameEn: 'Darashakran', nameKu: 'دارەشەکران', nameAr: 'دارشكران', latitude: 36.3833, longitude: 43.8333 },
          { id: 'topzawa', nameEn: 'Topzawa', nameKu: 'تۆپزاوە', nameAr: 'توبزاوا', latitude: 36.2833, longitude: 43.9000 },
        ],
      },
      {
        id: 'makhmur',
        nameEn: 'Makhmur',
        nameKu: 'مەخموور',
        nameAr: 'مخمور',
        latitude: 35.7744,
        longitude: 43.5858,
        subDistricts: [
          { id: 'makhmur-center', nameEn: 'Makhmur Center', nameKu: 'ناوەندی مەخموور', nameAr: 'مركز مخمور', latitude: 35.7744, longitude: 43.5858 },
          { id: 'qaraj', nameEn: 'Qaraj', nameKu: 'قەراج', nameAr: 'قراج', latitude: 35.7500, longitude: 43.4167 },
          { id: 'kandinawa', nameEn: 'Kandinawa', nameKu: 'کەندێناوە (دیبەگە)', nameAr: 'ديبكة', latitude: 35.9167, longitude: 43.7833 },
        ],
      },
    ],
  },

  {
    id: 'sulaymaniyah',
    nameEn: 'Sulaymaniyah',
    nameKu: 'سلێمانی',
    nameAr: 'السليمانية',
    region: 'Kurdistan',
    latitude: 35.5558,
    longitude: 45.4351,
    districts: [
      {
        id: 'sulaymaniyah-center',
        nameEn: 'Sulaymaniyah Center',
        nameKu: 'ناوەندی سلێمانی',
        nameAr: 'مركز السليمانية',
        latitude: 35.5558,
        longitude: 45.4351,
        subDistricts: [
          { id: 'bakrajo', nameEn: 'Bakrajo', nameKu: 'بەکرەجۆ', nameAr: 'بكرة جو', latitude: 35.5833, longitude: 45.3500 },
          { id: 'bazyan', nameEn: 'Bazyan', nameKu: 'بازیان', nameAr: 'بازيان', latitude: 35.6167, longitude: 45.1500 },
          { id: 'tanjaro', nameEn: 'Tanjaro', nameKu: 'تانجەرۆ', nameAr: 'تانجرو', latitude: 35.4833, longitude: 45.4167 },
          { id: 'sitak', nameEn: 'Sitak', nameKu: 'سیتەک', nameAr: 'سيتك', latitude: 35.6500, longitude: 45.5167 },
          { id: 'tasluja', nameEn: 'Tasluja', nameKu: 'تاسڵوجە', nameAr: 'طاسلوجة', latitude: 35.6000, longitude: 45.2500 },
          { id: 'sarchenar', nameEn: 'Sarchenar', nameKu: 'سەرچنار', nameAr: 'سرجنار', latitude: 35.5667, longitude: 45.3833 },
        ],
      },
      {
        id: 'dukan',
        nameEn: 'Dukan',
        nameKu: 'دووکان',
        nameAr: 'دوكان',
        latitude: 35.9547,
        longitude: 44.9603,
        subDistricts: [
          { id: 'dukan-center', nameEn: 'Dukan Center', nameKu: 'ناوەندی دووکان', nameAr: 'مركز دوكان', latitude: 35.9547, longitude: 44.9603 },
          { id: 'surdash', nameEn: 'Surdash', nameKu: 'سورداش', nameAr: 'سورداش', latitude: 35.8833, longitude: 45.0333 },
          { id: 'pirmagrun', nameEn: 'Pirmagrun', nameKu: 'پیرەمەگروون', nameAr: 'بيرمكرون', latitude: 35.7833, longitude: 45.1833 },
          { id: 'bingrd', nameEn: 'Bingrd', nameKu: 'بنگرد', nameAr: 'بنكرد', latitude: 36.0833, longitude: 44.9833 },
          { id: 'khidran', nameEn: 'Khidran', nameKu: 'خدران', nameAr: 'خدران', latitude: 36.0333, longitude: 44.8500 },
        ],
      },
      {
        id: 'ranya',
        nameEn: 'Ranya (Raparin Admin)',
        nameKu: 'ڕانیە (ئیدارەی ڕاپەڕین)',
        nameAr: 'رانية (إدارة رابرين)',
        latitude: 36.2556,
        longitude: 44.8828,
        subDistricts: [
          { id: 'ranya-center', nameEn: 'Ranya Center', nameKu: 'ناوەندی ڕانیە', nameAr: 'مركز رانية', latitude: 36.2556, longitude: 44.8828 },
          { id: 'chwarqurna', nameEn: 'Chwarqurna', nameKu: 'چوارقوڕنە', nameAr: 'جوارقرنة', latitude: 36.2000, longitude: 44.8167 },
          { id: 'betwata', nameEn: 'Betwata', nameKu: 'بێتواتە', nameAr: 'بيتواتة', latitude: 36.3167, longitude: 44.7500 },
          { id: 'sarkapkan', nameEn: 'Sarkapkan', nameKu: 'سەرکەپکان', nameAr: 'سركبكان', latitude: 36.3500, longitude: 44.9167 },
        ],
      },
      {
        id: 'qaladiza',
        nameEn: 'Qaladiza (Pshdar)',
        nameKu: 'قەڵادزێ (پشدەر)',
        nameAr: 'قلعة دزة (بشدر)',
        latitude: 36.1833,
        longitude: 45.1333,
        subDistricts: [
          { id: 'qaladiza-center', nameEn: 'Qaladiza Center', nameKu: 'ناوەندی قەڵادزێ', nameAr: 'مركز قلعة دزة', latitude: 36.1833, longitude: 45.1333 },
          { id: 'zharawa', nameEn: 'Zharawa', nameKu: 'ژاراوە', nameAr: 'زاراوة', latitude: 36.2500, longitude: 45.2000 },
          { id: 'halsho', nameEn: 'Halsho', nameKu: 'هەڵشۆ', nameAr: 'هلشو', latitude: 36.1500, longitude: 45.2333 },
          { id: 'hero', nameEn: 'Hero', nameKu: 'هێرۆ', nameAr: 'هيرو', latitude: 36.0833, longitude: 45.2833 },
          { id: 'isawa', nameEn: 'Isawa', nameKu: 'ئیسێوە', nameAr: 'عيسيوة', latitude: 36.2833, longitude: 45.1000 },
        ],
      },
      {
        id: 'saidsadiq',
        nameEn: 'Saidsadiq',
        nameKu: 'سەیدسادق',
        nameAr: 'سيد صادق',
        latitude: 35.3500,
        longitude: 45.8667,
        subDistricts: [
          { id: 'saidsadiq-center', nameEn: 'Saidsadiq Center', nameKu: 'ناوەندی سەیدسادق', nameAr: 'مركز سيد صادق', latitude: 35.3500, longitude: 45.8667 },
          { id: 'sirwan-ss', nameEn: 'Sirwan', nameKu: 'سیروان', nameAr: 'سيروان', latitude: 35.3167, longitude: 45.8833 },
          { id: 'barzinja', nameEn: 'Barzinja', nameKu: 'بەرزنجە', nameAr: 'برزنجة', latitude: 35.5333, longitude: 45.7167 },
          { id: 'sruchik', nameEn: 'Sruchik', nameKu: 'سرۆچک', nameAr: 'سروجك', latitude: 35.4500, longitude: 45.7500 },
        ],
      },
      {
        id: 'penjwen',
        nameEn: 'Penjwen',
        nameKu: 'پێنجوێن',
        nameAr: 'بنجوين',
        latitude: 35.6167,
        longitude: 45.9500,
        subDistricts: [
          { id: 'penjwen-center', nameEn: 'Penjwen Center', nameKu: 'ناوەندی پێنجوێن', nameAr: 'مركز بنجوين', latitude: 35.6167, longitude: 45.9500 },
          { id: 'garmik', nameEn: 'Garmik', nameKu: 'گەرمک', nameAr: 'كرمك', latitude: 35.6833, longitude: 46.0333 },
          { id: 'nalparez', nameEn: 'Nalparez', nameKu: 'نالباریز', nameAr: 'نالباريز', latitude: 35.5500, longitude: 45.8167 },
        ],
      },
      {
        id: 'sharazoor',
        nameEn: 'Sharazoor',
        nameKu: 'شارەزوور',
        nameAr: 'شهرزور',
        latitude: 35.3167,
        longitude: 45.7167,
        subDistricts: [
          { id: 'warmawa', nameEn: 'Warmawa (Zarayan)', nameKu: 'وارماوا (زەڕایەن)', nameAr: 'وارماوا (زراين)', latitude: 35.3167, longitude: 45.7167 },
        ],
      },
      {
        id: 'kalar',
        nameEn: 'Kalar (Garmian Admin)',
        nameKu: 'کەلار (ئیدارەی گەرمیان)',
        nameAr: 'كلار (إدارة كرميان)',
        latitude: 34.6289,
        longitude: 45.3164,
        subDistricts: [
          { id: 'kalar-center', nameEn: 'Kalar Center', nameKu: 'ناوەندی کەلار', nameAr: 'مركز كلار', latitude: 34.6289, longitude: 45.3164 },
          { id: 'rizgari-kalar', nameEn: 'Rizgari (Smud)', nameKu: 'ڕزگاری (سمود)', nameAr: 'رزكاري', latitude: 34.6833, longitude: 45.3333 },
          { id: 'pebaz', nameEn: 'Pebaz (Bawanur)', nameKu: 'پێباز (باوەنوور)', nameAr: 'بيباز', latitude: 34.8167, longitude: 45.4167 },
          { id: 'sheikh-tawil', nameEn: 'Sheikh Tawil', nameKu: 'شێخ تەویل', nameAr: 'شيخ طويل', latitude: 34.9000, longitude: 45.2500 },
        ],
      },
      {
        id: 'chamchamal',
        nameEn: 'Chamchamal',
        nameKu: 'چەمچەماڵ',
        nameAr: 'جمجمال',
        latitude: 35.5306,
        longitude: 44.8328,
        subDistricts: [
          { id: 'chamchamal-center', nameEn: 'Chamchamal Center', nameKu: 'ناوەندی چەمچەماڵ', nameAr: 'مركز جمجمال', latitude: 35.5306, longitude: 44.8328 },
          { id: 'shorsh-cc', nameEn: 'Shorsh', nameKu: 'شۆڕش', nameAr: 'شورش', latitude: 35.5167, longitude: 44.8000 },
          { id: 'sangaw', nameEn: 'Sangaw', nameKu: 'سەنگاو', nameAr: 'سنكاو', latitude: 35.3167, longitude: 45.0500 },
          { id: 'aghjalar', nameEn: 'Aghjalar', nameKu: 'ئاغجەلەر', nameAr: 'اغجلر', latitude: 35.7500, longitude: 44.8500 },
          { id: 'takya', nameEn: 'Takya Kakao', nameKu: 'تەکیەی کاکەمەند', nameAr: 'تكية', latitude: 35.5833, longitude: 44.9500 },
        ],
      },
      {
        id: 'darbandikhan',
        nameEn: 'Darbandikhan',
        nameKu: 'دەربەندیخان',
        nameAr: 'دربندخان',
        latitude: 35.1167,
        longitude: 45.7000,
        subDistricts: [
          { id: 'darbandikhan-center', nameEn: 'Darbandikhan Center', nameKu: 'ناوەندی دەربەندیخان', nameAr: 'مركز دربندخان', latitude: 35.1167, longitude: 45.7000 },
          { id: 'bawa-khoshen', nameEn: 'Bawa Khoshen', nameKu: 'باوەخۆشێن', nameAr: 'باوة خوشين', latitude: 35.1833, longitude: 45.6500 },
        ],
      },
      {
        id: 'kifri',
        nameEn: 'Kifri',
        nameKu: 'کفری',
        nameAr: 'كفري',
        latitude: 34.6947,
        longitude: 44.9608,
        subDistricts: [
          { id: 'kifri-center', nameEn: 'Kifri Center', nameKu: 'ناوەندی کفری', nameAr: 'مركز كفري', latitude: 34.6947, longitude: 44.9608 },
          { id: 'sarqala', nameEn: 'Sarqala', nameKu: 'سەرقەڵا', nameAr: 'سرقلعة', latitude: 34.7833, longitude: 45.0833 },
          { id: 'nawjul', nameEn: 'Nawjul', nameKu: 'نەوجول', nameAr: 'نوجول', latitude: 34.9500, longitude: 44.8500 },
          { id: 'koks', nameEn: 'Koks', nameKu: 'کۆکس', nameAr: 'كوكس', latitude: 34.6167, longitude: 44.8500 },
        ],
      },
    ],
  },

  {
    id: 'duhok',
    nameEn: 'Duhok',
    nameKu: 'دهۆک',
    nameAr: 'دهوك',
    region: 'Kurdistan',
    latitude: 36.8679,
    longitude: 42.9886,
    districts: [
      {
        id: 'duhok-center',
        nameEn: 'Duhok Center',
        nameKu: 'ناوەندی دهۆک',
        nameAr: 'مركز دهوك',
        latitude: 36.8679,
        longitude: 42.9886,
        subDistricts: [
          { id: 'duhok-city', nameEn: 'Duhok City', nameKu: 'شاری دهۆک', nameAr: 'مدينة دهوك', latitude: 36.8679, longitude: 42.9886 },
          { id: 'mangesh', nameEn: 'Mangesh', nameKu: 'مانگێشک', nameAr: 'مانكيش', latitude: 37.0333, longitude: 43.0833 },
          { id: 'zawita', nameEn: 'Zawita', nameKu: 'زاویتە', nameAr: 'زاويتة', latitude: 36.9000, longitude: 43.1500 },
        ],
      },
      {
        id: 'zakho',
        nameEn: 'Zakho (Independent Admin)',
        nameKu: 'ئیدارەی سەربەخۆی زاخۆ',
        nameAr: 'إدارة زاخو المستقلة',
        latitude: 37.1436,
        longitude: 42.6872,
        subDistricts: [
          { id: 'zakho-center', nameEn: 'Zakho Center', nameKu: 'ناوەندی زاخۆ', nameAr: 'مركز زاخو', latitude: 37.1436, longitude: 42.6872 },
          { id: 'batifa', nameEn: 'Batifa', nameKu: 'باتوفا', nameAr: 'باتيفا', latitude: 37.2000, longitude: 43.0167 },
          { id: 'darkar', nameEn: 'Darkar', nameKu: 'دەرکار', nameAr: 'دركار', latitude: 37.2167, longitude: 42.8333 },
          { id: 'rizgari-zakho', nameEn: 'Rizgari', nameKu: 'ڕزگاری', nameAr: 'رزكاري', latitude: 37.1000, longitude: 42.6500 },
          { id: 'ibrahim-khalil', nameEn: 'Ibrahim Khalil Border', nameKu: 'دەروازەی ئیبراهیم خەلیل', nameAr: 'منفذ إبراهيم الخليل', latitude: 37.1500, longitude: 42.5667 },
        ],
      },
      {
        id: 'semel',
        nameEn: 'Semel',
        nameKu: 'سێمێل',
        nameAr: 'سميل',
        latitude: 36.8583,
        longitude: 42.8500,
        subDistricts: [
          { id: 'semel-center', nameEn: 'Semel Center', nameKu: 'ناوەندی سێمێل', nameAr: 'مركز سميل', latitude: 36.8583, longitude: 42.8500 },
          { id: 'fayda', nameEn: 'Fayda', nameKu: 'فایدە', nameAr: 'فايدة', latitude: 36.7500, longitude: 42.9333 },
          { id: 'batel', nameEn: 'Batel', nameKu: 'باتێل', nameAr: 'باتيل', latitude: 36.9667, longitude: 42.7500 },
        ],
      },
      {
        id: 'amedi',
        nameEn: 'Amedi (Amadiya)',
        nameKu: 'ئامێدی',
        nameAr: 'العمادية',
        latitude: 37.0917,
        longitude: 43.4875,
        subDistricts: [
          { id: 'amedi-center', nameEn: 'Amedi Center', nameKu: 'ناوەندی ئامێدی', nameAr: 'مركز العمادية', latitude: 37.0917, longitude: 43.4875 },
          { id: 'deraluk', nameEn: 'Deraluk', nameKu: 'دێرەلووک', nameAr: 'ديرلوك', latitude: 37.0667, longitude: 43.6500 },
          { id: 'shiladze', nameEn: 'Shiladze', nameKu: 'شێلادزێ', nameAr: 'شيلادزي', latitude: 37.0500, longitude: 43.7833 },
          { id: 'sarsang', nameEn: 'Sarsang', nameKu: 'سەرسەنگ', nameAr: 'سرسنك', latitude: 37.0500, longitude: 43.3333 },
          { id: 'kani-masi', nameEn: 'Kani Masi', nameKu: 'کانی ماسێ', nameAr: 'كاني ماسي', latitude: 37.2333, longitude: 43.4333 },
          { id: 'bamarni', nameEn: 'Bamarni', nameKu: 'بامەڕنێ', nameAr: 'بامرني', latitude: 37.1167, longitude: 43.2667 },
        ],
      },
      {
        id: 'akre',
        nameEn: 'Akre (Aqrah)',
        nameKu: 'ئاکرێ',
        nameAr: 'عقرة',
        latitude: 36.7428,
        longitude: 43.8933,
        subDistricts: [
          { id: 'akre-center', nameEn: 'Akre Center', nameKu: 'ناوەندی ئاکرێ', nameAr: 'مركز عقرة', latitude: 36.7428, longitude: 43.8933 },
          { id: 'bjeel', nameEn: 'Bjeel', nameKu: 'بجیل', nameAr: 'بجيل', latitude: 36.7833, longitude: 44.0500 },
          { id: 'dinarta', nameEn: 'Dinarta', nameKu: 'دینارتە', nameAr: 'دينارتة', latitude: 36.8833, longitude: 43.9000 },
          { id: 'gardasen', nameEn: 'Gardasen', nameKu: 'گردەسێن', nameAr: 'كردسين', latitude: 36.6833, longitude: 43.7833 },
        ],
      },
      {
        id: 'bardarash',
        nameEn: 'Bardarash',
        nameKu: 'بەردەڕەش',
        nameAr: 'بردرش',
        latitude: 36.5167,
        longitude: 43.5833,
        subDistricts: [
          { id: 'bardarash-center', nameEn: 'Bardarash Center', nameKu: 'ناوەندی بەردەڕەش', nameAr: 'مركز بردرش', latitude: 36.5167, longitude: 43.5833 },
          { id: 'daratu-bar', nameEn: 'Daratu', nameKu: 'دارەتوو', nameAr: 'دارتوو', latitude: 36.4500, longitude: 43.6833 },
          { id: 'rovia', nameEn: 'Rovia', nameKu: 'ڕۆڤیا', nameAr: 'روفيا', latitude: 36.6167, longitude: 43.6500 },
          { id: 'kalak-bar', nameEn: 'Kalak', nameKu: 'کەڵەک', nameAr: 'كلك', latitude: 36.3167, longitude: 43.6167 },
        ],
      },
      {
        id: 'shekhan',
        nameEn: 'Shekhan',
        nameKu: 'شێخان (عەین سفنی)',
        nameAr: 'الشيخان',
        latitude: 36.7167,
        longitude: 43.3500,
        subDistricts: [
          { id: 'shekhan-center', nameEn: 'Shekhan Center', nameKu: 'ناوەندی شێخان', nameAr: 'مركز الشيخان', latitude: 36.7167, longitude: 43.3500 },
          { id: 'baadre', nameEn: 'Baadre', nameKu: 'باعەدرێ', nameAr: 'باعذرة', latitude: 36.7500, longitude: 43.2833 },
          { id: 'qasrok', nameEn: 'Qasrok', nameKu: 'قەسرۆک', nameAr: 'قصروك', latitude: 36.6833, longitude: 43.5000 },
          { id: 'zelkan', nameEn: 'Zelkan', nameKu: 'زێلکان', nameAr: 'زيلكان', latitude: 36.6333, longitude: 43.4000 },
        ],
      },
    ],
  },

  {
    id: 'halabja',
    nameEn: 'Halabja',
    nameKu: 'هەڵەبجە',
    nameAr: 'حلبجة',
    region: 'Kurdistan',
    latitude: 35.1778,
    longitude: 45.9861,
    districts: [
      {
        id: 'halabja-center',
        nameEn: 'Halabja Center',
        nameKu: 'ناوەندی هەڵەبجە',
        nameAr: 'مركز حلبجة',
        latitude: 35.1778,
        longitude: 45.9861,
        subDistricts: [
          { id: 'halabja-city', nameEn: 'Halabja City', nameKu: 'شاری هەڵەبجە', nameAr: 'مدينة حلبجة', latitude: 35.1778, longitude: 45.9861 },
          { id: 'khurmal', nameEn: 'Khurmal', nameKu: 'خورماڵ', nameAr: 'خورمال', latitude: 35.3167, longitude: 46.0333 },
          { id: 'byara', nameEn: 'Byara', nameKu: 'بیارە (هەورامان)', nameAr: 'بيارة', latitude: 35.2333, longitude: 46.1167 },
          { id: 'sirwan-h', nameEn: 'Sirwan', nameKu: 'سیروان', nameAr: 'سيروان', latitude: 35.1500, longitude: 45.9000 },
          { id: 'bamo', nameEn: 'Bamo', nameKu: 'بەمۆ', nameAr: 'بامو', latitude: 34.9500, longitude: 45.8500 },
          { id: 'tawella', nameEn: 'Tawella', nameKu: 'تەوێڵە', nameAr: 'طويلة', latitude: 35.2000, longitude: 46.1667 },
        ],
      },
    ],
  },

  {
    id: 'kirkuk',
    nameEn: 'Kirkuk',
    nameKu: 'کەرکووک',
    nameAr: 'كركوك',
    region: 'Kurdistan',
    latitude: 35.4681,
    longitude: 44.3922,
    districts: [
      {
        id: 'kirkuk-center',
        nameEn: 'Kirkuk Center',
        nameKu: 'ناوەندی کەرکووک',
        nameAr: 'مركز كركوك',
        latitude: 35.4681,
        longitude: 44.3922,
        subDistricts: [
          { id: 'kirkuk-city', nameEn: 'Kirkuk City', nameKu: 'شاری کەرکووک', nameAr: 'مدينة كركوك', latitude: 35.4681, longitude: 44.3922 },
          { id: 'alton-kopri', nameEn: 'Alton Kopri (Prde)', nameKu: 'پردێ (ئاڵتوون کۆپری)', nameAr: 'التون كوبري', latitude: 35.7500, longitude: 44.1500 },
          { id: 'lailan', nameEn: 'Lailan', nameKu: 'لەیلان', nameAr: 'ليلان', latitude: 35.3167, longitude: 44.5167 },
          { id: 'taza-khurmatu', nameEn: 'Taza Khurmatu', nameKu: 'تازەخورماتوو', nameAr: 'تازة خورماتو', latitude: 35.3000, longitude: 44.3333 },
          { id: 'shuwan', nameEn: 'Shuwan', nameKu: 'شووان', nameAr: 'شوان', latitude: 35.6167, longitude: 44.5500 },
          { id: 'yaychi', nameEn: 'Yaychi', nameKu: 'یایچی', nameAr: 'يايجي', latitude: 35.4333, longitude: 44.2333 },
        ],
      },
      {
        id: 'daquq',
        nameEn: 'Daquq',
        nameKu: 'داقووق',
        nameAr: 'دقوق',
        latitude: 35.1333,
        longitude: 44.4333,
        subDistricts: [
          { id: 'daquq-center', nameEn: 'Daquq Center', nameKu: 'ناوەندی داقووق', nameAr: 'مركز دقوق', latitude: 35.1333, longitude: 44.4333 },
          { id: 'rashad', nameEn: 'Rashad', nameKu: 'ڕەشاد', nameAr: 'الرشاد', latitude: 35.0500, longitude: 44.2167 },
        ],
      },
      {
        id: 'hawija',
        nameEn: 'Hawija',
        nameKu: 'حەویجە',
        nameAr: 'الحويجة',
        latitude: 35.3167,
        longitude: 43.7667,
        subDistricts: [
          { id: 'hawija-center', nameEn: 'Hawija Center', nameKu: 'ناوەندی حەویجە', nameAr: 'مركز الحويجة', latitude: 35.3167, longitude: 43.7667 },
          { id: 'abbasi', nameEn: 'Abbasi', nameKu: 'عەباسی', nameAr: 'العباسي', latitude: 35.3833, longitude: 43.6000 },
          { id: 'riyadh', nameEn: 'Riyadh', nameKu: 'ڕیاز', nameAr: 'الرياض', latitude: 35.2500, longitude: 43.9167 },
          { id: 'zab', nameEn: 'Zab', nameKu: 'زاب', nameAr: 'الزاب', latitude: 35.4833, longitude: 43.4333 },
        ],
      },
      {
        id: 'dibs',
        nameEn: 'Dibs',
        nameKu: 'دبس',
        nameAr: 'دبس',
        latitude: 35.6833,
        longitude: 44.1000,
        subDistricts: [
          { id: 'dibs-center', nameEn: 'Dibs Center', nameKu: 'ناوەندی دبس', nameAr: 'مركز دبس', latitude: 35.6833, longitude: 44.1000 },
          { id: 'sargaran', nameEn: 'Sargaran', nameKu: 'سەرگەڕان', nameAr: 'سركران', latitude: 35.7833, longitude: 43.9500 },
        ],
      },
    ],
  },

  // ================= FEDERAL IRAQ =================
  {
    id: 'baghdad',
    nameEn: 'Baghdad',
    nameKu: 'بەغدا',
    nameAr: 'بغداد',
    region: 'Federal Iraq',
    latitude: 33.3152,
    longitude: 44.3661,
    districts: [
      {
        id: 'rusafa',
        nameEn: 'Rusafa',
        nameKu: 'ڕوسافە',
        nameAr: 'الرصافة',
        latitude: 33.3500,
        longitude: 44.4000,
        subDistricts: [
          { id: 'karrada', nameEn: 'Karrada', nameKu: 'کەرادە', nameAr: 'الكرادة', latitude: 33.3000, longitude: 44.4333 },
          { id: 'sadr-city', nameEn: 'Sadr City', nameKu: 'شاری سەدر', nameAr: 'مدينة الصدر', latitude: 33.3833, longitude: 44.4667 },
          { id: 'adhamiyah', nameEn: 'Adhamiyah', nameKu: 'ئەعزەمیە', nameAr: 'الأعظمية', latitude: 33.3667, longitude: 44.3667 },
          { id: 'shaab', nameEn: 'Shaab', nameKu: 'شەعب', nameAr: 'الشعب', latitude: 33.4167, longitude: 44.4167 },
          { id: 'zafraniyah', nameEn: 'Zafraniyah', nameKu: 'زەعفەرانیە', nameAr: 'الزعفرانية', latitude: 33.2500, longitude: 44.4833 },
          { id: 'ghadeer', nameEn: 'Ghadeer & Baghdad Al-Jadida', nameKu: 'غەدیر و بەغدادی نوێ', nameAr: 'الغدير وبغداد الجديدة', latitude: 33.3167, longitude: 44.4667 },
        ],
      },
      {
        id: 'karkh',
        nameEn: 'Karkh',
        nameKu: 'کەرخ',
        nameAr: 'الكرخ',
        latitude: 33.3167,
        longitude: 44.3500,
        subDistricts: [
          { id: 'mansour', nameEn: 'Mansour', nameKu: 'مەنسوور', nameAr: 'المنصور', latitude: 33.3167, longitude: 44.3333 },
          { id: 'kadhimiya', nameEn: 'Kadhimiya', nameKu: 'کازمیە', nameAr: 'الكاظمية', latitude: 33.3833, longitude: 44.3333 },
          { id: 'yarmouk', nameEn: 'Yarmouk', nameKu: 'یەرمووک', nameAr: 'اليرموك', latitude: 33.2833, longitude: 44.3167 },
          { id: 'dora', nameEn: 'Dora', nameKu: 'دەورە', nameAr: 'الدورة', latitude: 33.2500, longitude: 44.3833 },
          { id: 'shula', nameEn: 'Shula', nameKu: 'شوعلە', nameAr: 'الشعلة', latitude: 33.3667, longitude: 44.2667 },
          { id: 'bayaa', nameEn: 'Bayaa', nameKu: 'بەییاع', nameAr: 'البياع', latitude: 33.2667, longitude: 44.3333 },
        ],
      },
      {
        id: 'baghdad-outskirts',
        nameEn: 'Baghdad Outskirts',
        nameKu: 'دەوروبەری بەغدا',
        nameAr: 'أطراف بغداد',
        latitude: 33.2000,
        longitude: 44.3000,
        subDistricts: [
          { id: 'mahmoudiyah', nameEn: 'Mahmoudiyah', nameKu: 'مەحموودیە', nameAr: 'المحمودية', latitude: 33.0667, longitude: 44.3500 },
          { id: 'abu-ghraib', nameEn: 'Abu Ghraib', nameKu: 'ئەبوو غرێب', nameAr: 'أبو غريب', latitude: 33.3000, longitude: 44.1833 },
          { id: 'tarmiyah', nameEn: 'Tarmiyah', nameKu: 'تارمیە', nameAr: 'الطارمية', latitude: 33.6667, longitude: 44.3833 },
          { id: 'madain', nameEn: 'Mada\'in (Salman Pak)', nameKu: 'مەدائن (سەلمان پاک)', nameAr: 'المدائن (سلمان باك)', latitude: 33.1000, longitude: 44.5833 },
          { id: 'taji', nameEn: 'Taji', nameKu: 'تاجی', nameAr: 'التاجي', latitude: 33.5167, longitude: 44.2667 },
        ],
      },
    ],
  },

  {
    id: 'nineveh',
    nameEn: 'Nineveh (Mosul)',
    nameKu: 'نەینەوا (مووسڵ)',
    nameAr: 'نينوى (الموصل)',
    region: 'Federal Iraq',
    latitude: 36.3400,
    longitude: 43.1300,
    districts: [
      {
        id: 'mosul',
        nameEn: 'Mosul Center',
        nameKu: 'ناوەندی مووسڵ',
        nameAr: 'مركز الموصل',
        latitude: 36.3400,
        longitude: 43.1300,
        subDistricts: [
          { id: 'left-bank-mosul', nameEn: 'Left Bank (East Mosul)', nameKu: 'بەری چەپ (ڕۆژهەڵات)', nameAr: 'الساحل الأيسر', latitude: 36.3500, longitude: 43.1667 },
          { id: 'right-bank-mosul', nameEn: 'Right Bank (West Mosul)', nameKu: 'بەری ڕاست (ڕۆژئاوا)', nameAr: 'الساحل الأيمن', latitude: 36.3333, longitude: 43.1000 },
          { id: 'shura', nameEn: 'Shura', nameKu: 'شوورە', nameAr: 'الشورة', latitude: 35.9167, longitude: 43.1500 },
          { id: 'hamam-alil', nameEn: 'Hamam al-Alil', nameKu: 'حەمام عەلیل', nameAr: 'حمام العليل', latitude: 36.1667, longitude: 43.2500 },
          { id: 'qayyara', nameEn: 'Qayyara', nameKu: 'قەیارە', nameAr: 'القيارة', latitude: 35.8000, longitude: 43.2833 },
        ],
      },
      {
        id: 'tal-afar',
        nameEn: 'Tal Afar',
        nameKu: 'تەلەعفەر',
        nameAr: 'تلعفر',
        latitude: 36.3764,
        longitude: 42.4511,
        subDistricts: [
          { id: 'tal-afar-center', nameEn: 'Tal Afar Center', nameKu: 'ناوەندی تەلەعفەر', nameAr: 'مركز تلعفر', latitude: 36.3764, longitude: 42.4511 },
          { id: 'ayadiya', nameEn: 'Ayadiya', nameKu: 'عەیازیە', nameAr: 'العياضية', latitude: 36.5167, longitude: 42.4167 },
          { id: 'zammar', nameEn: 'Zammar', nameKu: 'زومار', nameAr: 'زمار', latitude: 36.7833, longitude: 42.6000 },
          { id: 'rabia', nameEn: 'Rabia Border', nameKu: 'ڕەبیعە', nameAr: 'ربيعة', latitude: 36.8000, longitude: 42.1000 },
        ],
      },
      {
        id: 'sinjar',
        nameEn: 'Sinjar (Shingal)',
        nameKu: 'شنگال (سنجار)',
        nameAr: 'سنجار',
        latitude: 36.3200,
        longitude: 41.8600,
        subDistricts: [
          { id: 'sinjar-center', nameEn: 'Sinjar Center', nameKu: 'ناوەندی شنگال', nameAr: 'مركز سنجار', latitude: 36.3200, longitude: 41.8600 },
          { id: 'snuny', nameEn: 'Snuny', nameKu: 'سنوونێ', nameAr: 'سنوني', latitude: 36.5000, longitude: 41.7500 },
          { id: 'qahtaniyah-sinjar', nameEn: 'Qahtaniyah (Tel Uzair)', nameKu: 'قەحتانیە', nameAr: 'القحطانية', latitude: 36.1667, longitude: 41.9167 },
        ],
      },
      {
        id: 'hamdaniyah',
        nameEn: 'Hamdaniyah (Bakhdida)',
        nameKu: 'حەمدانیە (بەغدیدا)',
        nameAr: 'الحمدانية (بخديدا)',
        latitude: 36.2700,
        longitude: 43.3750,
        subDistricts: [
          { id: 'qaraqosh', nameEn: 'Qaraqosh / Bakhdida', nameKu: 'قەرەقۆش / بەغدیدا', nameAr: 'قره قوش / بخديدا', latitude: 36.2700, longitude: 43.3750 },
          { id: 'bartella', nameEn: 'Bartella', nameKu: 'بەرتڵە', nameAr: 'برطلة', latitude: 36.3500, longitude: 43.3833 },
          { id: 'nimrud', nameEn: 'Nimrud', nameKu: 'نەمرود', nameAr: 'النمرود', latitude: 36.1000, longitude: 43.3333 },
        ],
      },
      {
        id: 'tel-kaif',
        nameEn: 'Tel Kaif',
        nameKu: 'تەلکێف',
        nameAr: 'تلكيف',
        latitude: 36.4900,
        longitude: 43.1400,
        subDistricts: [
          { id: 'tel-kaif-center', nameEn: 'Tel Kaif Center', nameKu: 'ناوەندی تەلکێف', nameAr: 'مركز تلكيف', latitude: 36.4900, longitude: 43.1400 },
          { id: 'alqosh', nameEn: 'Alqosh', nameKu: 'ئەلقۆش', nameAr: 'ألقوش', latitude: 36.7333, longitude: 43.0958 },
          { id: 'wannah', nameEn: 'Wannah', nameKu: 'وانە', nameAr: 'وانة', latitude: 36.5500, longitude: 42.9167 },
        ],
      },
    ],
  },

  {
    id: 'basra',
    nameEn: 'Basra',
    nameKu: 'بەسرە',
    nameAr: 'البصرة',
    region: 'Federal Iraq',
    latitude: 30.5085,
    longitude: 47.7804,
    districts: [
      {
        id: 'basra-center',
        nameEn: 'Basra Center',
        nameKu: 'ناوەندی بەسرە',
        nameAr: 'مركز البصرة',
        latitude: 30.5085,
        longitude: 47.7804,
        subDistricts: [
          { id: 'ashar', nameEn: 'Ashar', nameKu: 'عەشار', nameAr: 'العشار', latitude: 30.5167, longitude: 47.8333 },
          { id: 'jubaila', nameEn: 'Jubaila', nameKu: 'جوبەیلە', nameAr: 'الجبيلة', latitude: 30.5333, longitude: 47.8000 },
          { id: 'hartha', nameEn: 'Hartha', nameKu: 'حارتە', nameAr: 'الهوير / الهارثة', latitude: 30.6000, longitude: 47.7500 },
        ],
      },
      {
        id: 'zubair',
        nameEn: 'Zubair',
        nameKu: 'زوبێر',
        nameAr: 'الزبير',
        latitude: 30.3897,
        longitude: 47.7019,
        subDistricts: [
          { id: 'zubair-center', nameEn: 'Zubair Center', nameKu: 'ناوەندی زوبێر', nameAr: 'مركز الزبير', latitude: 30.3897, longitude: 47.7019 },
          { id: 'safwan', nameEn: 'Safwan Border', nameKu: 'سەفوان', nameAr: 'صفوان', latitude: 30.1167, longitude: 47.7167 },
          { id: 'um-qasr', nameEn: 'Um Qasr Port', nameKu: 'ئوم قەسر', nameAr: 'أم قصر', latitude: 30.0333, longitude: 47.9333 },
        ],
      },
      {
        id: 'qurna',
        nameEn: 'Qurna',
        nameKu: 'قوڕنە',
        nameAr: 'القرنة',
        latitude: 31.0167,
        longitude: 47.4333,
        subDistricts: [
          { id: 'qurna-center', nameEn: 'Qurna Center', nameKu: 'ناوەندی قوڕنە', nameAr: 'مركز القرنة', latitude: 31.0167, longitude: 47.4333 },
          { id: 'thigher', nameEn: 'Thigher', nameKu: 'سغەر', nameAr: 'الثغر', latitude: 31.1167, longitude: 47.3833 },
        ],
      },
      {
        id: 'shatt-al-arab',
        nameEn: 'Shatt Al-Arab',
        nameKu: 'شەتولعەرەب',
        nameAr: 'شط العرب',
        latitude: 30.5500,
        longitude: 47.8833,
        subDistricts: [
          { id: 'tanuma', nameEn: 'Tanuma', nameKu: 'تەنوومە', nameAr: 'التنومة', latitude: 30.5500, longitude: 47.8833 },
        ],
      },
      {
        id: 'faw',
        nameEn: 'Al-Faw',
        nameKu: 'فاو',
        nameAr: 'الفاو',
        latitude: 29.9742,
        longitude: 48.4731,
        subDistricts: [
          { id: 'faw-center', nameEn: 'Al-Faw Center', nameKu: 'ناوەندی فاو', nameAr: 'مركز الفاو', latitude: 29.9742, longitude: 48.4731 },
        ],
      },
    ],
  },

  {
    id: 'najaf',
    nameEn: 'Najaf',
    nameKu: 'نەجەف',
    nameAr: 'النجف الأشرف',
    region: 'Federal Iraq',
    latitude: 32.0000,
    longitude: 44.3333,
    districts: [
      {
        id: 'najaf-center',
        nameEn: 'Najaf Center',
        nameKu: 'ناوەندی نەجەف',
        nameAr: 'مركز النجف',
        latitude: 32.0000,
        longitude: 44.3333,
        subDistricts: [
          { id: 'old-city-najaf', nameEn: 'Old City', nameKu: 'شاری کۆن', nameAr: 'المدينة القديمة', latitude: 32.0000, longitude: 44.3333 },
          { id: 'haidariyah', nameEn: 'Haidariyah', nameKu: 'حەیدەریە', nameAr: 'الحيدرية', latitude: 32.2500, longitude: 44.3000 },
        ],
      },
      {
        id: 'kufa',
        nameEn: 'Kufa',
        nameKu: 'کووفە',
        nameAr: 'الكوفة',
        latitude: 32.0333,
        longitude: 44.4000,
        subDistricts: [
          { id: 'kufa-center', nameEn: 'Kufa Center', nameKu: 'ناوەندی کووفە', nameAr: 'مركز الكوفة', latitude: 32.0333, longitude: 44.4000 },
          { id: 'abbasiyah-najaf', nameEn: 'Abbasiyah', nameKu: 'عەباسیە', nameAr: 'العباسية', latitude: 32.1000, longitude: 44.4500 },
        ],
      },
      {
        id: 'manathera',
        nameEn: 'Manathera',
        nameKu: 'مەنازیرە',
        nameAr: 'المناذرة',
        latitude: 31.8500,
        longitude: 44.5000,
        subDistricts: [
          { id: 'mishkhab', nameEn: 'Mishkhab', nameKu: 'میشخاب', nameAr: 'المشخاب', latitude: 31.8000, longitude: 44.4833 },
          { id: 'qadisiyah-sub', nameEn: 'Qadisiyah', nameKu: 'قادسیە', nameAr: 'القادسية', latitude: 31.7500, longitude: 44.5333 },
        ],
      },
    ],
  },

  {
    id: 'karbala',
    nameEn: 'Karbala',
    nameKu: 'کەربەلا',
    nameAr: 'كربلاء المقدسة',
    region: 'Federal Iraq',
    latitude: 32.6160,
    longitude: 44.0249,
    districts: [
      {
        id: 'karbala-center',
        nameEn: 'Karbala Center',
        nameKu: 'ناوەندی کەربەلا',
        nameAr: 'مركز كربلاء',
        latitude: 32.6160,
        longitude: 44.0249,
        subDistricts: [
          { id: 'old-city-karbala', nameEn: 'Old City & Shrines', nameKu: 'شاری کۆن و حەرەمەکان', nameAr: 'المدينة القديمة والعتبات', latitude: 32.6160, longitude: 44.0249 },
          { id: 'hurr', nameEn: 'Hurr', nameKu: 'حور', nameAr: 'الحر', latitude: 32.6500, longitude: 43.9833 },
          { id: 'husseiniya-karbala', nameEn: 'Husseiniya', nameKu: 'حوسێنیە', nameAr: 'الحسينية', latitude: 32.6833, longitude: 44.1167 },
        ],
      },
      {
        id: 'hindiyah',
        nameEn: 'Hindiyah (Tuwaireej)',
        nameKu: 'هیندیە (توێریج)',
        nameAr: 'الهندية (طويريج)',
        latitude: 32.5500,
        longitude: 44.2333,
        subDistricts: [
          { id: 'hindiyah-center', nameEn: 'Hindiyah Center', nameKu: 'ناوەندی هیندیە', nameAr: 'مركز الهندية', latitude: 32.5500, longitude: 44.2333 },
          { id: 'jadwal-gharbi', nameEn: 'Jadwal Gharbi', nameKu: 'جەدوەل غەربی', nameAr: 'الجدول الغربي', latitude: 32.5000, longitude: 44.2000 },
        ],
      },
      {
        id: 'ain-tamur',
        nameEn: 'Ain Al-Tamur (Shithatha)',
        nameKu: 'عەین تەمر',
        nameAr: 'عين التمر (شثاثة)',
        latitude: 32.5667,
        longitude: 43.4833,
        subDistricts: [
          { id: 'ain-tamur-center', nameEn: 'Ain Al-Tamur Center', nameKu: 'ناوەندی عەین تەمر', nameAr: 'مركز عين التمر', latitude: 32.5667, longitude: 43.4833 },
        ],
      },
    ],
  },

  {
    id: 'anbar',
    nameEn: 'Al-Anbar',
    nameKu: 'ئەنبار',
    nameAr: 'الأنبار',
    region: 'Federal Iraq',
    latitude: 33.4233,
    longitude: 43.2975,
    districts: [
      {
        id: 'ramadi',
        nameEn: 'Ramadi',
        nameKu: 'ڕەمادی',
        nameAr: 'الرمادي',
        latitude: 33.4233,
        longitude: 43.2975,
        subDistricts: [
          { id: 'ramadi-center', nameEn: 'Ramadi Center', nameKu: 'ناوەندی ڕەمادی', nameAr: 'مركز الرمادي', latitude: 33.4233, longitude: 43.2975 },
          { id: 'habbaniyah', nameEn: 'Habbaniyah', nameKu: 'حەبانیە', nameAr: 'الحبانية', latitude: 33.3667, longitude: 43.5833 },
          { id: 'khaldiyah', nameEn: 'Khaldiyah', nameKu: 'خالیدیە', nameAr: 'الخالدية', latitude: 33.3833, longitude: 43.5000 },
        ],
      },
      {
        id: 'fallujah',
        nameEn: 'Fallujah',
        nameKu: 'فەلووجە',
        nameAr: 'الفلوجة',
        latitude: 33.3500,
        longitude: 43.7833,
        subDistricts: [
          { id: 'fallujah-center', nameEn: 'Fallujah Center', nameKu: 'ناوەندی فەلووجە', nameAr: 'مركز الفلوجة', latitude: 33.3500, longitude: 43.7833 },
          { id: 'karmah', nameEn: 'Karmah', nameKu: 'کەرمە', nameAr: 'الكرمة', latitude: 33.4500, longitude: 43.9167 },
          { id: 'amiriyat-fallujah', nameEn: 'Amiriyat Al-Fallujah', nameKu: 'عامریەی فەلووجە', nameAr: 'عامرية الصمود', latitude: 33.2000, longitude: 43.8667 },
        ],
      },
      {
        id: 'hit',
        nameEn: 'Hit',
        nameKu: 'هیت',
        nameAr: 'هيت',
        latitude: 33.6400,
        longitude: 42.8250,
        subDistricts: [
          { id: 'hit-center', nameEn: 'Hit Center', nameKu: 'ناوەندی هیت', nameAr: 'مركز هيت', latitude: 33.6400, longitude: 42.8250 },
          { id: 'baghdadi', nameEn: 'Baghdadi', nameKu: 'بەغدادی', nameAr: 'البغدادي', latitude: 33.8500, longitude: 42.5500 },
          { id: 'kubaisa', nameEn: 'Kubaisa', nameKu: 'کوبەیسە', nameAr: 'كبيسة', latitude: 33.6000, longitude: 42.6667 },
        ],
      },
      {
        id: 'haditha',
        nameEn: 'Haditha',
        nameKu: 'حەدیسە',
        nameAr: 'حديثة',
        latitude: 34.1389,
        longitude: 42.3764,
        subDistricts: [
          { id: 'haditha-center', nameEn: 'Haditha Center', nameKu: 'ناوەندی حەدیسە', nameAr: 'مركز حديثة', latitude: 34.1389, longitude: 42.3764 },
          { id: 'haqlaniyah', nameEn: 'Haqlaniyah', nameKu: 'حەقلانیە', nameAr: 'الحقلانية', latitude: 34.0833, longitude: 42.3667 },
          { id: 'barwanah', nameEn: 'Barwanah', nameKu: 'بەروانە', nameAr: 'بروانة', latitude: 34.1500, longitude: 42.3500 },
        ],
      },
      {
        id: 'qaim',
        nameEn: 'Al-Qaim Border',
        nameKu: 'قائیم',
        nameAr: 'القائم',
        latitude: 34.3667,
        longitude: 41.1167,
        subDistricts: [
          { id: 'qaim-center', nameEn: 'Al-Qaim Center', nameKu: 'ناوەندی قائیم', nameAr: 'مركز القائم', latitude: 34.3667, longitude: 41.1167 },
          { id: 'husaybah', nameEn: 'Husaybah Border', nameKu: 'حوسەیبە', nameAr: 'حصيبة', latitude: 34.3833, longitude: 41.0500 },
          { id: 'obaidi', nameEn: 'Obaidi', nameKu: 'عوبەیدی', nameAr: 'العبيدي', latitude: 34.3333, longitude: 41.2500 },
        ],
      },
      {
        id: 'rutba',
        nameEn: 'Al-Rutba',
        nameKu: 'ڕوتبە',
        nameAr: 'الرطبة',
        latitude: 33.0333,
        longitude: 40.2833,
        subDistricts: [
          { id: 'rutba-center', nameEn: 'Al-Rutba Center', nameKu: 'ناوەندی ڕوتبە', nameAr: 'مركز الرطبة', latitude: 33.0333, longitude: 40.2833 },
          { id: 'walid-border', nameEn: 'Al-Walid Border', nameKu: 'مەرزی وەلید', nameAr: 'منفذ الوليد', latitude: 33.4167, longitude: 38.9333 },
        ],
      },
    ],
  },

  {
    id: 'diyala',
    nameEn: 'Diyala',
    nameKu: 'دیالە',
    nameAr: 'ديالى',
    region: 'Federal Iraq',
    latitude: 33.7500,
    longitude: 44.6000,
    districts: [
      {
        id: 'baqubah',
        nameEn: 'Baqubah',
        nameKu: 'بەعقووبە',
        nameAr: 'بعقوبة',
        latitude: 33.7500,
        longitude: 44.6000,
        subDistricts: [
          { id: 'baqubah-center', nameEn: 'Baqubah Center', nameKu: 'ناوەندی بەعقووبە', nameAr: 'مركز بعقوبة', latitude: 33.7500, longitude: 44.6000 },
          { id: 'buhriz', nameEn: 'Buhriz', nameKu: 'بوهریز', nameAr: 'بهرز', latitude: 33.7000, longitude: 44.6333 },
          { id: 'kanaan', nameEn: 'Kanaan', nameKu: 'کەنعان', nameAr: 'كنعان', latitude: 33.6833, longitude: 44.8167 },
        ],
      },
      {
        id: 'khanaqin',
        nameEn: 'Khanaqin',
        nameKu: 'خانەقین',
        nameAr: 'خانقين',
        latitude: 34.3500,
        longitude: 45.3833,
        subDistricts: [
          { id: 'khanaqin-center', nameEn: 'Khanaqin Center', nameKu: 'ناوەندی خانەقین', nameAr: 'مركز خانقين', latitude: 34.3500, longitude: 45.3833 },
          { id: 'jalawla', nameEn: 'Jalawla', nameKu: 'جەلەولا', nameAr: 'جلولاء', latitude: 34.2833, longitude: 45.1667 },
          { id: 'saadiyah', nameEn: 'Saadiyah', nameKu: 'سەعدیە (قزڵڕەبات)', nameAr: 'السعدية', latitude: 34.1833, longitude: 45.1167 },
          { id: 'qara-tapa', nameEn: 'Qara Tapa', nameKu: 'قەرەتەپە', nameAr: 'قره تبه', latitude: 34.4500, longitude: 44.9167 },
          { id: 'munziriya', nameEn: 'Munziriya Border', nameKu: 'مەرزی مەنزریە', nameAr: 'منفذ المنذرية', latitude: 34.4167, longitude: 45.5167 },
        ],
      },
      {
        id: 'muqdadiyah',
        nameEn: 'Muqdadiyah (Shahraban)',
        nameKu: 'میقدادیە (شارەبان)',
        nameAr: 'المقدادية (شهربان)',
        latitude: 33.9833,
        longitude: 44.9333,
        subDistricts: [
          { id: 'muqdadiyah-center', nameEn: 'Muqdadiyah Center', nameKu: 'ناوەندی میقدادیە', nameAr: 'مركز المقدادية', latitude: 33.9833, longitude: 44.9333 },
          { id: 'abi-saida', nameEn: 'Abi Saida', nameKu: 'ئەبی سەیدە', nameAr: 'أبي صيدا', latitude: 33.8833, longitude: 44.8500 },
        ],
      },
      {
        id: 'khalis',
        nameEn: 'Al-Khalis',
        nameKu: 'خاڵس',
        nameAr: 'الخالص',
        latitude: 33.8667,
        longitude: 44.5167,
        subDistricts: [
          { id: 'khalis-center', nameEn: 'Al-Khalis Center', nameKu: 'ناوەندی خاڵس', nameAr: 'مركز الخالص', latitude: 33.8667, longitude: 44.5167 },
          { id: 'mansouriyah', nameEn: 'Mansouriyah', nameKu: 'مەنسووریە', nameAr: 'المنصورية', latitude: 34.0500, longitude: 44.8333 },
          { id: 'adheim', nameEn: 'Al-Adheim', nameKu: 'عوزێم', nameAr: 'العظيم', latitude: 34.3000, longitude: 44.5000 },
        ],
      },
      {
        id: 'balad-ruz',
        nameEn: 'Balad Ruz',
        nameKu: 'بەلەد ڕووز',
        nameAr: 'بلدروز',
        latitude: 33.7000,
        longitude: 45.0833,
        subDistricts: [
          { id: 'balad-ruz-center', nameEn: 'Balad Ruz Center', nameKu: 'ناوەندی بەلەد ڕووز', nameAr: 'مركز بلدروز', latitude: 33.7000, longitude: 45.0833 },
          { id: 'mandali', nameEn: 'Mandali', nameKu: 'مەندەلی', nameAr: 'مندلي', latitude: 33.7500, longitude: 45.5500 },
          { id: 'qazaniyah', nameEn: 'Qazaniyah', nameKu: 'قەزانیە', nameAr: 'قزانية', latitude: 33.6000, longitude: 45.6667 },
        ],
      },
    ],
  },

  {
    id: 'salah-al-din',
    nameEn: 'Salah Al-Din',
    nameKu: 'سەلاحەدین',
    nameAr: 'صلاح الدين',
    region: 'Federal Iraq',
    latitude: 34.6000,
    longitude: 43.6833,
    districts: [
      {
        id: 'tikrit',
        nameEn: 'Tikrit',
        nameKu: 'تکریت',
        nameAr: 'تكريت',
        latitude: 34.6000,
        longitude: 43.6833,
        subDistricts: [
          { id: 'tikrit-center', nameEn: 'Tikrit Center', nameKu: 'ناوەندی تکریت', nameAr: 'مركز تكريت', latitude: 34.6000, longitude: 43.6833 },
          { id: 'awja', nameEn: 'Al-Awja', nameKu: 'عەوجە', nameAr: 'العوجة', latitude: 34.5333, longitude: 43.7167 },
        ],
      },
      {
        id: 'samarra',
        nameEn: 'Samarra',
        nameKu: 'سامەڕا',
        nameAr: 'سامراء',
        latitude: 34.2000,
        longitude: 43.8833,
        subDistricts: [
          { id: 'samarra-center', nameEn: 'Samarra Center & Shrine', nameKu: 'ناوەندی سامەڕا', nameAr: 'مركز سامراء', latitude: 34.2000, longitude: 43.8833 },
          { id: 'mutassim', nameEn: 'Al-Mu\'tassim', nameKu: 'موعتەسەم', nameAr: 'المعتصم', latitude: 34.1500, longitude: 44.0500 },
        ],
      },
      {
        id: 'tuz-khurmatu',
        nameEn: 'Tuz Khurmatu',
        nameKu: 'دووزخورماتوو',
        nameAr: 'طوز خورماتو',
        latitude: 34.8833,
        longitude: 44.6333,
        subDistricts: [
          { id: 'tuz-center', nameEn: 'Tuz Center', nameKu: 'ناوەندی دووزخورماتوو', nameAr: 'مركز الطوز', latitude: 34.8833, longitude: 44.6333 },
          { id: 'sulaiman-bek', nameEn: 'Sulaiman Bek', nameKu: 'سلێمان بەگ', nameAr: 'سليمان بيك', latitude: 34.7833, longitude: 44.6833 },
          { id: 'amerli', nameEn: 'Amerli', nameKu: 'ئامرلی', nameAr: 'آمرلي', latitude: 34.7333, longitude: 44.5833 },
          { id: 'yengija', nameEn: 'Yengija', nameKu: 'یەنگیجە', nameAr: 'ينكجة', latitude: 34.8500, longitude: 44.5667 },
        ],
      },
      {
        id: 'balad',
        nameEn: 'Balad',
        nameKu: 'بەلەد',
        nameAr: 'بلد',
        latitude: 34.0167,
        longitude: 44.1500,
        subDistricts: [
          { id: 'balad-center', nameEn: 'Balad Center', nameKu: 'ناوەندی بەلەد', nameAr: 'مركز بلد', latitude: 34.0167, longitude: 44.1500 },
          { id: 'ishaqi', nameEn: 'Al-Ishaqi', nameKu: 'ئیسحاقی', nameAr: 'الإسحاقي', latitude: 34.1000, longitude: 44.1167 },
          { id: 'yathrib', nameEn: 'Yathrib', nameKu: 'یەثرب', nameAr: 'يثرب', latitude: 33.9500, longitude: 44.2500 },
        ],
      },
      {
        id: 'dujail',
        nameEn: 'Al-Dujail',
        nameKu: 'دوجەیل',
        nameAr: 'الدجيل',
        latitude: 33.8833,
        longitude: 44.2333,
        subDistricts: [
          { id: 'dujail-center', nameEn: 'Dujail Center', nameKu: 'ناوەندی دوجەیل', nameAr: 'مركز الدجيل', latitude: 33.8833, longitude: 44.2333 },
        ],
      },
      {
        id: 'baiji',
        nameEn: 'Baiji',
        nameKu: 'بەیجی',
        nameAr: 'بيجي',
        latitude: 34.9333,
        longitude: 43.4833,
        subDistricts: [
          { id: 'baiji-center', nameEn: 'Baiji Center', nameKu: 'ناوەندی بەیجی', nameAr: 'مركز بيجي', latitude: 34.9333, longitude: 43.4833 },
          { id: 'seniyah', nameEn: 'Al-Seniyah', nameKu: 'سینیە', nameAr: 'الصينية', latitude: 34.9500, longitude: 43.3333 },
        ],
      },
      {
        id: 'shirqat',
        nameEn: 'Al-Shirqat',
        nameKu: 'شەرقات',
        nameAr: 'الشرقاط',
        latitude: 35.5000,
        longitude: 43.2500,
        subDistricts: [
          { id: 'shirqat-center', nameEn: 'Shirqat Center', nameKu: 'ناوەندی شەرقات', nameAr: 'مركز الشرقاط', latitude: 35.5000, longitude: 43.2500 },
          { id: 'ashur', nameEn: 'Ashur', nameKu: 'ئاشوور', nameAr: 'آشور', latitude: 35.4500, longitude: 43.2667 },
        ],
      },
    ],
  },

  {
    id: 'babil',
    nameEn: 'Babil (Babylon)',
    nameKu: 'بابل',
    nameAr: 'بابل',
    region: 'Federal Iraq',
    latitude: 32.4833,
    longitude: 44.4333,
    districts: [
      {
        id: 'hillah',
        nameEn: 'Al-Hillah Center',
        nameKu: 'ناوەندی حیللە',
        nameAr: 'مركز الحلة',
        latitude: 32.4833,
        longitude: 44.4333,
        subDistricts: [
          { id: 'hillah-city', nameEn: 'Hillah City', nameKu: 'شاری حیللە', nameAr: 'مدينة الحلة', latitude: 32.4833, longitude: 44.4333 },
          { id: 'kifl', nameEn: 'Al-Kifl', nameKu: 'کفل', nameAr: 'الكفل', latitude: 32.2167, longitude: 44.3833 },
        ],
      },
      {
        id: 'mahawil',
        nameEn: 'Al-Mahawil',
        nameKu: 'مەحاویل',
        nameAr: 'المحاويل',
        latitude: 32.6500,
        longitude: 44.4167,
        subDistricts: [
          { id: 'mahawil-center', nameEn: 'Mahawil Center', nameKu: 'ناوەندی مەحاویل', nameAr: 'مركز المحاويل', latitude: 32.6500, longitude: 44.4167 },
          { id: 'mashrou', nameEn: 'Mashrou', nameKu: 'مەشروع', nameAr: 'المشروع', latitude: 32.7333, longitude: 44.4500 },
        ],
      },
      {
        id: 'musayyib',
        nameEn: 'Al-Musayyib',
        nameKu: 'موسەییب',
        nameAr: 'المسيب',
        latitude: 32.7833,
        longitude: 44.3000,
        subDistricts: [
          { id: 'musayyib-center', nameEn: 'Musayyib Center', nameKu: 'ناوەندی موسەییب', nameAr: 'مركز المسيب', latitude: 32.7833, longitude: 44.3000 },
          { id: 'saddat-al-hindiyah', nameEn: 'Saddat Al-Hindiyah', nameKu: 'سەددەی هیندیە', nameAr: 'سدة الهندية', latitude: 32.7167, longitude: 44.2833 },
          { id: 'jurf-al-sakhar', nameEn: 'Jurf Al-Nasr', nameKu: 'جورفولنەسر', nameAr: 'جرف النصر', latitude: 32.8833, longitude: 44.1500 },
          { id: 'iskandariyah', nameEn: 'Iskandariyah', nameKu: 'ئەسکەندەریە', nameAr: 'الإسكندرية', latitude: 32.9000, longitude: 44.3500 },
        ],
      },
      {
        id: 'hashimiyah',
        nameEn: 'Al-Hashimiyah',
        nameKu: 'هاشمیە',
        nameAr: 'الهاشمية',
        latitude: 32.3500,
        longitude: 44.6000,
        subDistricts: [
          { id: 'hashimiyah-center', nameEn: 'Hashimiyah Center', nameKu: 'ناوەندی هاشمیە', nameAr: 'مركز الهاشمية', latitude: 32.3500, longitude: 44.6000 },
          { id: 'midhatiya', nameEn: 'Al-Midhatiya (Hamza Al-Gharbi)', nameKu: 'مەدحەتیە', nameAr: 'المدحتية (الحمزة الغربي)', latitude: 32.3667, longitude: 44.6833 },
          { id: 'shomali', nameEn: 'Al-Shomali', nameKu: 'شومەلی', nameAr: 'الشوملي', latitude: 32.2833, longitude: 44.8667 },
          { id: 'taleaa', nameEn: 'Al-Taleaa', nameKu: 'تەلیعە', nameAr: 'الطليعة', latitude: 32.2167, longitude: 44.7500 },
        ],
      },
    ],
  },

  {
    id: 'wasit',
    nameEn: 'Wasit (Kut)',
    nameKu: 'واسیت (کووت)',
    nameAr: 'واسط (الكوت)',
    region: 'Federal Iraq',
    latitude: 32.5000,
    longitude: 45.8333,
    districts: [
      {
        id: 'kut',
        nameEn: 'Al-Kut Center',
        nameKu: 'ناوەندی کووت',
        nameAr: 'مركز الكوت',
        latitude: 32.5000,
        longitude: 45.8333,
        subDistricts: [
          { id: 'kut-city', nameEn: 'Kut City', nameKu: 'شاری کووت', nameAr: 'مدينة الكوت', latitude: 32.5000, longitude: 45.8333 },
          { id: 'wasit-sub', nameEn: 'Wasit', nameKu: 'واسیت', nameAr: 'واسط', latitude: 32.4000, longitude: 46.0333 },
          { id: 'sheikh-saad', nameEn: 'Sheikh Saad', nameKu: 'شێخ سەعد', nameAr: 'شيخ سعد', latitude: 32.5667, longitude: 46.3000 },
        ],
      },
      {
        id: 'suwayrah',
        nameEn: 'Al-Suwayrah',
        nameKu: 'سوێرە',
        nameAr: 'الصويرة',
        latitude: 32.9167,
        longitude: 44.7833,
        subDistricts: [
          { id: 'suwayrah-center', nameEn: 'Suwayrah Center', nameKu: 'ناوەندی سوێرە', nameAr: 'مركز الصويرة', latitude: 32.9167, longitude: 44.7833 },
          { id: 'zubaydiyah', nameEn: 'Zubaydiyah', nameKu: 'زوبەیدیە', nameAr: 'الزبيدية', latitude: 32.8000, longitude: 45.1667 },
          { id: 'shahamiyah', nameEn: 'Shahamiyah', nameKu: 'شەحامیە', nameAr: 'الشحيمية', latitude: 32.7000, longitude: 45.0000 },
        ],
      },
      {
        id: 'hai',
        nameEn: 'Al-Hai',
        nameKu: 'حەی',
        nameAr: 'الحي',
        latitude: 32.1667,
        longitude: 46.0500,
        subDistricts: [
          { id: 'hai-center', nameEn: 'Hai Center', nameKu: 'ناوەندی حەی', nameAr: 'مركز الحي', latitude: 32.1667, longitude: 46.0500 },
          { id: 'muwaffaqiyah', nameEn: 'Muwaffaqiyah', nameKu: 'موەفەقیە', nameAr: 'الموفقية', latitude: 32.3333, longitude: 45.9167 },
          { id: 'bashaer', nameEn: 'Bashaer', nameKu: 'بەشائیر', nameAr: 'البشائر', latitude: 32.0833, longitude: 46.2167 },
        ],
      },
      {
        id: 'badra',
        nameEn: 'Badra Border',
        nameKu: 'بەدرە',
        nameAr: 'بدرة',
        latitude: 33.0000,
        longitude: 45.9667,
        subDistricts: [
          { id: 'badra-center', nameEn: 'Badra Center', nameKu: 'ناوەندی بەدرە', nameAr: 'مركز بدرة', latitude: 33.0000, longitude: 45.9667 },
          { id: 'jassan', nameEn: 'Jassan', nameKu: 'جەسان', nameAr: 'جصان', latitude: 32.8833, longitude: 46.0500 },
          { id: 'zurbatiyah', nameEn: 'Zurbatiyah Border', nameKu: 'مەرزی زرباتیە', nameAr: 'منفذ زرباطية', latitude: 33.1000, longitude: 46.2500 },
        ],
      },
      {
        id: 'numaniyah',
        nameEn: 'Al-Nu\'maniyah',
        nameKu: 'نوعمانیە',
        nameAr: 'النعمانية',
        latitude: 32.5500,
        longitude: 45.4167,
        subDistricts: [
          { id: 'numaniyah-center', nameEn: 'Nu\'maniyah Center', nameKu: 'ناوەندی نوعمانیە', nameAr: 'مركز النعمانية', latitude: 32.5500, longitude: 45.4167 },
          { id: 'ahrar', nameEn: 'Al-Ahrar', nameKu: 'ئەحرار', nameAr: 'الأحرار', latitude: 32.4833, longitude: 45.6000 },
        ],
      },
    ],
  },

  {
    id: 'dhi-qar',
    nameEn: 'Dhi Qar (Nasiriyah)',
    nameKu: 'زیقار (ناسیریە)',
    nameAr: 'ذي قار (الناصرية)',
    region: 'Federal Iraq',
    latitude: 31.0500,
    longitude: 46.2500,
    districts: [
      {
        id: 'nasiriyah',
        nameEn: 'Nasiriyah Center',
        nameKu: 'ناوەندی ناسیریە',
        nameAr: 'مركز الناصرية',
        latitude: 31.0500,
        longitude: 46.2500,
        subDistricts: [
          { id: 'nasiriyah-city', nameEn: 'Nasiriyah City', nameKu: 'شاری ناسیریە', nameAr: 'مدينة الناصرية', latitude: 31.0500, longitude: 46.2500 },
          { id: 'batha', nameEn: 'Batha', nameKu: 'بەتحا', nameAr: 'البطحاء', latitude: 31.1167, longitude: 45.9667 },
          { id: 'sayid-dakheel', nameEn: 'Sayid Dakheel', nameKu: 'سەید دەخیل', nameAr: 'سيد دخيل', latitude: 31.1333, longitude: 46.4167 },
          { id: 'islah', nameEn: 'Islah', nameKu: 'ئیسڵاح', nameAr: 'الإصلاح', latitude: 31.1833, longitude: 46.5500 },
        ],
      },
      {
        id: 'shatrah',
        nameEn: 'Al-Shatrah',
        nameKu: 'شەترە',
        nameAr: 'الشطرة',
        latitude: 31.4167,
        longitude: 46.1667,
        subDistricts: [
          { id: 'shatrah-center', nameEn: 'Shatrah Center', nameKu: 'ناوەندی شەترە', nameAr: 'مركز الشطرة', latitude: 31.4167, longitude: 46.1667 },
          { id: 'dawayah', nameEn: 'Al-Dawayah', nameKu: 'دەوایە', nameAr: 'الدواية', latitude: 31.5500, longitude: 46.3333 },
          { id: 'gharaf', nameEn: 'Al-Gharaf', nameKu: 'غەڕاف', nameAr: 'الغراف', latitude: 31.2833, longitude: 46.2333 },
        ],
      },
      {
        id: 'rifai',
        nameEn: 'Al-Rifa\'i',
        nameKu: 'ڕیفاعی',
        nameAr: 'الرفاعي',
        latitude: 31.6500,
        longitude: 46.1000,
        subDistricts: [
          { id: 'rifai-center', nameEn: 'Rifa\'i Center', nameKu: 'ناوەندی ڕیفاعی', nameAr: 'مركز الرفاعي', latitude: 31.6500, longitude: 46.1000 },
          { id: 'qalad-sukkar', nameEn: 'Qal\'at Sukkar', nameKu: 'قەڵای سوککەر', nameAr: 'قلعة سكر', latitude: 31.8667, longitude: 46.0833 },
          { id: 'fajr', nameEn: 'Al-Fajr', nameKu: 'فەجر', nameAr: 'الفجر', latitude: 31.9833, longitude: 46.0333 },
          { id: 'nasr-sub', nameEn: 'Al-Nasr', nameKu: 'نەسر', nameAr: 'النصر', latitude: 31.5500, longitude: 46.1333 },
        ],
      },
      {
        id: 'suq-al-shuyukh',
        nameEn: 'Suq Al-Shuyukh',
        nameKu: 'سووقوشویووخ',
        nameAr: 'سوق الشيوخ',
        latitude: 30.8833,
        longitude: 46.4667,
        subDistricts: [
          { id: 'suq-center', nameEn: 'Suq Al-Shuyukh Center', nameKu: 'ناوەندی سووقوشویووخ', nameAr: 'مركز سوق الشيوخ', latitude: 30.8833, longitude: 46.4667 },
          { id: 'fudaliyah', nameEn: 'Fudaliyah', nameKu: 'فوزەلیە', nameAr: 'الفضلية', latitude: 30.9667, longitude: 46.3667 },
          { id: 'karmat-beni-saeed', nameEn: 'Karmat Beni Saeed', nameKu: 'کەرمەی بەنی سەعید', nameAr: 'كرمة بني سعيد', latitude: 30.8000, longitude: 46.6000 },
          { id: 'tar', nameEn: 'Al-Tar', nameKu: 'تار', nameAr: 'الطار', latitude: 30.7667, longitude: 46.6833 },
        ],
      },
      {
        id: 'chibayish',
        nameEn: 'Al-Chibayish (Marshes)',
        nameKu: 'چباییش (زۆنگاوەکان)',
        nameAr: 'الجبايش (الأهوار)',
        latitude: 30.9500,
        longitude: 46.9833,
        subDistricts: [
          { id: 'chibayish-center', nameEn: 'Chibayish Center & Marshes', nameKu: 'ناوەندی چباییش و ئەهوارەکان', nameAr: 'مركز الجبايش والأهوار', latitude: 30.9500, longitude: 46.9833 },
          { id: 'fuhood', nameEn: 'Al-Fuhood', nameKu: 'فوهوود', nameAr: 'الفهود', latitude: 30.9667, longitude: 46.7167 },
          { id: 'hammar', nameEn: 'Al-Hammar', nameKu: 'حەممار', nameAr: 'الحمار', latitude: 30.8667, longitude: 46.8500 },
        ],
      },
    ],
  },

  {
    id: 'maysan',
    nameEn: 'Maysan (Amarah)',
    nameKu: 'مەیسان (عەمارە)',
    nameAr: 'ميسان (العمارة)',
    region: 'Federal Iraq',
    latitude: 31.8333,
    longitude: 47.1500,
    districts: [
      {
        id: 'amarah',
        nameEn: 'Al-Amarah Center',
        nameKu: 'ناوەندی عەمارە',
        nameAr: 'مركز العمارة',
        latitude: 31.8333,
        longitude: 47.1500,
        subDistricts: [
          { id: 'amarah-city', nameEn: 'Amarah City', nameKu: 'شاری عەمارە', nameAr: 'مدينة العمارة', latitude: 31.8333, longitude: 47.1500 },
          { id: 'kumait', nameEn: 'Kumait', nameKu: 'کومەیت', nameAr: 'كميت', latitude: 32.0667, longitude: 47.0167 },
          { id: 'musharrah', nameEn: 'Musharrah', nameKu: 'موشەڕڕەح', nameAr: 'المشرح', latitude: 31.8500, longitude: 47.3333 },
        ],
      },
      {
        id: 'majar-al-kabir',
        nameEn: 'Al-Majar Al-Kabir',
        nameKu: 'مەجەڕڕولکەبیر',
        nameAr: 'المجر الكبير',
        latitude: 31.5833,
        longitude: 47.1667,
        subDistricts: [
          { id: 'majar-center', nameEn: 'Majar Center', nameKu: 'ناوەندی مەجەڕ', nameAr: 'مركز المجر الكبير', latitude: 31.5833, longitude: 47.1667 },
          { id: 'adl', nameEn: 'Al-Adl', nameKu: 'عەدل', nameAr: 'العدل', latitude: 31.5000, longitude: 47.2333 },
        ],
      },
      {
        id: 'ali-al-gharbi',
        nameEn: 'Ali Al-Gharbi',
        nameKu: 'عەلی غەربی',
        nameAr: 'علي الغربي',
        latitude: 32.4667,
        longitude: 46.6833,
        subDistricts: [
          { id: 'ali-al-gharbi-center', nameEn: 'Ali Al-Gharbi Center', nameKu: 'ناوەندی عەلی غەربی', nameAr: 'مركز علي الغربي', latitude: 32.4667, longitude: 46.6833 },
          { id: 'ali-al-sharqi', nameEn: 'Ali Al-Sharqi', nameKu: 'عەلی شەرقی', nameAr: 'علي الشرقي', latitude: 32.2000, longitude: 46.8500 },
        ],
      },
      {
        id: 'maymouna',
        nameEn: 'Al-Maymouna',
        nameKu: 'مەیموونة',
        nameAr: 'الميمونة',
        latitude: 31.7333,
        longitude: 46.9667,
        subDistricts: [
          { id: 'maymouna-center', nameEn: 'Maymouna Center', nameKu: 'ناوەندی مەیموونة', nameAr: 'مركز الميمونة', latitude: 31.7333, longitude: 46.9667 },
          { id: 'salam', nameEn: 'Al-Salam', nameKu: 'سەلام', nameAr: 'السلام', latitude: 31.6500, longitude: 46.8667 },
        ],
      },
      {
        id: 'qalat-saleh',
        nameEn: 'Qal\'at Saleh',
        nameKu: 'قەڵای ساڵح',
        nameAr: 'قلعة صالح',
        latitude: 31.5167,
        longitude: 47.2833,
        subDistricts: [
          { id: 'qalat-saleh-center', nameEn: 'Qal\'at Saleh Center', nameKu: 'ناوەندی قەڵای ساڵح', nameAr: 'مركز قلعة صالح', latitude: 31.5167, longitude: 47.2833 },
          { id: 'kahla', nameEn: 'Al-Kahla', nameKu: 'کەحلا', nameAr: 'الكحلاء', latitude: 31.6667, longitude: 47.3333 },
          { id: 'uzayr', nameEn: 'Al-Uzayr Shrine', nameKu: 'عوزەیر', nameAr: 'العزير', latitude: 31.3167, longitude: 47.4167 },
        ],
      },
    ],
  },

  {
    id: 'muthanna',
    nameEn: 'Al-Muthanna (Samawah)',
    nameKu: 'موسەننا (سەماوە)',
    nameAr: 'المثنى (السماوة)',
    region: 'Federal Iraq',
    latitude: 31.3167,
    longitude: 45.2833,
    districts: [
      {
        id: 'samawah',
        nameEn: 'Al-Samawah Center',
        nameKu: 'ناوەندی سەماوە',
        nameAr: 'مركز السماوة',
        latitude: 31.3167,
        longitude: 45.2833,
        subDistricts: [
          { id: 'samawah-city', nameEn: 'Samawah City', nameKu: 'شاری سەماوە', nameAr: 'مدينة السماوة', latitude: 31.3167, longitude: 45.2833 },
          { id: 'sawa-lake', nameEn: 'Sawa Lake Area', nameKu: 'دەریاچەی ساوە', nameAr: 'بحيرة ساوة', latitude: 31.3167, longitude: 45.0000 },
        ],
      },
      {
        id: 'rumaitha',
        nameEn: 'Al-Rumaitha',
        nameKu: 'ڕومەیسە',
        nameAr: 'الرميثة',
        latitude: 31.5333,
        longitude: 45.2000,
        subDistricts: [
          { id: 'rumaitha-center', nameEn: 'Rumaitha Center', nameKu: 'ناوەندی ڕومەیسە', nameAr: 'مركز الرميثة', latitude: 31.5333, longitude: 45.2000 },
          { id: 'hilal', nameEn: 'Al-Hilal', nameKu: 'هیلال', nameAr: 'الهلال', latitude: 31.4167, longitude: 45.2500 },
          { id: 'najmi', nameEn: 'Al-Najmi', nameKu: 'نەجمی', nameAr: 'النجمي', latitude: 31.6000, longitude: 45.1500 },
          { id: 'majd', nameEn: 'Al-Majd', nameKu: 'مەجد', nameAr: 'المجد', latitude: 31.5000, longitude: 45.1833 },
        ],
      },
      {
        id: 'khidhir',
        nameEn: 'Al-Khidhir',
        nameKu: 'خزر',
        nameAr: 'الخضر',
        latitude: 31.1500,
        longitude: 45.5833,
        subDistricts: [
          { id: 'khidhir-center', nameEn: 'Khidhir Center', nameKu: 'ناوەندی خزر', nameAr: 'مركز الخضر', latitude: 31.1500, longitude: 45.5833 },
          { id: 'darraji', nameEn: 'Al-Darraji', nameKu: 'دەڕڕاجی', nameAr: 'الدراجي', latitude: 31.0667, longitude: 45.7167 },
        ],
      },
      {
        id: 'salman',
        nameEn: 'Al-Salman (Desert)',
        nameKu: 'سەلمان',
        nameAr: 'السلمان',
        latitude: 30.5000,
        longitude: 44.7500,
        subDistricts: [
          { id: 'salman-center', nameEn: 'Salman Center', nameKu: 'ناوەندی سەلمان', nameAr: 'مركز السلمان', latitude: 30.5000, longitude: 44.7500 },
          { id: 'bussayah', nameEn: 'Bussayah', nameKu: 'بوسیە', nameAr: 'البصية', latitude: 30.1667, longitude: 46.1167 },
        ],
      },
    ],
  },

  {
    id: 'qadisiyyah',
    nameEn: 'Al-Qadisiyyah (Diwaniyah)',
    nameKu: 'قادسیە (دیوانیە)',
    nameAr: 'القادسية (الديوانية)',
    region: 'Federal Iraq',
    latitude: 31.9833,
    longitude: 44.9167,
    districts: [
      {
        id: 'diwaniyah',
        nameEn: 'Al-Diwaniyah Center',
        nameKu: 'ناوەندی دیوانیە',
        nameAr: 'مركز الديوانية',
        latitude: 31.9833,
        longitude: 44.9167,
        subDistricts: [
          { id: 'diwaniyah-city', nameEn: 'Diwaniyah City', nameKu: 'شاری دیوانیە', nameAr: 'مدينة الديوانية', latitude: 31.9833, longitude: 44.9167 },
          { id: 'saniya', nameEn: 'Al-Saniya', nameKu: 'سەنیە', nameAr: 'السنية', latitude: 32.1000, longitude: 44.8500 },
          { id: 'shafiiyah', nameEn: 'Al-Shafi\'iyah', nameKu: 'شافعیە', nameAr: 'الشافعية', latitude: 31.9167, longitude: 44.8333 },
          { id: 'daghara', nameEn: 'Al-Daghara', nameKu: 'دەغارە', nameAr: 'الدغارة', latitude: 32.1333, longitude: 44.9667 },
        ],
      },
      {
        id: 'shamiyah',
        nameEn: 'Al-Shamiyah',
        nameKu: 'شامیە',
        nameAr: 'الشامية',
        latitude: 31.9667,
        longitude: 44.6000,
        subDistricts: [
          { id: 'shamiyah-center', nameEn: 'Shamiyah Center', nameKu: 'ناوەندی شامیە', nameAr: 'مركز الشامية', latitude: 31.9667, longitude: 44.6000 },
          { id: 'ghamas', nameEn: 'Ghamas', nameKu: 'غەماس', nameAr: 'غماس', latitude: 31.7833, longitude: 44.6167 },
          { id: 'muhannawiyah', nameEn: 'Al-Muhannawiyah', nameKu: 'موهەنناویە', nameAr: 'المهناوية', latitude: 32.0667, longitude: 44.6500 },
          { id: 'salahiyah', nameEn: 'Al-Salahiyah', nameKu: 'سەلاحیە', nameAr: 'الصلاحية', latitude: 32.0167, longitude: 44.6167 },
        ],
      },
      {
        id: 'afak',
        nameEn: 'Afak',
        nameKu: 'عەفەک',
        nameAr: 'عفك',
        latitude: 32.0667,
        longitude: 45.2500,
        subDistricts: [
          { id: 'afak-center', nameEn: 'Afak Center (Nippur)', nameKu: 'ناوەندی عەفەک (نیپور)', nameAr: 'مركز عفك (نيبور)', latitude: 32.0667, longitude: 45.2500 },
          { id: 'al-bdeer', nameEn: 'Al-Bdeer', nameKu: 'بدەیر', nameAr: 'البدير', latitude: 32.0000, longitude: 45.5500 },
          { id: 'somar', nameEn: 'Somar', nameKu: 'سۆمەر', nameAr: 'سومر', latitude: 32.1333, longitude: 45.1833 },
          { id: 'nafar', nameEn: 'Al-Nafar', nameKu: 'نەفەر', nameAr: 'نفر', latitude: 32.1167, longitude: 45.2333 },
        ],
      },
      {
        id: 'hamzah',
        nameEn: 'Al-Hamzah Al-Sharqi',
        nameKu: 'حەمزەی شەرقی',
        nameAr: 'الحمزة الشرقي',
        latitude: 31.7333,
        longitude: 44.9667,
        subDistricts: [
          { id: 'hamzah-center', nameEn: 'Hamzah Center', nameKu: 'ناوەندی حەمزە', nameAr: 'مركز الحمزة', latitude: 31.7333, longitude: 44.9667 },
          { id: 'sedoud', nameEn: 'Al-Sedoud', nameKu: 'سدوود', nameAr: 'السدير', latitude: 31.8500, longitude: 44.9167 },
          { id: 'shanafiya', nameEn: 'Al-Shanafiya', nameKu: 'شەنافیە', nameAr: 'الشنافية', latitude: 31.5833, longitude: 44.6500 },
        ],
      },
    ],
  },
];

// Quick helper to search any level
export interface FlatLocationItem {
  id: string;
  governorateId: string;
  districtId?: string;
  subDistrictId?: string;
  governorateName: { en: string; ku: string; ar: string };
  districtName?: { en: string; ku: string; ar: string };
  subDistrictName?: { en: string; ku: string; ar: string };
  displayName: { en: string; ku: string; ar: string };
  region: 'Kurdistan' | 'Federal Iraq';
  latitude: number;
  longitude: number;
  type: 'governorate' | 'district' | 'subDistrict';
}

export function getAllFlattenedLocations(): FlatLocationItem[] {
  const list: FlatLocationItem[] = [];

  for (const gov of ALL_GOVERNORATES) {
    // 1. Governorate itself
    list.push({
      id: gov.id,
      governorateId: gov.id,
      governorateName: { en: gov.nameEn, ku: gov.nameKu, ar: gov.nameAr },
      displayName: {
        en: `${gov.nameEn}, ${gov.region === 'Kurdistan' ? 'Kurdistan' : 'Iraq'}`,
        ku: `${gov.nameKu} (${gov.region === 'Kurdistan' ? 'هەرێمی کوردستان' : 'عێراق'})`,
        ar: `${gov.nameAr} (${gov.region === 'Kurdistan' ? 'إقليم كوردستان' : 'العراق'})`,
      },
      region: gov.region,
      latitude: gov.latitude,
      longitude: gov.longitude,
      type: 'governorate',
    });

    for (const dist of gov.districts) {
      // 2. District
      list.push({
        id: `${gov.id}_${dist.id}`,
        governorateId: gov.id,
        districtId: dist.id,
        governorateName: { en: gov.nameEn, ku: gov.nameKu, ar: gov.nameAr },
        districtName: { en: dist.nameEn, ku: dist.nameKu, ar: dist.nameAr },
        displayName: {
          en: `${dist.nameEn}, ${gov.nameEn}`,
          ku: `${dist.nameKu}، ${gov.nameKu}`,
          ar: `${dist.nameAr}، ${gov.nameAr}`,
        },
        region: gov.region,
        latitude: dist.latitude || gov.latitude,
        longitude: dist.longitude || gov.longitude,
        type: 'district',
      });

      for (const sub of dist.subDistricts) {
        // 3. SubDistrict
        list.push({
          id: `${gov.id}_${dist.id}_${sub.id}`,
          governorateId: gov.id,
          districtId: dist.id,
          subDistrictId: sub.id,
          governorateName: { en: gov.nameEn, ku: gov.nameKu, ar: gov.nameAr },
          districtName: { en: dist.nameEn, ku: dist.nameKu, ar: dist.nameAr },
          subDistrictName: { en: sub.nameEn, ku: sub.nameKu, ar: sub.nameAr },
          displayName: {
            en: `${sub.nameEn}, ${dist.nameEn} (${gov.nameEn})`,
            ku: `${sub.nameKu} - ${dist.nameKu} (${gov.nameKu})`,
            ar: `${sub.nameAr} - ${dist.nameAr} (${gov.nameAr})`,
          },
          region: gov.region,
          latitude: sub.latitude || dist.latitude || gov.latitude,
          longitude: sub.longitude || dist.longitude || gov.longitude,
          type: 'subDistrict',
        });
      }
    }
  }

  return list;
}
