/**
 * @typedef {Object} FoodPlace
 * @property {string} id
 * @property {string} name_en
 * @property {string} name_cn
 * @property {string} restaurantType
 * @property {string} blurb_en
 * @property {string=} address_cn
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
    name_cn: "宫宴",
    restaurantType: "Imperial / Banquet experience",
    blurb_en:
      "Want a full-on main character night? You can dress up, dine like royalty, and watch traditional performances while you eat. It’s dramatic in the best way.",
    address_cn: "北京市东城区前门大街50号",
    vibe_tags: ["Show", "Dress-up", "Experience"],
    dianping_url: "https://m.dianping.com/shop/1489525169",
    image: "/public/images/makan-placeholder-gongyan.svg",
    is_house_special: true,
  },
  {
    id: "sijiminfu-gugong",
    name_en: "Siji Minfu (Forbidden City) — The crowd-favorite Peking duck",
    name_cn: "四季民福（故宫店）",
    restaurantType: "Peking duck",
    blurb_en:
      "This is a local legend. Also: it can be very crowded. If you’re into the buzz, the noise, and the “we earned this duck” feeling—do it. Pro tip: go early, or be ready to wait.",
    vibe_tags: ["Crowded", "Local favorite"],
    dianping_url: "https://m.dianping.com/shopinfo/k2IIzyDKxTUsz0lX?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=1785&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-duck.svg",
    is_house_special: true,
  },
  {
    id: "xiaodadong",
    name_en: "Xiao Da Dong — Peking duck, but calmer",
    name_cn: "小大董（北京烤鸭）",
    restaurantType: "Peking duck",
    blurb_en:
      "Prefer something quieter but still excellent? Pick any Xiao Da Dong branch—reliable, easy, and very guest-friendly. Pro tip: perfect for “we want duck but not chaos.”",
    vibe_tags: ["Calmer", "Polished"],
    dianping_url: "https://m.dianping.com/shopinfo/k4wdjfHqmkjKHEuh?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=1785&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-duck.svg",
    is_house_special: true,
  },
  {
    id: "tanggong",
    name_en: "Tang Gong — Cantonese comfort, Beijing edition (Miki’s parents’ #1)",
    name_cn: "唐宫",
    restaurantType: "Cantonese dining",
    blurb_en:
      "Possibly the most legit Cantonese food in Beijing. Also Miki’s parents’ favorite—reportedly a once-a-week situation, which is the highest endorsement possible.",
    vibe_tags: ["Family favorite", "Reliable"],
    dianping_url: "https://m.dianping.com/shopinfo/G87QLl6L25KySZRO?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=205&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-cantonese.svg",
    is_house_special: true,
  },
  {
    id: "subangyuan-raffles",
    name_en: "Su Bang Yuan (Raffles City) — Shanghai-approved Shanghainese",
    name_cn: "苏帮袁（来福士店）",
    restaurantType: "Jiangnan / Shanghainese",
    blurb_en:
      "Craving Shanghainese food? This one is a repeat spot for Miki’s family. Miki’s mom is from Shanghai, so yes—we’re comfortable betting our credibility on this being authentic.",
    vibe_tags: ["Authentic", "Family favorite"],
    dianping_url: "https://m.dianping.com/shopinfo/G90L5clgd2gEKjp0?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=201&cityid=2&isoversea=0",
    image: "/public/images/makan-placeholder-jiangnan.svg",
    is_house_special: true,
  },
];
