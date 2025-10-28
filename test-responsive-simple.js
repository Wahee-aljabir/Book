const puppeteer = require('puppeteer');

async function testResponsiveDesign() {
    const browser = await puppeteer.launch({ 
        headless: false,
        devtools: false,
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    // Test different device viewports
    const devices = [
        // Mobile Portrait
        { name: 'Mobile_Portrait_390x844', width: 390, height: 844 },
        // Mobile Landscape  
        { name: 'Mobile_Landscape_844x390', width: 844, height: 390 },
        // Tablet Portrait
        { name: 'Tablet_Portrait_768x1024', width: 768, height: 1024 },
        // Tablet Landscape
        { name: 'Tablet_Landscape_1024x768', width: 1024, height: 768 }
    ];
    
    console.log('🚀 Starting responsive design screenshot tests...\n');
    
    for (const device of devices) {
        console.log(`📱 Testing ${device.name} (${device.width}x${device.height})`);
        
        try {
            // Set viewport
            await page.setViewport({
                width: device.width,
                height: device.height,
                isMobile: device.width < 768,
                hasTouch: device.width < 768
            });
            
            // Navigate to the book page
            await page.goto('http://localhost:3000/book.html?book=prophet_nuh', { 
                waitUntil: 'domcontentloaded',
                timeout: 15000 
            });
            
            // Wait a bit for any dynamic content
            await page.waitForTimeout(3000);
            
            // Check if we can find any content
            const hasContent = await page.evaluate(() => {
                return document.body.innerHTML.length > 100;
            });
            
            console.log(`   ✓ Page loaded: ${hasContent ? '✅ Content found' : '❌ No content'}`);
            
            // Take screenshot for visual verification
            await page.screenshot({
                path: `test-screenshots/${device.name}.png`,
                fullPage: false
            });
            
            console.log(`   📸 Screenshot saved: ${device.name}.png`);
            
            // Try to get some basic measurements if possible
            try {
                const measurements = await page.evaluate(() => {
                    const container = document.querySelector('.container, #container');
                    const textElements = document.querySelectorAll('.story-text, p, h1, h2');
                    const buttons = document.querySelectorAll('button');
                    
                    let maxTextSize = 0;
                    textElements.forEach(el => {
                        const fontSize = parseFloat(window.getComputedStyle(el).fontSize);
                        if (fontSize > maxTextSize) maxTextSize = fontSize;
                    });
                    
                    let minButtonSize = Infinity;
                    buttons.forEach(btn => {
                        const rect = btn.getBoundingClientRect();
                        const minDimension = Math.min(rect.width, rect.height);
                        if (minDimension < minButtonSize) minButtonSize = minDimension;
                    });
                    
                    return {
                        containerWidth: container ? container.offsetWidth : 0,
                        containerHeight: container ? container.offsetHeight : 0,
                        maxTextSize: maxTextSize,
                        minButtonSize: minButtonSize === Infinity ? 0 : minButtonSize,
                        buttonCount: buttons.length
                    };
                });
                
                console.log(`   📏 Max text size: ${measurements.maxTextSize}px`);
                console.log(`   📏 Min button size: ${measurements.minButtonSize}px`);
                console.log(`   📏 Container: ${measurements.containerWidth}x${measurements.containerHeight}px`);
                
            } catch (measureError) {
                console.log(`   ⚠️  Could not get measurements: ${measureError.message}`);
            }
            
        } catch (error) {
            console.log(`   ❌ Error testing ${device.name}: ${error.message}`);
        }
        
        console.log(''); // Empty line for readability
    }
    
    console.log('✅ Responsive design testing completed!');
    console.log('📁 Screenshots saved in test-screenshots/ directory');
    console.log('👀 Please manually review screenshots to verify:');
    console.log('   - Text size is at least 24px on mobile devices');
    console.log('   - Navigation buttons are positioned correctly in landscape mode');
    console.log('   - Help notes are hidden on mobile devices');
    console.log('   - Content fills the screen appropriately');
    
    await browser.close();
}

// Create screenshots directory and run tests
const fs = require('fs');
if (!fs.existsSync('test-screenshots')) {
    fs.mkdirSync('test-screenshots');
}

testResponsiveDesign().catch(console.error);