const puppeteer = require('puppeteer');

async function testMobileLayout() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    
    try {
        // Set mobile portrait viewport
        await page.setViewport({
            width: 375,
            height: 667,
            isMobile: true,
            hasTouch: true,
            deviceScaleFactor: 2
        });
        
        console.log('Testing mobile portrait layout...');
        
        // Navigate to the book
        await page.goto('http://localhost:3000/book.html?book=prophet_nuh', {
            waitUntil: 'networkidle0',
            timeout: 10000
        });
        
        // Wait for the container to load
        await page.waitForSelector('#container', { timeout: 10000 });
        
        // Wait a bit more for dynamic content
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Check viewport dimensions and orientation detection
        const viewportInfo = await page.evaluate(() => {
            return {
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                isMobilePortrait: window.innerWidth <= 768 && window.innerHeight > window.innerWidth,
                orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
            };
        });
        
        console.log('Viewport info:', viewportInfo);
        
        // Take screenshot of mobile portrait view
        await page.screenshot({
            path: 'mobile-portrait-test.png',
            fullPage: true
        });
        
        // Check if mobile-specific page classes exist
        const imagePages = await page.$$('.mobile-image-page');
        const textPages = await page.$$('.mobile-text-page');
        const regularPages = await page.$$('.book-page:not(.mobile-image-page):not(.mobile-text-page)');
        
        console.log(`Found ${imagePages.length} image pages`);
        console.log(`Found ${textPages.length} text pages`);
        console.log(`Found ${regularPages.length} regular pages`);
        
        // Check page structure
        const pageStructure = await page.evaluate(() => {
            const bookPages = document.getElementById('bookPages');
            const children = Array.from(bookPages.children);
            return children.map(child => ({
                className: child.className,
                hasImage: !!child.querySelector('.story-image'),
                hasText: !!child.querySelector('.story-text')
            }));
        });
        
        console.log('Page structure:', pageStructure);
        
        console.log('Mobile portrait layout test completed successfully!');
        console.log('Screenshot saved: mobile-portrait-test.png');
        
    } catch (error) {
        console.error('Test failed:', error.message);
        
        // Take error screenshot
        await page.screenshot({
            path: 'mobile-portrait-error.png',
            fullPage: true
        });
    } finally {
        await browser.close();
    }
}

testMobileLayout();