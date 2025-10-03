const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Directory containing the mirrored site
const siteDir = path.join(__dirname, 'windows-cover.webflow.io');

// 1) Serve top-level static assets (e.g. /cdn.prod.website-files.com, /ajax.googleapis.com, etc.)
//    These are referenced with ../ from pages inside siteDir
app.use(express.static(__dirname));

// 2) Serve the mirrored site pages and their assets
app.use(express.static(siteDir));

// 3) Support extensionless clean URLs:
//    /about-us -> /windows-cover.webflow.io/about-us.html
//    /estonian/avaleht -> /windows-cover.webflow.io/estonian/avaleht.html
app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  const hasExt = path.extname(req.path) !== '';
  if (hasExt) return next();

  // Try to resolve to an .html file under the site directory
  const candidate = path.join(siteDir, req.path.replace(/\/$/, '')) + '.html';
  fs.access(candidate, fs.constants.F_OK, err => {
    if (err) return next();
    res.sendFile(candidate);
  });
});

// 4) Root route -> serve the site's index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(siteDir, 'index.html'));
});

// 5) Fallback: if nothing matched, show a helpful listing for debugging
app.use((req, res) => {
  try {
    const files = fs.readdirSync(siteDir).map(f => `<li>${f}</li>`).join('');
    res.status(404).send(`
      <h1>Not Found</h1>
      <p>The requested path could not be resolved to a file.</p>
      <p>Try using paths like "/about-us" or include the .html extension.</p>
      <p>Available files in the site directory:</p>
      <ul>${files}</ul>
    `);
  } catch (e) {
    res.status(404).send('Not Found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
  console.log(`Serving site from: ${siteDir}`);
});
