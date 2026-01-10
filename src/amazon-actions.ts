import { Page } from 'playwright';
import { log } from './logger';

async function handleInterstitial(page: Page) {
    const continueBtn = page.getByRole('button', { name: 'Continue shopping' });
    if (await continueBtn.isVisible()) {
        log('WARN','Found Interstitial. Clicking through...');
        await continueBtn.click();
    }
}

export async function setAmazonLocationToUSA(page: Page, entrySku: string) {
    log('INFO',`Navigating to entry product (${entrySku}) to set location...`);

    
    try {
        await page.goto(`https://www.amazon.com/dp/${entrySku}?th=1`, { waitUntil: 'domcontentloaded' });
        await handleInterstitial(page);
        const locationButton = page.locator('#nav-global-location-popover-link');
        
        const currentLocation = await locationButton.innerText().catch(() => '');
        if (currentLocation.includes('10001')) {
             log('INFO','Location is already New York.');
            return;
        }

        await locationButton.click();
        await page.waitForSelector('#GLUXZipUpdateInput', { timeout: 5000 });
        
        await page.locator('#GLUXZipUpdateInput').fill('10001');
        await page.locator('#GLUXZipUpdate input, #GLUXZipUpdate button').first().click();
    
        await page.waitForTimeout(2000); 

        const doneButton = page.locator('button[name="glowDoneButton"]');
    
        const continueButton = page.getByRole('button', { name: 'Continue' }).first();

        if (await doneButton.isVisible()) {
            log('INFO','Clicking "Done"...');
            await doneButton.click();
        } else if (await continueButton.isVisible()) {
            log('INFO','Clicking "Continue"...');            
            await continueButton.click();
        } else {
            log('WARN','No confirmation button found. Trying to refresh manually.');
        }
    
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(2000); 
        
        log('INFO','Location successfully switched to US!');

    } catch (error) {
        log('ERROR','Failed to set location:');
    }
}