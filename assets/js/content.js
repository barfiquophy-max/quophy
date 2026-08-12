// Static site content: navigation, footer, editorial-free pages, stores, brands.
window.SITE = {
  promos: [
    { text: "Up to 50% off Spring Summer Sale", href: "#/c/sale/man" },
    { text: "Free shipping on all orders over $ 250", href: "#/help/shipping" },
  ],

  nav: [
    {
      label: "Man",
      href: "#/c/man/clothing",
      columns: [
        {
          title: "Clothing",
          links: [
            ["T-shirts", "#/c/man/clothing/t-shirts"],
            ["Shirts", "#/c/man/clothing/shirts"],
            ["Sweatshirts", "#/c/man/clothing/sweatshirts"],
            ["Knitwear", "#/c/man/clothing/knitwear"],
            ["Jackets and blazers", "#/c/man/clothing/jackets-and-blazers"],
            ["Trousers", "#/c/man/clothing/trousers"],
            ["Jeans", "#/c/man/clothing/jeans"],
            ["Outerwear", "#/c/man/clothing/outerwear"],
          ],
        },
        {
          title: "Accessories",
          links: [
            ["Shoes", "#/c/man/shoes"],
            ["Bags", "#/c/man/bags"],
            ["Accessories", "#/c/man/accessories"],
          ],
        },
        {
          title: "Highlights",
          links: [
            ["New arrivals", "#/c/new-arrivals/man"],
            ["Sale", "#/c/sale/man"],
            ["The gift guide", "#/page/gifts"],
          ],
        },
        {
          title: "Services",
          links: [
            ["Store locator", "#/stores"],
            ["Shipping", "#/help/shipping"],
            ["Contact us", "#/help/contact-us"],
          ],
        },
      ],
    },
    {
      label: "Woman",
      href: "#/c/woman/clothing",
      columns: [
        {
          title: "Clothing",
          links: [
            ["Dresses and jumpsuits", "#/c/woman/clothing/dresses-and-jumpsuits"],
            ["Tops and t-shirts", "#/c/woman/clothing/tops-and-t-shirts"],
            ["Shirts", "#/c/woman/clothing/shirts"],
            ["Knitwear", "#/c/woman/clothing/knitwear"],
            ["Jackets and blazers", "#/c/woman/clothing/jackets-and-blazers"],
            ["Trousers", "#/c/woman/clothing/trousers"],
            ["Skirts", "#/c/woman/clothing/skirts"],
            ["Outerwear", "#/c/woman/clothing/outerwear"],
          ],
        },
        {
          title: "Accessories",
          links: [
            ["Bags", "#/c/woman/bags"],
            ["Shoes", "#/c/woman/shoes"],
            ["Accessories", "#/c/woman/accessories"],
          ],
        },
        {
          title: "Highlights",
          links: [
            ["New arrivals", "#/c/new-arrivals/woman"],
            ["Sale", "#/c/sale/woman"],
            ["The gift guide", "#/page/gifts"],
          ],
        },
        {
          title: "Services",
          links: [
            ["Store locator", "#/stores"],
            ["Returns and refunds", "#/help/returns-policy"],
            ["Contact us", "#/help/contact-us"],
          ],
        },
      ],
    },
    {
      label: "Kids",
      href: "#/c/kids",
      columns: [
        {
          title: "Kids",
          links: [
            ["Boys", "#/c/kids/boys"],
            ["Girls", "#/c/kids/girls"],
            ["Baby", "#/c/kids/baby"],
          ],
        },
        {
          title: "Highlights",
          links: [
            ["New arrivals", "#/c/new-arrivals/kids"],
            ["Sale", "#/c/sale/kids"],
          ],
        },
      ],
    },
    { label: "New Arrivals", href: "#/c/new-arrivals/man" },
    { label: "Sale", href: "#/c/sale/man" },
  ],

  footer: [
    {
      title: "Do you need help?",
      links: [
        ["Contact us", "#/help/contact-us"],
        ["Help Area", "#/help"],
        ["FAQ", "#/help/faq"],
        ["My Account", "#/account"],
        ["Authenticity", "#/page/authenticity"],
        ["Digital Greeting Card", "#/page/digital-card"],
        ["Student Promotion", "#/page/student-promotions"],
        ["The Gift Guide", "#/page/gifts"],
      ],
    },
    {
      title: "Orders and Shipping",
      links: [
        ["Shipping", "#/help/shipping"],
        ["Track your order", "#/track/order"],
        ["Track my return", "#/track/return"],
        ["Returns and Refunds", "#/help/returns-policy"],
      ],
    },
    {
      title: "Legal area",
      links: [
        ["Terms of sale", "#/legal/terms-of-sale"],
        ["Privacy Policy", "#/legal/privacy-policy"],
        ["Cookie Policy", "#/legal/cookie-policy"],
        ["Terms and conditions of use", "#/legal/terms-of-use"],
        ["Accessibility statement", "#/legal/accessibility"],
        ["Apps accessibility statement", "#/legal/accessibility-apps"],
      ],
    },
    {
      title: "Our company",
      links: [
        ["Giorgio Armani", "#/brand/giorgio-armani"],
        ["Emporio Armani", "#/"],
        ["EA7", "#/brand/ea7"],
        ["Armani Exchange", "#/brand/armani-exchange"],
        ["Store locator", "#/stores"],
      ],
    },
  ],

  popularSearches: ["T-shirt", "Sneakers", "Blazer", "Dress", "Bag", "Jeans"],

  brands: {
    "giorgio-armani": {
      name: "Giorgio Armani",
      blurb:
        "The main line of the Armani Group: refined tailoring, precious materials and a timeless idea of elegance.",
      image:
        "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_16:9,w_2000,c_lfill/SS26_EA_ADV_CATALOGO_MAIN_MW_03_1920x1080",
    },
    ea7: {
      name: "EA7",
      blurb:
        "Technical performance wear engineered for movement, with innovative fabrics and a sport-driven aesthetic.",
      image:
        "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_16:9,w_2000,c_lfill/FW26-27_ADV_CATALOGO_DEL_M_04_1920x1080",
    },
    "armani-exchange": {
      name: "Armani Exchange",
      blurb:
        "Fast, urban and accessible: the youngest expression of the Armani world, inspired by street style and music.",
      image:
        "https://assets-cf.armani.com/image/upload/f_auto,q_auto,ar_16:9,w_2000,c_lfill/SS26_EA_ADV_GLOBAL_FASHION_MW_01_1080x1920",
    },
  },

  stores: [
    { name: "Emporio Armani New York", address: "601 Madison Avenue, New York, NY 10022", phone: "+1 212 317 0800", hours: "Mon–Sat 10am–7pm, Sun 12pm–6pm" },
    { name: "Emporio Armani Beverly Hills", address: "436 North Rodeo Drive, Beverly Hills, CA 90210", phone: "+1 310 271 5555", hours: "Mon–Sat 10am–6pm" },
    { name: "Emporio Armani Chicago", address: "800 North Michigan Avenue, Chicago, IL 60611", phone: "+1 312 573 4220", hours: "Mon–Sat 10am–7pm" },
    { name: "Emporio Armani Miami Design District", address: "115 NE 39th Street, Miami, FL 33137", phone: "+1 305 573 4331", hours: "Mon–Sat 11am–7pm" },
    { name: "Emporio Armani San Francisco", address: "1 Grant Avenue, San Francisco, CA 94108", phone: "+1 415 677 9400", hours: "Mon–Sat 10am–6pm" },
    { name: "Emporio Armani Houston", address: "5135 West Alabama Street, Houston, TX 77056", phone: "+1 713 850 8871", hours: "Mon–Sat 10am–7pm" },
    { name: "Emporio Armani Boston", address: "22 Newbury Street, Boston, MA 02116", phone: "+1 617 267 3200", hours: "Mon–Sat 10am–6pm" },
    { name: "Emporio Armani Las Vegas", address: "3500 Las Vegas Blvd S, Las Vegas, NV 89109", phone: "+1 702 893 8327", hours: "Daily 10am–11pm" },
  ],

  pages: {
    help: {
      title: "Client Service",
      intro: "Our client advisors are available Monday to Saturday, 9am to 9pm (EST), excluding holidays.",
      sections: [
        {
          heading: "How can we help you?",
          body: ["Browse the most requested topics or reach our client service team directly."],
          links: [
            ["Frequently asked questions", "#/help/faq"],
            ["Shipping", "#/help/shipping"],
            ["Returns and refunds", "#/help/returns-policy"],
            ["Contact us", "#/help/contact-us"],
            ["Track your order", "#/track/order"],
          ],
        },
      ],
    },
    "help/faq": {
      title: "Frequently asked questions",
      sections: [
        {
          heading: "Orders",
          body: [
            "Once your order is confirmed you receive an email with the order number. You can follow the status at any time from the tracking page.",
            "Orders can be modified or cancelled until they enter processing at the warehouse.",
          ],
          links: [["Track your order", "#/track/order"]],
        },
        {
          heading: "Payments",
          body: ["We accept the major credit cards, PayPal, Apple Pay and Klarna. The amount is charged when the order is shipped."],
        },
        {
          heading: "Sizes",
          body: ["All sizes are Italian sizes unless otherwise indicated. Each product page includes a size guide with detailed measurements."],
        },
        {
          heading: "Returns",
          body: ["Returns are free within 14 days of delivery. Items must be unworn with all original tags attached."],
        },
      ],
    },
    "help/shipping": {
      title: "Shipping",
      sections: [
        {
          heading: "Delivery times",
          body: [
            "Standard shipping is estimated within 4/6 business days. Express shipping is delivered within 2/3 business days.",
            "Orders placed after 2pm EST are processed the following business day.",
          ],
        },
        {
          heading: "Shipping costs",
          body: [
            "Standard shipping is free on orders over $ 250. Below that threshold a $ 15 contribution applies.",
            "Express shipping is available at checkout for $ 30.",
          ],
        },
        {
          heading: "Where we ship",
          body: ["We currently ship to all 50 US states. Deliveries to PO boxes and freight forwarders are not available."],
        },
      ],
    },
    "help/returns-policy": {
      title: "Returns and refunds",
      sections: [
        {
          heading: "How to return",
          body: ["Request a return from the tracking page within 14 days of delivery, print the prepaid label and hand the parcel to the carrier."],
          links: [["Track my return", "#/track/return"]],
        },
        {
          heading: "Refunds",
          body: [
            "Refunds are issued to the original payment method within 14 days of the return being received and accepted.",
            "Shipping contributions are refunded only when the whole order is returned.",
          ],
        },
        {
          heading: "Exclusions",
          body: ["Beachwear, underwear and personalised items can only be returned if the hygiene seal is intact."],
        },
      ],
    },
    "help/contact-us": {
      title: "Contact us",
      intro: "Select the contact method best suited to your needs.",
      sections: [
        { heading: "E-mail", body: ["Write to us using the contact form, specifying your request and your details."] },
        { heading: "Telephone", body: ["Call 800-222-0444 from Monday to Saturday, 9am to 9pm (EST), excluding holidays."] },
        {
          heading: "Book an appointment",
          body: ["Enjoy an exclusive shopping experience by scheduling an appointment with a client advisor in one of our stores."],
          links: [["Find a store", "#/stores"]],
        },
      ],
    },
    "page/authenticity": {
      title: "Authenticity",
      sections: [
        {
          heading: "Certilogo®",
          body: [
            "The Armani Group is committed to ensuring product quality and safety for its customers, and every consumer has the right to know that the item purchased is authentic.",
            "Since the Autumn/Winter 2018-2019 season the Group adopted a Brand Protection solution progressively extended to all lines. Certilogo® is a technology based on a unique recognition code on each item: the certification service can be accessed from a PC, tablet or smartphone, before or after purchase.",
            "Beyond guaranteeing authenticity, the system enables direct dialogue between the Group and the consumer, increasing traceability and transparency.",
          ],
        },
      ],
    },
    "page/digital-card": {
      title: "Digital greeting card",
      intro: "Add a personalised digital greeting card to your gift, delivered by email.",
      sections: [
        {
          heading: "How it works",
          body: ["Choose a design at checkout, write your message and select the delivery date. The recipient receives the card by email on the chosen day."],
        },
      ],
    },
    "page/student-promotions": {
      title: "Students get 20% off on Armani Exchange and EA7",
      sections: [
        {
          heading: "How to redeem",
          body: ["Register to verify your student status and secure your code. The code is valid for logged in users only, for one order, and cannot be combined with other promotions."],
          links: [["Join now", "#/account"]],
        },
      ],
    },
    "page/gifts": {
      title: "The gift guide",
      intro: "Discover our gift guide: ideas designed for every style and occasion, from timeless classics to contemporary selections.",
      sections: [
        {
          heading: "Gift ideas",
          body: ["Let yourself be inspired by the different selections and find the right gift."],
          links: [
            ["Gift ideas for women", "#/c/woman/accessories"],
            ["Gift ideas for men", "#/c/man/accessories"],
            ["Gift ideas for kids", "#/c/kids/boys"],
          ],
        },
      ],
    },
    "legal/privacy-policy": {
      title: "Privacy policy",
      sections: [
        {
          heading: "Data controller",
          body: ["Giorgio Armani S.p.A. processes personal data collected through this website to manage orders, provide client service and, subject to consent, send marketing communications."],
        },
        {
          heading: "Your rights",
          body: ["You may access, rectify, delete or port your data, and object to processing, by contacting client service."],
        },
      ],
    },
    "legal/cookie-policy": {
      title: "Cookie policy",
      sections: [
        {
          heading: "Cookies we use",
          body: ["Technical cookies are necessary for the site to function. Analytics and profiling cookies are used only after consent and can be managed at any time from the preferences panel."],
        },
      ],
    },
    "legal/terms-of-sale": {
      title: "Terms of sale",
      sections: [
        {
          heading: "Contract",
          body: ["The sales contract is concluded when the order confirmation email is sent. Prices include applicable taxes and are expressed in US dollars."],
        },
        {
          heading: "Right of withdrawal",
          body: ["Consumers may withdraw within 14 days of delivery, following the return procedure described in the returns policy."],
        },
      ],
    },
    "legal/terms-of-use": {
      title: "Terms and conditions of use",
      sections: [
        {
          heading: "Use of the site",
          body: ["All content on this site, including images, texts and trademarks, is protected by intellectual property rights and may not be reproduced without authorisation."],
        },
      ],
    },
    "legal/accessibility": {
      title: "Accessibility statement",
      sections: [
        {
          heading: "Our commitment",
          body: ["We are committed to making our digital experience accessible to everyone, in line with WCAG 2.1 level AA guidelines, and we continuously test and improve our interfaces."],
        },
      ],
    },
    "legal/accessibility-apps": {
      title: "Apps accessibility statement",
      sections: [
        {
          heading: "Mobile applications",
          body: ["Our mobile applications follow the same accessibility principles as the website, including support for screen readers and dynamic text sizes."],
        },
      ],
    },
  },
};
