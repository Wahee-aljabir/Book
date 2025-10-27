const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static(path.join(__dirname, '.')));

app.get('/api/books', (req, res) => {
  try {
    const files = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.json') && file !== 'package.json' && file !== 'package-lock.json');
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: 'Failed to list books' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});