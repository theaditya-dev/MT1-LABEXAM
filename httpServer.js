import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

const cartItems = [
  { id: 1, productName: "Wireless Mouse", price: 799, quantity: 2, category: "Electronics" },
  { id: 2, productName: "Notebook", price: 80, quantity: 3, category: "Stationery" },
  { id: 3, productName: "Water Bottle", price: 299, quantity: 1, category: "Accessories" }
];

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(data, null, 2));
}

function sendText(res, statusCode, message) {
  res.writeHead(statusCode, { "Content-Type": "text/plain; charset=utf-8" });
  res.end(message);
}

function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error("Request body is too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });
    req.on("error", reject);
  });
}

function isValidProduct(product) {
  return product &&
    product.id !== undefined && product.id !== null &&
    typeof product.productName === "string" && product.productName.trim() !== "" &&
    Number.isFinite(Number(product.price)) && Number(product.price) >= 0 &&
    Number.isInteger(Number(product.quantity)) && Number(product.quantity) > 0;
}

const server = http.createServer(async (req, res) => {
  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const route = requestUrl.pathname;

  if (req.method === "GET" && route === "/") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end(`<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Shopping Cart</title></head>
<body><h1>Welcome to the Shopping Cart Management Application</h1><p>Node.js HTTP module demonstration.</p></body>
</html>`);
    return;
  }

  if (req.method === "GET" && route === "/cart") {
    sendJson(res, 200, cartItems);
    return;
  }

  if (req.method === "POST" && route === "/add-to-cart") {
    let product;
    try {
      product = await readRequestBody(req);
    } catch (error) {
      sendJson(res, 400, { message: error.message });
      return;
    }

    if (!isValidProduct(product)) {
      sendJson(res, 400, {
        message: "Invalid product. Required fields: id, productName, price and quantity. Price must be non-negative and quantity must be a positive integer."
      });
      return;
    }

    if (cartItems.some((item) => String(item.id) === String(product.id))) {
      sendJson(res, 409, { message: "A product with this id already exists." });
      return;
    }

    const newProduct = {
      id: product.id,
      productName: product.productName.trim(),
      price: Number(product.price),
      quantity: Number(product.quantity),
      ...(product.category ? { category: String(product.category) } : {})
    };
    cartItems.push(newProduct);
    sendJson(res, 201, { message: "Product added successfully", product: newProduct });
    return;
  }

  if (req.method === "GET" && route === "/about") {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    res.end("<h1>About</h1><p>This shopping cart application demonstrates Node.js HTTP routing and array-based cart management.</p>");
    return;
  }

  if (req.method === "GET" && route === "/home") {
    const indexPath = path.join(__dirname, "public", "index.html");
    fs.readFile(indexPath, "utf8", (error, html) => {
      if (error) {
        sendText(res, 500, "Unable to read the home page.");
        return;
      }
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      res.end(html);
    });
    return;
  }

  sendJson(res, 404, { message: "Route not found" });
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
