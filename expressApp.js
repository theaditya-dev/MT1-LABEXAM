import express from "express";

const app = express();
const PORT = 4000;

app.use(express.json());

let cartItems = [
  { id: 1, productName: "Wireless Mouse", price: 799, quantity: 2, category: "Electronics" },
  { id: 2, productName: "Notebook", price: 80, quantity: 3, category: "Stationery" },
  { id: 3, productName: "Water Bottle", price: 299, quantity: 1, category: "Accessories" }
];

function isValidProduct(product, requireAllFields = true) {
  if (!product || typeof product !== "object" || Array.isArray(product)) return false;

  const hasRequiredFields = requireAllFields
    ? product.id !== undefined &&
      typeof product.productName === "string" &&
      product.productName.trim() !== "" &&
      product.price !== undefined &&
      product.quantity !== undefined
    : true;

  const priceIsValid = product.price === undefined ||
    (Number.isFinite(Number(product.price)) && Number(product.price) >= 0);
  const quantityIsValid = product.quantity === undefined ||
    (Number.isInteger(Number(product.quantity)) && Number(product.quantity) > 0);
  const nameIsValid = product.productName === undefined ||
    (typeof product.productName === "string" && product.productName.trim() !== "");

  return hasRequiredFields && priceIsValid && quantityIsValid && nameIsValid;
}

// GET /cart - retrieve all cart items
app.get("/cart", (req, res) => {
  res.status(200).json(cartItems);
});

// GET /cart/:id - retrieve one cart item by id
app.get("/cart/:id", (req, res) => {
  const product = cartItems.find((item) => String(item.id) === req.params.id);

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.status(200).json({
    ...product,
    totalPrice: product.price * product.quantity
  });
});

// POST /cart - add a new product
app.post("/cart", (req, res) => {
  const product = req.body;

  if (!isValidProduct(product, true)) {
    return res.status(400).json({
      message: "Invalid product. Provide id, productName, price and quantity; price must be non-negative and quantity must be a positive integer."
    });
  }

  if (cartItems.some((item) => String(item.id) === String(product.id))) {
    return res.status(409).json({ message: "A product with this id already exists." });
  }

  const newProduct = {
    id: product.id,
    productName: product.productName.trim(),
    price: Number(product.price),
    quantity: Number(product.quantity),
    category: typeof product.category === "string" && product.category.trim()
      ? product.category.trim()
      : "General"
  };

  cartItems.push(newProduct);
  res.status(201).json({
    message: "Product added successfully",
    product: newProduct
  });
});

// PUT /cart/:id - update an existing product
app.put("/cart/:id", (req, res) => {
  const productIndex = cartItems.findIndex((item) => String(item.id) === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const updates = req.body;
  if (!isValidProduct(updates, false) ||
      (updates.id !== undefined && String(updates.id) !== req.params.id)) {
    return res.status(400).json({ message: "Invalid product details." });
  }

  const currentProduct = cartItems[productIndex];
  const updatedProduct = {
    ...currentProduct,
    ...(updates.productName !== undefined ? { productName: updates.productName.trim() } : {}),
    ...(updates.price !== undefined ? { price: Number(updates.price) } : {}),
    ...(updates.quantity !== undefined ? { quantity: Number(updates.quantity) } : {}),
    ...(updates.category !== undefined ? { category: String(updates.category).trim() } : {})
  };

  cartItems[productIndex] = updatedProduct;
  res.status(200).json({
    message: "Product updated successfully",
    product: updatedProduct
  });
});

// DELETE /cart/:id - remove a product
app.delete("/cart/:id", (req, res) => {
  const productIndex = cartItems.findIndex((item) => String(item.id) === req.params.id);

  if (productIndex === -1) {
    return res.status(404).json({ message: "Product not found" });
  }

  const [removedProduct] = cartItems.splice(productIndex, 1);
  res.status(200).json({
    message: "Product deleted successfully",
    product: removedProduct
  });
});

// Handle malformed JSON and other unmatched routes
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && "body" in error) {
    return res.status(400).json({ message: "Invalid JSON body" });
  }
  next(error);
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
