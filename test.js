const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  // Test 1: Library page loads and lists books
  await page.goto('http://localhost:3000/index.html');
  const bookList = await page.evaluate(() => document.getElementById('book-list').innerHTML);
  if (!bookList.includes('prophet_nuh.json')) {
    console.error('Test failed: Prophet Nuh not listed');
  } else {
    console.log('Test passed: Library lists books');
  }
  
  // Test 2: Book reader loads without error
  await page.goto('http://localhost:3000/book.html?book=prophet_nuh.json');
  const errorDisplay = await page.evaluate(() => document.getElementById('error').style.display);
  if (errorDisplay !== 'none') {
    console.error('Test failed: Error shown in book reader');
  } else {
    console.log('Test passed: Book loads without error');
  }
  
  // Test 3: Images load correctly
  const imageLoaded = await page.evaluate(() => {
    const img = document.querySelector('.story-image');
    return img && img.complete && img.naturalHeight !== 0;
  });
  if (!imageLoaded) {
    console.error('Test failed: Image not loaded');
  } else {
    console.log('Test passed: Images load correctly');
  }
  
  // Test 4: Responsive check (simulate mobile viewport)
  await page.setViewport({ width: 375, height: 667 });
  const mobileLayout = await page.evaluate(() => getComputedStyle(document.body).display !== 'none');
  if (!mobileLayout) {
    console.error('Test failed: Not responsive on mobile');
  } else {
    console.log('Test passed: Responsive on mobile');
  }
  
  // Test 5: No broken links (check library links)
  await page.goto('http://localhost:3000/index.html');
  const links = await page.evaluate(() => Array.from(document.querySelectorAll('a')).map(a => a.href));
  for (const link of links) {
    const response = await page.goto(link);
    if (response.status() !== 200) {
      console.error(`Test failed: Broken link ${link}`);
    }
  }
  console.log('Test passed: No broken links');
  
  await browser.close();
})();