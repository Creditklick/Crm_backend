// utils/scraper.js
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');

// Target URLs
const YOUR_PROJECT_URLS = [
     'https://www.creditklick.com/',
    'https://www.creditklick.com/Personalloan',
   //  'http://localhost:5173',
   //  'http://localhost:5173/home'
];

// Configuration
const SCRAPER_CONFIG = {
    headlessMode: "new", // Modern headless mode
    timeout: 60000, // 60 seconds
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    contentSelectors: [
        'main', '#root', '.content-wrapper',
        '.text-content', '.page-container', 'section'
    ],
    minContentLength: 500 // Minimum expected characters
};

async function scrapeProjectData() {
    console.log('[Scraper] Process shuru...');
    const browser = await puppeteer.launch({
        headless: SCRAPER_CONFIG.headlessMode,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        executablePath: process.env.PUPPETEER_EXEC_PATH // Optional for Linux
    });

    let allTextContent = '';

    try {
        for (const url of YOUR_PROJECT_URLS) {
            console.log(`[Scraper] Processing: ${url}`);
            const page = await browser.newPage();
            
            try {
                // Browser configuration
                await page.setUserAgent(SCRAPER_CONFIG.userAgent);
                await page.setExtraHTTPHeaders({
                    'accept-language': 'en-US,en;q=0.9'
                });

                // Page navigation with better handling
                const response = await page.goto(url, {
                    waitUntil: 'networkidle2',
                    timeout: SCRAPER_CONFIG.timeout
                });

                console.log(`[Scraper] Status: ${response.status()} ${url}`);

                // Wait for dynamic content
                await page.waitForSelector('body', { timeout: 15000 });
                await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec delay

                // Content extraction
                const html = await page.content();
                const $ = cheerio.load(html);

                // Cleanup elements
                $('script, style, noscript, header, footer, nav, form').remove();

                // Content aggregation
                let pageText = '';
                SCRAPER_CONFIG.contentSelectors.forEach(selector => {
                    pageText += ` ${$(selector).text()}`;
                });

                // Text normalization
                const cleanedText = pageText
                    .replace(/[\s\n\t]+/g, ' ')
                    .replace(/\s{2,}/g, ' ')
                    .trim();

                // Validation and storage
                if (cleanedText.length >= SCRAPER_CONFIG.minContentLength) {
                    allTextContent += `\n\n--- URL: ${url} ---\n${cleanedText}\n`;
                    console.log(`[Scraper] ${cleanedText.length} characters collected`);
                } else {
                    console.warn(`[Scraper] Low content: ${cleanedText.length} chars`);
                    await page.screenshot({ path: `debug_${Date.now()}.png` });
                }

            } catch (pageError) {
                console.error(`[Scraper] Page error: ${pageError.message}`);
            } finally {
                await page.close();
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 sec gap
            }
        }

        return allTextContent || null;

    } catch (globalError) {
        console.error(`[Scraper] Critical error: ${globalError.message}`);
        return null;
    } finally {
        await browser.close();
        console.log('[Scraper] Process complete');
    }
}

module.exports = { scrapeProjectData };