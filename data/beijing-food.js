/**
 * @typedef {Object} FoodPlace
 * @property {string} id
 * @property {string} name_en
 * @property {string} name_zh
 * @property {string} restaurantType
 * @property {string} blurb_en
 * @property {string} address_zh
 * @property {string=} address_en
 * @property {string} maps_url
 * @property {string[]} vibe_tags
 * @property {string=} dianping_url
 * @property {string=} image
 * @property {boolean=} is_house_special
 */

/** @type {FoodPlace[]} */
window.BEIJING_FOOD_PLACES = [
  {
    id: "gongyan",
    name_en: "Gong Yan — Imperial-themed dinner + show",
    name_zh: "宫宴",
    restaurantType: "Imperial / Banquet experience",
    blurb_en:
      "Want a full-on main character night? You can dress up, dine like royalty, and watch traditional performances while you eat. It’s dramatic in the best way.",
    address_zh: "北京市东城区前门大街50号",
    maps_url: "https://maps.apple.com/?q=%E5%AE%AB%E5%AE%B4&address=%E5%8C%97%E4%BA%AC%E5%B8%82%E4%B8%9C%E5%9F%8E%E5%8C%BA%E5%89%8D%E9%97%A8%E5%A4%A7%E8%A1%9750%E5%8F%B7",
    vibe_tags: ["Show", "Dress-up", "Experience"],
    dianping_url: "https://m.dianping.com/shop/1489525169",
    image: "/public/images/makan-placeholder-gongyan.svg",
    is_house_special: true,
  },
  {
    id: "sijiminfu-gugong",
    name_en: "Siji Minfu (Forbidden City) — The crowd-favorite Peking duck",
    name_zh: "四季民福烤鸭店（故宫店）",
    restaurantType: "Peking duck",
    blurb_en:
      "This is a local legend. Also: it can be very crowded. If you’re into the buzz, the noise, and the “we earned this duck” feeling—do it. Pro tip: go early, or be ready to wait.",
    address_zh: "北京市东城区南池子大街11号（故宫东门旁）",
    maps_url:
      "https://maps.apple.com/?q=%E5%9B%9B%E5%AD%A3%E6%B0%91%E7%A6%8F%E7%83%A4%E9%B8%AD%E5%BA%97%EF%BC%88%E6%95%85%E5%AE%AB%E5%BA%97%EF%BC%89&address=%E5%8C%97%E4%BA%AC%E5%B8%82%E4%B8%9C%E5%9F%8E%E5%8C%BA%E5%8D%97%E6%B1%A0%E5%AD%90%E5%A4%A7%E8%A1%9711%E5%8F%B7",
    vibe_tags: ["Crowded", "Local favorite"],
    dianping_url: "https://m.dianping.com/shopinfo/k2IIzyDKxTUsz0lX?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=1785&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-duck.svg",
    is_house_special: true,
  },
  {
    id: "xiaodadong",
    name_en: "Xiao Da Dong — Peking duck, but calmer",
    name_zh: "小大董·烤鸭（王府井apm店）",
    restaurantType: "Peking duck",
    blurb_en:
      "Prefer something quieter but still excellent? Pick any Xiao Da Dong branch—reliable, easy, and very guest-friendly. Pro tip: perfect for “we want duck but not chaos.”",
    address_zh: "北京市东城区王府井大街138号北京apm",
    maps_url: "https://maps.apple.com/?q=%E5%B0%8F%E5%A4%A7%E8%91%A3%C2%B7%E7%83%A4%E9%B8%AD%EF%BC%88%E7%8E%8B%E5%BA%9C%E4%BA%95apm%E5%BA%97%EF%BC%89&address=%E5%8C%97%E4%BA%AC%E5%B8%82%E4%B8%9C%E5%9F%8E%E5%8C%BA%E7%8E%8B%E5%BA%9C%E4%BA%95%E5%A4%A7%E8%A1%97138%E5%8F%B7",
    vibe_tags: ["Calmer", "Polished"],
    dianping_url: "https://m.dianping.com/shopinfo/k4wdjfHqmkjKHEuh?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=1785&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-duck.svg",
    is_house_special: true,
  },
  {
    id: "tanggong",
    name_en: "Tang Gong — Cantonese comfort, Beijing edition (Miki’s parents’ #1)",
    name_zh: "唐宫海鲜舫",
    restaurantType: "Cantonese dining",
    blurb_en:
      "Possibly the most legit Cantonese food in Beijing. Also Miki’s parents’ favorite—reportedly a once-a-week situation, which is the highest endorsement possible.",
    address_zh: "北京市东城区建国门内大街17号好苑建国酒店1层",
    maps_url: "https://maps.apple.com/?q=%E5%94%90%E5%AE%AB%E6%B5%B7%E9%B2%9C%E8%88%AB&address=%E5%8C%97%E4%BA%AC%E5%B8%82%E4%B8%9C%E5%9F%8E%E5%8C%BA%E5%BB%BA%E5%9B%BD%E9%97%A8%E5%86%85%E5%A4%A7%E8%A1%9717%E5%8F%B7",
    vibe_tags: ["Family favorite", "Reliable"],
    dianping_url: "https://m.dianping.com/shopinfo/G87QLl6L25KySZRO?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=205&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-cantonese.svg",
    is_house_special: true,
  },
  {
    id: "subangyuan-raffles",
    name_en: "Su Bang Yuan (Raffles City) — Shanghai-approved Shanghainese",
    name_zh: "苏帮袁（来福士店）",
    restaurantType: "Jiangnan / Shanghainese",
    blurb_en:
      "Craving Shanghainese food? This one is a repeat spot for Miki’s family. Miki’s mom is from Shanghai, so yes—we’re comfortable betting our credibility on this being authentic.",
    address_zh: "北京市东城区东直门南大街1号来福士购物中心",
    maps_url: "https://maps.apple.com/?q=%E8%8B%8F%E5%B8%AE%E8%A2%81%EF%BC%88%E6%9D%A5%E7%A6%8F%E5%A3%AB%E5%BA%97%EF%BC%89&address=%E5%8C%97%E4%BA%AC%E5%B8%82%E4%B8%9C%E5%9F%8E%E5%8C%BA%E4%B8%9C%E7%9B%B4%E9%97%A8%E5%8D%97%E5%A4%A7%E8%A1%971%E5%8F%B7",
    vibe_tags: ["Authentic", "Family favorite"],
    dianping_url: "https://m.dianping.com/shopinfo/G90L5clgd2gEKjp0?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=201&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-jiangnan.svg",
    is_house_special: true,
  },
];
