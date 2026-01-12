import { Page } from 'playwright';
import { ProductData } from '../product.types';
import { log } from '../logger';
import { AMAZON_SELECTORS } from '../selectors';

export async function scrapeAmazon(page: Page, sku: string): Promise<ProductData | null> {
    const url = `https://www.amazon.com/dp/${sku}?th=1`;
    log('INFO', `Navigating to Amazon SKU: ${sku}`);

    let attempts = 0;
    while (attempts < 3) {
        try {
            await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
            break;
        } catch (error) {
            attempts++;
            if (attempts === 3) throw error;
            await page.waitForTimeout(5000);
        }
    }

    const is404 = await page.getByText("Sorry! We couldn't find that page").count() > 0 ||
                  await page.title().then(t => t.includes('Page Not Found'));
    if (is404) {
        log('WARN', `❌ SKU ${sku} does not exist. Skipping.`);
        return null;
    }

    const title = await page.locator(AMAZON_SELECTORS.TITLE).innerText().catch(() => 'N/A');

    let price = 'N/A';
    for (const selector of AMAZON_SELECTORS.PRICE) {
        if (await page.locator(selector).first().isVisible()) {
            price = await page.locator(selector).first().innerText();
            break;
        }
    }

    let rating = 0;
    for (const selector of AMAZON_SELECTORS.RATING) {
        if (await page.locator(selector).first().count() > 0) {
            const text = await page.locator(selector).first().innerText();
            const match = text.match(/([0-9.]+)/);
            if (match) {
                rating = parseFloat(match[1]);
                break;
            }
        }
    }

    let reviews = '0';
    for (const selector of AMAZON_SELECTORS.REVIEWS) {
        if (await page.locator(selector).first().count() > 0) {
            reviews = await page.locator(selector).first().innerText();
            break;
        }
    }

    let description = '';
    const bullets = await page.locator(AMAZON_SELECTORS.DESCRIPTION.BULLETS).allInnerTexts();
    
    if (bullets.length > 0) {
        description = bullets.slice(0, 3).join(' | ');
    } else {
        for (const selector of AMAZON_SELECTORS.DESCRIPTION.BOOK_CONTAINERS) {
            if (await page.locator(selector).first().isVisible()) {
                description = await page.locator(selector).first().innerText();
                break;
            }
        }
    }
    description = description.replace(/\s+/g, ' ').trim().substring(0, 500);

    const product: ProductData = {
        sku,
        source: 'Amazon',
        title: title.trim(),
        price: price.trim(),
        description,
        rating,
        numberOfReviews: reviews.trim(), 
        url 
    };

    log('INFO', 'Successfully scraped Amazon data', product);
    return product;
}