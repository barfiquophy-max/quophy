# QUOPHY

A luxury fashion storefront built with plain HTML, CSS and JavaScript — no build step, no dependencies.

## Run locally

```bash
python3 -m http.server 8080
# then open http://localhost:8080/index.html
```

Any static file server works; opening the files directly via `file://` also works apart from relative URL query state.

## Pages

| File | Purpose |
| --- | --- |
| `index.html` | Homepage — campaign hero, editorial tiles, New In rail, categories, services |
| `collections.html` | Product listing with category subnav, filters and sorting (state in the URL) |
| `product.html?id=<product-id>` | Product detail — gallery, colours, sizes, add to bag, accordions, related items |
| `bag.html` | Shopping bag with quantity controls and order summary |
| `world.html` | Brand story, craft, sustainability, careers, legal |
| `services.html` | Client services, shipping, size guide, FAQs, contact form |
| `stores.html` | Boutique locator with search |

## Structure

```
assets/
  css/styles.css     design tokens + all component styles
  js/data.js         catalog: products, categories, stores, services, navigation
  js/site.js         shared shell: header, menu, search, mini-bag, footer, cart/wishlist state
  js/<page>.js       per-page behaviour
  img/               generated product and editorial imagery
```

`site.js` renders the shared shell into placeholder nodes on every page, so navigation, search, the mini bag
and the footer are defined once. The bag and wishlist persist in `localStorage` (`quophy.bag`, `quophy.wishlist`)
and broadcast a `bag:change` event that pages listen to.

## Notes

This is a front-end only build: there is no backend, so checkout, newsletter and contact submissions are
simulated in the browser and no data leaves the page.
