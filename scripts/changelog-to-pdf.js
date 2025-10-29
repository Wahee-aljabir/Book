const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

function mdToHtml(md) {
  // Minimal markdown to HTML conversion for headings and lists
  const lines = md.split(/\r?\n/);
  let html = '';
  let inList = false;
  for (const line of lines) {
    if (line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${line.slice(2)}</h1>`;
    } else if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${line.slice(3)}</h2>`;
    } else if (line.startsWith('- ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${line.slice(2)}</li>`;
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<br />';
    } else {
      html += `<p>${line}</p>`;
    }
  }
  if (inList) { html += '</ul>'; }
  return `<!doctype html><html><head><meta charset="utf-8" />
    <style>
      body { font-family: Arial, sans-serif; margin: 32px; }
      h1 { font-size: 24px; margin-bottom: 8px; }
      h2 { font-size: 18px; margin-top: 18px; margin-bottom: 8px; }
      ul { margin: 0 0 8px 22px; }
      li { margin: 4px 0; }
      p { margin: 6px 0; }
      a { color: #0366d6; text-decoration: none; }
    </style>
  </head><body>${html}</body></html>`;
}

async function main() {
  const mdPath = path.resolve('CHANGELOG.md');
  if (!fs.existsSync(mdPath)) {
    console.error('CHANGELOG.md not found. Run npm run changelog first.');
    process.exit(1);
  }
  const md = fs.readFileSync(mdPath, 'utf8');
  const html = mdToHtml(md);
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({ path: 'CHANGELOG.pdf', format: 'A4', printBackground: true });
  await browser.close();
  console.log('CHANGELOG.pdf generated successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});