const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");

const app = express();
const PORT = 8080;
const PAGE_SIZE = 10; // Fetch 10 products at a time

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json()); // To handle JSON requests

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", async (req, res) => {
  try {
    // Fetch all categories
    const categoriesResponse = await axios.get(
      "https://dummyjson.com/products/categories"
    );
    const categories = Array.isArray(categoriesResponse.data)
      ? categoriesResponse.data
      : [];

    // Render the initial page
    res.render("index", { categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Error fetching categories");
  }
});

// Fetch products in batches (API endpoint), with support for search
app.get("/fetch-products", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const selectedCategory = req.query.category;
  const searchQuery = req.query.search || ""; // Get the search query if provided
  const skip = (page - 1) * PAGE_SIZE;

  try {
    let products = [];
    let totalProducts = 0;

    if (searchQuery) {
      // If search query is provided, search for products
      const searchResponse = await axios.get(
        `https://dummyjson.com/products/search?q=${searchQuery}&limit=${PAGE_SIZE}&skip=${skip}`
      );
      products = searchResponse.data.products;
      totalProducts = searchResponse.data.total;
    } else if (selectedCategory) {
      // Fetch products based on the selected category
      const categoryProductsResponse = await axios.get(
        `https://dummyjson.com/products/category/${selectedCategory}?limit=${PAGE_SIZE}&skip=${skip}`
      );
      products = categoryProductsResponse.data.products;
      totalProducts = categoryProductsResponse.data.total;
    } else {
      // Fetch all products
      const allProductsResponse = await axios.get(
        `https://dummyjson.com/products?limit=${PAGE_SIZE}&skip=${skip}`
      );
      products = allProductsResponse.data.products;
      totalProducts = allProductsResponse.data.total;
    }

    const hasMore = skip + PAGE_SIZE < totalProducts;

    res.json({ products, hasMore });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Error fetching products");
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
