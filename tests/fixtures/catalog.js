// Minimal catalog fixture mirroring the shape of assets/js/data.js.
export function makeCatalog() {
  const product = (over) => ({
    code: "AAA_111_100",
    slug: "shirt-aaa",
    name: "Poplin shirt",
    price: 300,
    salePrice: null,
    color: "White",
    extraColors: 0,
    images: ["a.jpg", "b.jpg"],
    sizes: ["S", "M", "L"],
    gender: "man",
    group: "Clothing",
    sub: "Shirts",
    categories: ["man/clothing/shirts"],
    newSeason: false,
    description: "A shirt.",
    ...over,
  });

  const products = [
    product(),
    product({ code: "AAA_111_200", slug: "shirt-aaa-blue", color: "Blue", newSeason: true }),
    product({
      code: "BBB_222_100",
      slug: "sale-tee",
      name: "Cotton t-shirt",
      price: 200,
      salePrice: 120,
      sub: "T-shirts",
      categories: ["man/clothing/t-shirts"],
    }),
    product({
      code: "CCC_333_100",
      slug: "woman-dress",
      name: "Silk dress",
      price: 900,
      gender: "woman",
      sub: "Dresses",
      categories: ["woman/clothing/dresses"],
      newSeason: true,
    }),
  ];

  const categories = [
    { slug: "man/clothing/shirts", title: "Shirts", productCodes: ["AAA_111_100", "AAA_111_200"] },
    { slug: "man/clothing/t-shirts", title: "T-shirts", productCodes: ["BBB_222_100"] },
    { slug: "woman/clothing/dresses", title: "Dresses", productCodes: ["CCC_333_100"] },
  ];

  return { products, categories, home: { hero: [], rows: [] } };
}
