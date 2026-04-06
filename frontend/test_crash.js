import puppeteer from 'puppeteer';

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--disable-web-security'] });
    const page = await browser.newPage();

    // Listen for console messages, including errors
    page.on('console', msg => {
        console.log(`[PAGE CONSOLE ${msg.type().toUpperCase()}] ${msg.text()}`);
    });
    page.on('pageerror', error => {
        console.log(`[PAGE ERROR] ${error.message}`);
    });

    try {
        console.log('Navigating to app...');
        await page.goto('http://127.0.0.1:5174/login', { waitUntil: 'networkidle2' });

        console.log('Logging in...');
        await page.type('input[type="text"]', 'ERPSADMIN');
        await page.type('input[type="password"]', 'ErpsAdmin@123!');
        await page.click('button[type="submit"]');

        console.log('Waiting for login to complete...');
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('Navigating to Locations -> Geo Continents...');
        await page.goto('http://127.0.0.1:5174/locations/geo-continents', { waitUntil: 'networkidle2' });

        console.log('Waiting for Add button...');
        await page.waitForSelector('button.btn-primary', { timeout: 10000 });

        console.log('Clicking Add button...');
        const buttons = await page.$$('button.btn-primary');
        let clicked = false;
        for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes('Add New')) {
                await btn.click();
                clicked = true;
                break;
            }
        }

        if (!clicked) {
            console.log('Could not find Add New button');
        } else {
            console.log('Clicked Add New. Waiting 2 seconds for errors...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

    } catch (err) {
        console.error('Test script error:', err);
    } finally {
        await browser.close();
    }
})();
