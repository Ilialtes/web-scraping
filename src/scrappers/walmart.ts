import { Page } from 'playwright';
import { ProductData } from '../product.types';
import { log } from '../logger';
import { WALMART_SELECTORS } from '../selectors';

export async function scrapeWalmart(page: Page, sku: string): Promise<ProductData | null> {
    const url = `https://www.walmart.com/ip/${sku}`;
    log('INFO', `Navigating to Walmart SKU: ${sku}`);

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

        const pageTitle = await page.title();
        const bodyText = await page.locator('body').innerText();
        
        const isBlocked = WALMART_SELECTORS.BLOCK_TEXT.some(text => 
            bodyText.includes(text) || pageTitle.includes(text)
        );
        
        if (isBlocked) {
            log('WARN', `Walmart Geo-Block detected for SKU ${sku}.`);
            log('WARN', `   (Skipping due to blocking)`);
            return null; 
        }

        if (bodyText.includes('This page could not be found') || pageTitle.includes('Page not found')) {
            log('WARN', `❌ SKU ${sku} does not exist on Walmart (404). Skipping.`);
            return null;
        }

        const title = await page.locator(WALMART_SELECTORS.TITLE).first().innerText().catch(() => 'N/A');
        
        let price = 'N/A';
        for (const selector of WALMART_SELECTORS.PRICE) {
            if (await page.locator(selector).first().isVisible()) {
                const text = await page.locator(selector).first().innerText();
                const match = text.match(/\$?[0-9,.]+/); 
                if (match) {
                    price = match[0];
                    break;
                }
            }
        }

        const product: ProductData = {
            sku,
            source: 'Walmart',
            title,
            price,
            description: '',
            rating: 0,
            numberOfReviews: '0', 
            url
        };

        log('INFO', 'Successfully scraped Walmart data', product);
        return product;

    } catch (error) {
        log('ERROR', `Failed to scrape Walmart SKU ${sku}`, error);
        return null;
    }
}