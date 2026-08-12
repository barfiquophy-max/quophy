# Emporio Armani storefront clone

A functional recreation of the Emporio Armani US experience
(`armani.com/en-us/emporio-armani/experience/`) written in plain HTML, CSS and
JavaScript. No framework, no build step, no dependencies.

## Run it

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8080   # then open http://localhost:8080
```

## Files

```
index.html              page shell (header / view / footer mount points)
assets/css/styles.css   all styling
assets/js/data.js       catalog: 816 products, 25 categories, editorial blocks
assets/js/content.js    navigation, footer, help/legal copy, stores, brands
assets/js/catalog.js    lookup, filtering, search and variant helpers
assets/js/store.js      cart / wishlist / orders / account (localStorage)
assets/js/app.js        views, hash router and all interactions
```

## Routes

Hash routing keeps everything working from `file://` as well as over HTTP.

| Route | Page |
| --- | --- |
| `#/` | editorial home |
| `#/c/<category path>` | product listing (e.g. `#/c/man/clothing/t-shirts`, `#/c/sale/woman`) |
| `#/p/<product slug>` | product detail |
| `#/cart`, `#/checkout` | bag and two-step checkout |
| `#/wishlist`, `#/account` | wishlist and account with order history |
| `#/search?q=...` | search results |
| `#/stores` | store locator |
| `#/track/order`, `#/track/return` | order and return tracking |
| `#/help/...`, `#/legal/...`, `#/page/...` | client service, legal and editorial pages |
| `#/brands`, `#/brand/<brand>` | brand hub and brand pages |

## Functionality

Mega-menu, mobile drawer, search overlay with live results, PLP filters
(size / color / sale), sorting, show-more paging, tile hover images, PDP gallery
with zoom, color variants, size selection with validation, add to cart, mini cart
drawer, quantity edits, cart totals with free shipping over $250, checkout with
order confirmation, order history, order/return lookup, wishlist, store search,
and newsletter signup.

Cart, wishlist, orders and account are persisted in `localStorage`
(`ea-cart`, `ea-wishlist`, `ea-orders`, `ea-account`).

Product data and imagery are referenced from Armani's public CDN for fidelity;
this is a technical demo and is not affiliated with Giorgio Armani S.p.A.
