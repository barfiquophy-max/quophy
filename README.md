# Emporio Armani storefront clone

A functional recreation of the Emporio Armani US experience
(`armani.com/en-us/emporio-armani/experience/`) built with Next.js App Router,
TypeScript and Tailwind CSS.

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npm run build
```

## What is implemented

- Editorial experience page, brand hub and per-brand landing pages
- Category listing pages with size/color/sale filters, sorting and show-more paging
- Product detail pages with image gallery + zoom, color variants, size selection and related products
- Mega-menu, mobile drawer navigation, search overlay and search results page
- Cart drawer, cart page, multi-step checkout with order confirmation
- Wishlist, account with order history, order/return tracking
- Store locator, help/FAQ/shipping/returns, legal and gift/service content pages
- Newsletter signup

Cart, wishlist, account and orders are client-side state persisted to
`localStorage`; there is no backend.

## Catalog data

`src/data/*.json` holds the catalog (816 products across 25 categories) derived
from the public site: product names, prices, colors, sizes, descriptions and
public Cloudinary image URLs. Media is referenced by URL rather than
redistributed. Regenerating the data is done with the scraping scripts kept
outside this repo.
