import { chromium, Page } from 'playwright'; 
import { setAmazonLocationToUSA } from './amazon-actions';
import { ProductData, SkuInput } from './product.types'; 
import { log } from './logger';

/**
 * Scrapes individual Amazon product data.
 * * Uses a pre-existing page instance to preserve session state (cookies, 
 * location settings) across multiple requests. Implements a fallback 
 * strategy for price extraction to handle Amazon's A/B testing layouts.
 * * @param page - The active Playwright page with "Deliver To" location already set
 * @param sku - The Amazon ASIN to scrape
 * @returns ProductData object or default values on failure
 */
async function scrapeAmazon(page: Page, sku: string): Promise<ProductData> {
    const url = `https://www.amazon.com/dp/${sku}?th=1`;
    log('INFO', `Navigating to Amazon SKU: ${sku}`);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    const priceSelectors = [
        '#corePrice_feature_div .a-offscreen',             
        '#corePriceDisplay_desktop_feature_div .a-price .a-offscreen', 
        '#corePriceDisplay_desktop_feature_div .aok-offscreen',        
        '.a-price .a-offscreen'                           
    ];

    let price = 'N/A';
    
    const title = await page.locator('span#productTitle').innerText().catch(() => 'N/A');    
    const reviews = await page.locator('[data-hook="total-review-count"]').innerText().catch(() => '0');
    
    for (const selector of priceSelectors) {
        const element = page.locator(selector).first();
        if (await element.count() > 0) {
            const text = await element.innerText();
            if (text.trim().length > 0) {
                price = text.trim();
                break; 
            }
        }
    }

    const product: ProductData = {
        sku: sku,
        source: 'Amazon',
        title: title.trim(),
        price: price,
        description: '', 
        rating: 0,       
        numberOfReviews: reviews.trim(), 
        url: url 
    };

    log('INFO', 'Successfully scraped Amazon data', product);
    return product;
}

/**
 * Main execution entry point.
 * * Iterates through the provided SKUs, handling browser session initialization,
 * location spoofing for US pricing, and rate limiting via random delays.
 */
async function main() {
    const skus: SkuInput[] = [
        { Type: 'Amazon', SKU: 'B0CT4BB651' }, 
        { Type: 'Walmart', SKU: '5326288985' },
        { Type: 'Amazon', SKU: 'B01LR5S6HK' } 
    ];

    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    });
    const page = await context.newPage();

    const setupSku = skus.find(s => s.Type === 'Amazon')?.SKU || 'B0CT4BB651';
    await setAmazonLocationToUSA(page, setupSku);

    for (const item of skus) {
        log('INFO', `Processing item: ${item.Type} - ${item.SKU}`);
        
        if (item.Type === 'Amazon') {
            await scrapeAmazon(page, item.SKU);
            
            const pause = Math.floor(Math.random() * 3000) + 1000;
            log('INFO', `Sleeping for ${pause}ms...`);
            await page.waitForTimeout(pause);
        } else {
            log('WARN', `Skipping Walmart SKU ${item.SKU} (Implementation pending)`);
        }
    }

    log('INFO', 'Job complete. Closing browser.');
    await browser.close();
}

main();