const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Determine the root directory of the website
// PyWebCopy typically downloads content to a directory structure like domain/path
const rootDir = path.join(__dirname, 'windows-cover.webflow.io');

// Serve static files from the website directory
app.use(express.static(rootDir));

// For any routes not found in static files, serve the index.html
app.get('*', (req, res) => {
  // Try to serve index.html first
  res.sendFile(path.join(rootDir, 'index.html'), err => {
    if (err) {
      // If index.html doesn't exist, send a helpful message
      res.status(404).send(`
        <h1>Website Setup</h1>
        <p>The PyWebCopy download seems to have a different structure than expected.</p>
        <p>Available files in the root directory:</p>
        <ul>
          ${require('fs').readdirSync(rootDir).map(file => `<li>${file}</li>`).join('')}
        </ul>
      `);
    }
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving content from: ${rootDir}`);
});