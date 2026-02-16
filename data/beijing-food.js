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
 * @property {string=} imageSrc
 * @property {string=} imageAlt
 * @property {string=} imageAttribution
 * @property {string=} imageLicenseUrl
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
    imageSrc: "/public/photos/food/gongyan.jpg",
    imageAlt: "Chinese banquet dining hall",
    imageAttribution: "Photo: Ctny (Wikimedia Commons)",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
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
    imageSrc: "/public/photos/food/sijiminfu-gugong.jpg",
    imageAlt: "Peking duck served in a Beijing restaurant",
    imageAttribution: "Photo: Ellywa (Wikimedia Commons)",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
    imageSrc: "/public/photos/food/xiaodadong.jpg",
    imageAlt: "Plated Peking duck slices",
    imageAttribution: "Photo: Fumikas Sagisavas (Wikimedia Commons)",
    imageLicenseUrl: "http://creativecommons.org/publicdomain/zero/1.0/deed.en",
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
    imageSrc: "/public/photos/food/tanggong.jpg",
    imageAlt: "Cantonese dim sum spread",
    imageAttribution: "Photo: Peachyeung316 (Wikimedia Commons)",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/4.0",
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
    imageSrc: "/public/photos/food/subangyuan-raffles.jpg",
    imageAlt: "Huaiyang style braised chicken dish",
    imageAttribution: "Photo: 猫猫的日记本 (Wikimedia Commons)",
    imageLicenseUrl: "https://creativecommons.org/licenses/by-sa/3.0",
    is_house_special: true,
  },
  {
    id: "xinjingxi-cbd",
    name_en: "Xin Jing Xi (CBD)",
    name_cn: "新京熹·北京涮肉（CBD店）",
    restaurantType: "Hotpot & late-night",
    blurb_en:
      "The classic Beijing-style shuàn yángròu experience with iconic 铜锅 (tóngguō) copper pot energy—simple, smoky, and very old Beijing.",
    address_cn: "光华路众秀大厦2层",
    vibe_tags: ["Classic", "Copper pot"],
    dianping_url:
      "https://m.dianping.com/shopinfo/jF49UIPYqdl2RXWQ?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=34277&cityid=2&isoversea=0",
  },
  {
    id: "banu-wangfujing-apm",
    name_en: "Banu Maodu Hotpot (Wangfujing apm)",
    name_cn: "巴奴毛肚火锅（王府井apm店）",
    restaurantType: "Hotpot & late-night",
    blurb_en:
      "One of the hottest hotpot chains right now—come for the 毛肚 (máodù) tripe and bold broth, stay for the “this is why we flew to Beijing” energy.",
    address_cn: "王府井大街apm购物中心6层",
    vibe_tags: ["Bold broth", "Crowd favorite"],
    dianping_url:
      "https://m.dianping.com/shopinfo/k43bWUhL9u47ElMX?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=32733&cityid=2&isoversea=0",
  },
  {
    id: "putien-wfzh",
    name_en: "PUTIEN (WF Central)",
    name_cn: "莆田餐厅（王府中环店）",
    restaurantType: "Fujian cuisine",
    blurb_en:
      "Classic, reliable Fujian cuisine that is clean, comforting, and guest-friendly. Must-order: 燕皮扁肉汤 (yànpí biǎnròu tāng)—wonton soup with pork-skin wrappers.",
    address_cn: "王府井大街269号 王府中环东座4层",
    vibe_tags: ["Coastal Chinese", "Comforting"],
    dianping_url:
      "https://m.dianping.com/shopinfo/ET6aT1WmyhDQeELn?msource=Appshare2021&utm_source=shop_share&shoptype=10&shopcategoryid=34059&cityid=2&isoversea=0",
  },
];
