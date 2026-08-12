export type NavLink = { label: string; href: string };
export type NavColumn = { title: string; links: NavLink[] };
export type NavEntry = {
  label: string;
  href: string;
  columns: NavColumn[];
  promo?: { title: string; href: string; image: string };
};

const p = (path: string) => `/en-us/emporio-armani/${path}`;

export const mainNav: NavEntry[] = [
  {
    label: "Man",
    href: p("man/clothing/"),
    columns: [
      {
        title: "Clothing",
        links: [
          { label: "T-Shirts", href: p("man/clothing/t-shirts/") },
          { label: "Polo Shirts", href: p("man/clothing/polo-shirts/") },
          { label: "Sweatshirts", href: p("man/clothing/sweatshirts/") },
          { label: "Shirts", href: p("man/clothing/shirts/") },
          { label: "Knitwear", href: p("man/clothing/knitwear/") },
          { label: "Jackets", href: p("man/clothing/jackets/") },
          { label: "Outerwear", href: p("man/clothing/outerwear/") },
          { label: "Suits and Tuxedos", href: p("man/clothing/suits-and-tuxedos/") },
          { label: "Jeans", href: p("man/clothing/jeans/") },
          { label: "Pants", href: p("man/clothing/pants/") },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Shoes", href: p("man/shoes/") },
          { label: "Bags", href: p("man/bags/") },
          { label: "All Accessories", href: p("man/accessories/") },
          { label: "Beachwear", href: p("man/beachwear/") },
        ],
      },
      {
        title: "Highlights",
        links: [
          { label: "New Arrivals", href: p("new-arrivals/man/") },
          { label: "Sale", href: p("sale/man/") },
        ],
      },
    ],
    promo: {
      title: "Fall Winter 2026/27",
      href: p("new-arrivals/man/"),
      image:
        "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_4:5,w_800,c_lfill/SS26_EA_ADV_CATALOGO_SP_M_04_1080x1350",
    },
  },
  {
    label: "Woman",
    href: p("woman/clothing/dresses-and-jumpsuits/"),
    columns: [
      {
        title: "Clothing",
        links: [
          { label: "Dresses and Jumpsuits", href: p("woman/clothing/dresses-and-jumpsuits/") },
          { label: "Jackets", href: p("woman/clothing/jackets/") },
          { label: "Knitwear", href: p("woman/clothing/knitwear/") },
          { label: "Pants", href: p("woman/clothing/pants/") },
          { label: "Skirts", href: p("woman/clothing/skirts/") },
        ],
      },
      {
        title: "Accessories",
        links: [
          { label: "Shoes", href: p("woman/shoes/") },
          { label: "Bags", href: p("woman/bags/") },
          { label: "All Accessories", href: p("woman/accessories/") },
          { label: "Beachwear", href: p("woman/beachwear/") },
        ],
      },
      {
        title: "Highlights",
        links: [
          { label: "New Arrivals", href: p("new-arrivals/woman/") },
          { label: "Sale", href: p("sale/woman/") },
        ],
      },
    ],
    promo: {
      title: "Emporio Armani 1981 Bags",
      href: p("woman/bags/"),
      image:
        "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_4:5,w_800,c_lfill/FW26-27_ADV_CATALOGO_1981_ACC_02_1080x1350",
    },
  },
  {
    label: "Kids",
    href: p("kids/boys/"),
    columns: [
      {
        title: "Collections",
        links: [
          { label: "Boys 4-16 Years", href: p("kids/boys/") },
          { label: "Girls 4-14 Years", href: p("kids/girls/") },
        ],
      },
    ],
  },
  {
    label: "New Arrivals",
    href: p("new-arrivals/man/"),
    columns: [
      {
        title: "New Arrivals",
        links: [
          { label: "Men's New Arrivals", href: p("new-arrivals/man/") },
          { label: "Women's New Arrivals", href: p("new-arrivals/woman/") },
        ],
      },
    ],
  },
  {
    label: "Sale",
    href: p("sale/man/"),
    columns: [
      {
        title: "Sale",
        links: [
          { label: "Men's Sale", href: p("sale/man/") },
          { label: "Women's Sale", href: p("sale/woman/") },
        ],
      },
    ],
  },
];

export const footerColumns: NavColumn[] = [
  {
    title: "Do you need help?",
    links: [
      { label: "Contact us", href: "/en-us/help/contact-us/" },
      { label: "Help Area", href: "/en-us/help/" },
      { label: "FAQ", href: "/en-us/help/faq/" },
      { label: "My Account", href: "/en-us/my-account/" },
      { label: "Authenticity", href: "/en-us/authenticity/" },
      { label: "Digital Greeting Card", href: "/en-us/digital-card/" },
      { label: "Student Promotion", href: "/en-us/student-promotions/" },
      { label: "The Gift Guide", href: "/en-us/gifts/" },
    ],
  },
  {
    title: "Orders and Shipping",
    links: [
      { label: "Shipping", href: "/en-us/help/shipping/" },
      { label: "Track your order", href: "/en-us/track/orders/" },
      { label: "Track my return", href: "/en-us/track/returns/" },
      { label: "Returns and Refunds", href: "/en-us/help/returns-policy/" },
    ],
  },
  {
    title: "Legal area",
    links: [
      { label: "Terms of sale", href: "/en-us/legal/terms-and-condition-sales/" },
      { label: "Privacy Policy", href: "/en-us/legal/privacy-policy/" },
      { label: "Cookie Policy", href: "/en-us/legal/cookie-policy/" },
      { label: "Terms and conditions of use", href: "/en-us/legal/terms-and-condition-use/" },
      { label: "Accessibility statement", href: "/en-us/legal/accessibility/" },
      { label: "Apps accessibility statement", href: "/en-us/legal/accessibility-apps/" },
    ],
  },
  {
    title: "Our company",
    links: [
      { label: "Giorgio Armani", href: "/en-us/giorgio-armani/experience/" },
      { label: "Emporio Armani", href: "/en-us/emporio-armani/experience/" },
      { label: "EA7", href: "/en-us/ea7/experience/" },
      { label: "Armani Exchange", href: "/en-us/armani-exchange/experience/" },
      { label: "Store locator", href: "/en-us/stores/" },
    ],
  },
];
