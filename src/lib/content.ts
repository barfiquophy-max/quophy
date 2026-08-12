import type { Section } from "@/components/ContentPage";

export type ContentEntry = { title: string; intro?: string; sections: Section[] };

export const contentPages: Record<string, ContentEntry> = {
  "help": {
    title: "Client Service",
    intro:
      "Our client advisors are available Monday to Saturday, 9am to 9pm (EST), excluding holidays.",
    sections: [
      {
        heading: "How can we help you?",
        body: [
          "Browse the most requested topics or reach our client service team directly.",
        ],
        links: [
          { label: "Frequently asked questions", href: "/en-us/help/faq/" },
          { label: "Shipping", href: "/en-us/help/shipping/" },
          { label: "Returns and refunds", href: "/en-us/help/returns-policy/" },
          { label: "Contact us", href: "/en-us/help/contact-us/" },
          { label: "Track your order", href: "/en-us/track/orders/" },
        ],
      },
      {
        heading: "Product authenticity",
        body: [
          "Every item is protected by the Certilogo® code, which lets you verify authenticity from any device.",
        ],
        links: [{ label: "Authenticity", href: "/en-us/authenticity/" }],
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
        links: [{ label: "Track your order", href: "/en-us/track/orders/" }],
      },
      {
        heading: "Payments",
        body: [
          "We accept the major credit cards, PayPal, Apple Pay and Klarna. The amount is charged when the order is shipped.",
        ],
      },
      {
        heading: "Sizes",
        body: [
          "All sizes are Italian sizes unless otherwise indicated. Each product page includes a size guide with detailed measurements.",
        ],
      },
      {
        heading: "Returns",
        body: [
          "Returns are free within 14 days of delivery. Items must be unworn with all original tags attached.",
        ],
        links: [{ label: "Returns and refunds", href: "/en-us/help/returns-policy/" }],
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
        body: [
          "We currently ship to all 50 US states. Deliveries to PO boxes and freight forwarders are not available.",
        ],
      },
    ],
  },
  "help/returns-policy": {
    title: "Returns and refunds",
    sections: [
      {
        heading: "How to return",
        body: [
          "Request a return from the tracking page within 14 days of delivery, print the prepaid label and hand the parcel to the carrier.",
        ],
        links: [{ label: "Track my return", href: "/en-us/track/returns/" }],
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
        body: [
          "Beachwear, underwear and personalised items can only be returned if the hygiene seal is intact.",
        ],
      },
    ],
  },
  "help/contact-us": {
    title: "Contact us",
    intro: "Select the contact method best suited to your needs.",
    sections: [
      {
        heading: "E-mail",
        body: ["Write to us using the contact form, specifying your request and your details."],
      },
      {
        heading: "Telephone",
        body: [
          "Call 800-222-0444 from Monday to Saturday, 9am to 9pm (EST), excluding holidays.",
        ],
      },
      {
        heading: "Book an appointment",
        body: [
          "Enjoy an exclusive shopping experience by scheduling an appointment with a client advisor in one of our stores.",
        ],
        links: [{ label: "Find a store", href: "/en-us/stores/" }],
      },
    ],
  },
  authenticity: {
    title: "Authenticity",
    sections: [
      {
        heading: "Certilogo®",
        body: [
          "The Armani Group is committed to ensuring product quality and safety for its customers, and every consumer has the right to know that the item purchased is authentic.",
          "Since the Autumn/Winter 2018-2019 season the Group adopted a Brand Protection solution progressively extended to all lines. Certilogo® is a technology based on a unique recognition code on each item: the certification service can be accessed from a PC, tablet or smartphone to verify authenticity before or after purchase.",
          "Beyond guaranteeing authenticity, the system enables direct dialogue between the Group and the consumer, increasing traceability and transparency.",
        ],
      },
    ],
  },
  "digital-card": {
    title: "Digital greeting card",
    intro: "Add a personalised digital greeting card to your gift, delivered by email.",
    sections: [
      {
        heading: "How it works",
        body: [
          "Choose a design at checkout, write your message and select the delivery date. The recipient receives the card by email on the chosen day.",
        ],
      },
    ],
  },
  "student-promotions": {
    title: "Students get 20% off on Armani Exchange and EA7",
    sections: [
      {
        heading: "How to redeem",
        body: [
          "Register to verify your student status and secure your code. The code is valid for logged in users only, for one order, and cannot be combined with other promotions.",
        ],
        links: [
          { label: "Join with UNiDAYS", href: "/en-us/my-account/" },
          { label: "Join with Student Beans", href: "/en-us/my-account/" },
        ],
      },
    ],
  },
  gifts: {
    title: "The gift guide",
    intro:
      "Discover our gift guide: ideas designed for every style and occasion, from timeless classics to contemporary selections.",
    sections: [
      {
        heading: "Gift ideas",
        body: ["Let yourself be inspired by the different selections and find the right gift."],
        links: [
          { label: "Gift ideas for women", href: "/en-us/emporio-armani/woman/accessories/" },
          { label: "Gift ideas for men", href: "/en-us/emporio-armani/man/accessories/" },
          { label: "Gift ideas for kids", href: "/en-us/emporio-armani/kids/boys/" },
        ],
      },
    ],
  },
  "legal/privacy-policy": {
    title: "Privacy policy",
    sections: [
      {
        heading: "Data controller",
        body: [
          "Giorgio Armani S.p.A. processes personal data collected through this website to manage orders, provide client service and, subject to consent, send marketing communications.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "You may access, rectify, delete or port your data, and object to processing, by contacting client service.",
        ],
      },
    ],
  },
  "legal/cookie-policy": {
    title: "Cookie policy",
    sections: [
      {
        heading: "Cookies we use",
        body: [
          "Technical cookies are necessary for the site to function. Analytics and profiling cookies are used only after consent and can be managed at any time from the preferences panel.",
        ],
      },
    ],
  },
  "legal/terms-and-condition-sales": {
    title: "Terms of sale",
    sections: [
      {
        heading: "Contract",
        body: [
          "The sales contract is concluded when the order confirmation email is sent. Prices include applicable taxes and are expressed in US dollars.",
        ],
      },
      {
        heading: "Right of withdrawal",
        body: [
          "Consumers may withdraw within 14 days of delivery, following the return procedure described in the returns policy.",
        ],
      },
    ],
  },
  "legal/terms-and-condition-use": {
    title: "Terms and conditions of use",
    sections: [
      {
        heading: "Use of the site",
        body: [
          "All content on this site, including images, texts and trademarks, is protected by intellectual property rights and may not be reproduced without authorisation.",
        ],
      },
    ],
  },
  "legal/accessibility": {
    title: "Accessibility statement",
    sections: [
      {
        heading: "Our commitment",
        body: [
          "We are committed to making our digital experience accessible to everyone, in line with WCAG 2.1 level AA guidelines, and we continuously test and improve our interfaces.",
        ],
      },
    ],
  },
  "legal/accessibility-apps": {
    title: "Apps accessibility statement",
    sections: [
      {
        heading: "Mobile applications",
        body: [
          "Our mobile applications follow the same accessibility principles as the website, including support for screen readers and dynamic text sizes.",
        ],
      },
    ],
  },
};
