const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        _id: 'test1',
        name: 'Test Product 1',
        price: 99.99,
        description: 'Test product description',
        category: 'Electronics',
        inStock: true
      }
    ]
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on port ${PORT}`);
});
