const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const db = new sqlite3.Database(':memory:'); // Using in-memory DB for simplicity

app.use(bodyParser.json()); // Middleware to parse JSON data

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Create the 'products' table
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL
    )
  `);
});

// API endpoint to receive products and calculate total
app.post('/api/calculate-total', (req, res) => {
    const product = req.body.product; 
    if (!product) {
      return res.status(400).json({ error: 'Invalid input, expected a product.' });
    }
  
    const { name, price, quantity } = product;
  
    const insertProductStmt = db.prepare(`
      INSERT INTO products (name, price, quantity) 
      VALUES (?, ?, ?)
    `);
    
    insertProductStmt.run(name, price, quantity);
    insertProductStmt.finalize();

    db.get(`
      SELECT SUM(price * quantity) AS totalValue FROM products
    `, (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ totalValue: row.totalValue });
    });
  });
  

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});