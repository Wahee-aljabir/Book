const puppeteer = require('puppeteer');

async function testResponsiveDesign() {
    const browser = await puppeteer.launch({ 
        headless: false,
        devtools: true,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Test different device viewports
    const devices = [
        // Mobile Portrait
        { name: 'iPhone 12 Portrait', width: 390, height: 844, orientation: 'portrait' },
        { name: 'Samsung Galaxy S21 Portrait', width: 384, height: 854, orientation: 'portrait' },
        
        // Mobile Landscape  
        { name: 'iPhone 12 Landscape', width: 844, height: 390, orientation: 'landscape' },
        { name: 'Samsung Galaxy S21 Landscape', width: 854, height: 384, orientation: 'landscape' },
        
        // Tablet Portrait
        { name: 'iPad Portrait', width: 768, height: 1024, orientation: 'portrait' },
        
        // Tablet Landscape
        { name: 'iPad Landscape', width: 1024, height: 768, orientation: 'landscape' }
    ];
    
    console.log('🚀 Starting responsive design tests...\n');
    
    for (const device of devices) {
        console.log(`📱 Testing ${device.name} (${device.width}x${device.height})`);
        
        // Set viewport
        await page.setViewport({
            width: device.width,
            height: device.height,
            isMobile: device.width < 768,
            hasTouch: device.width < 768
        });
        
        // Navigate to the book page
        await page.goto('http://localhost:3000/book.html?book=prophet_nuh', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        
        // Wait for page to load and book to initialize
        await page.waitForSelector('#container', { timeout: 10000 });
        await page.waitForFunction(() => {
            const container = document.getElementById('container');
            return container && container.style.display !== 'none';
        }, { timeout: 10000 });
        
        // Test text size
        const textSize = await page.evaluate(() => {
            const textElement = document.querySelector('.story-text');
            if (textElement) {
                const computedStyle = window.getComputedStyle(textElement);
                return parseFloat(computedStyle.fontSize);
            }
            return 0;
        });
        
        console.log(`   ✓ Text size: ${textSize}px ${textSize >= 24 ? '(✅ Meets 24px requirement)' : '(❌ Below 24px requirement)'}`);
        
        // Test if help note is hidden on mobile
        const helpNoteVisible = await page.evaluate(() => {
            const aside = document.querySelector('aside');
            if (aside) {
                const computedStyle = window.getComputedStyle(aside);
                return computedStyle.display !== 'none';
            }
            return false;
        });
        
        if (device.width < 1024) {
            console.log(`   ✓ Help note hidden: ${!helpNoteVisible ? '✅ Hidden as expected' : '❌ Still visible'}`);
        }
        
        // Test navigation buttons
        const navButtons = await page.evaluate(() => {
            const buttons = document.querySelectorAll('nav button');
            return Array.from(buttons).map(btn => {
                const rect = btn.getBoundingClientRect();
                const computedStyle = window.getComputedStyle(btn);
                return {
                    width: rect.width,
                    height: rect.height,
                    fontSize: parseFloat(computedStyle.fontSize),
                    position: computedStyle.position
                };
            });
        });
        
        if (navButtons.length > 0) {
            const touchTargetOk = navButtons.every(btn => btn.width >= 44 && btn.height >= 44);
            console.log(`   ✓ Touch targets: ${touchTargetOk ? '✅ Meet 44px minimum' : '❌ Below 44px minimum'}`);
            
            if (device.orientation === 'landscape' && device.width < 1024) {
                const isFixed = navButtons.every(btn => btn.position === 'fixed');
                console.log(`   ✓ Navigation positioning: ${isFixed ? '✅ Fixed positioning for landscape' : '❌ Not fixed positioned'}`);
            }
        }
        
        // Test content layout priority
        const contentLayout = await page.evaluate(() => {
            const textElement = document.querySelector('.story-text');
            const imageElement = document.querySelector('.story-image');
            
            if (textElement && imageElement) {
                const textRect = textElement.getBoundingClientRect();
                const imageRect = imageElement.getBoundingClientRect();
                
                return {
                    textOrder: parseInt(window.getComputedStyle(textElement).order || '0'),
                    imageOrder: parseInt(window.getComputedStyle(imageElement).order || '0'),
                    textHeight: textRect.height,
                    imageHeight: imageRect.height
                };
            }
            return null;
        });
        
        if (contentLayout) {
            const priorityCorrect = contentLayout.textOrder <= contentLayout.imageOrder;
            console.log(`   ✓ Content priority: ${priorityCorrect ? '✅ Text before images' : '❌ Incorrect order'}`);
        }
        
        // Take screenshot for visual verification
        await page.screenshot({
            path: `test-screenshots/${device.name.replace(/\s+/g, '_')}.png`,
            fullPage: false
        });
        
        console.log(`   📸 Screenshot saved: ${device.name.replace(/\s+/g, '_')}.png\n`);
        
        // Wait a moment between tests
        await page.waitForTimeout(1000);
    }
    
    console.log('✅ Responsive design testing completed!');
    console.log('📁 Screenshots saved in test-screenshots/ directory');
    
    await browser.close();
}

// Create screenshots directory and run tests
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots');
}

testResponsiveDesign().catch(console.error);