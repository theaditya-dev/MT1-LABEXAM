# MT1-LABEXAM — Shopping Cart Management

## Requirements
- Node.js with ES modules
- npm
- Postman or Thunder Client for testing the Express REST API

## Setup
```bash
npm install
```

## Part A: built-in HTTP and FS modules
Run in terminal 1:
```bash
node httpServer.js
```
Expected message: `HTTP Server running at http://localhost:3000`

Try these routes in a browser:
- `http://localhost:3000/`
- `http://localhost:3000/cart`
- `http://localhost:3000/about`
- `http://localhost:3000/home`

To test `POST /add-to-cart`, use Postman:
- Method: `POST`
- URL: `http://localhost:3000/add-to-cart`
- Body → raw → JSON:
```json
{
  "id": 4,
  "productName": "Bluetooth Headphones",
  "price": 1499,
  "quantity": 1
}
```

## Part B: Express REST API
Run in a second terminal:
```bash
node expressApp.js
```
Expected message: `Express Server running at http://localhost:4000`

Test these endpoints:
- `GET http://localhost:4000/cart`
- `GET http://localhost:4000/cart/1`
- `POST http://localhost:4000/cart`
- `PUT http://localhost:4000/cart/1`
- `DELETE http://localhost:4000/cart/1`

For POST, choose Body → raw → JSON:
```json
{
  "id": 4,
  "productName": "Bluetooth Headphones",
  "price": 1499,
  "quantity": 1,
  "category": "Electronics"
}
```

For PUT, use Body → raw → JSON:
```json
{
  "productName": "Wireless Mouse",
  "price": 899,
  "quantity": 3,
  "category": "Electronics"
}
```

The applications use separate in-memory arrays and run independently on ports 3000 and 4000. Restarting a server resets its in-memory data, as required by the examination's array-based approach.

## Submission checklist
- Create a GitHub repository named `MT1-LABEXAM`.
- Commit the initial project setup, then commit updates after Part A and Part B using meaningful messages.
- Capture genuine screenshots and save them under `screenshots/`.
- Verify all routes and all four Express CRUD methods in Postman.
