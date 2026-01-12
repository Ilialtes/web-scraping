import { chromium } from "playwright";
import { createObjectCsvWriter } from "csv-writer"; 

import { setAmazonLocationToUSA } from "./amazon-actions";
import { log } from "./logger";
import { scrapeAmazon } from "./scrappers/amazon";
import { scrapeWalmart } from "./scrappers/walmart";
import { loadSkus } from "./utils/file-reader";

async function main() {
  const csvWriter = createObjectCsvWriter({
    path: "results.csv",
    header: [
      { id: "sku", title: "SKU" },
      { id: "source", title: "SOURCE" },
      { id: "title", title: "TITLE" },
      { id: "price", title: "PRICE" },
      { id: "rating", title: "RATING" },
      { id: "numberOfReviews", title: "REVIEWS" },
      { id: "url", title: "URL" },
    ],
    append: false,
  });

  const skus = loadSkus("skus.json");
  if (skus.length === 0) {
    log("ERROR", "No SKUs found in skus.json. Exiting.");
    return;
  }

  const userAgentStrings = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  ];

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    userAgent:
      userAgentStrings[Math.floor(Math.random() * userAgentStrings.length)],
    viewport: { width: 1280, height: 720 },
  });

  const page = await context.newPage();

  if (skus.some((s) => s.Type === "Amazon")) {
    const setupSku = skus.find((s) => s.Type === "Amazon")?.SKU || "B0CT4BB651";
    await setAmazonLocationToUSA(page, setupSku);
  }

  for (const item of skus) {
    log("INFO", `Processing item: ${item.Type} - ${item.SKU}`);
    try {
      let data = null;

      if (item.Type === "Amazon") {
        data = await scrapeAmazon(page, item.SKU);
      } else if (item.Type === "Walmart") {
        data = await scrapeWalmart(page, item.SKU);
      }

      if (data) {
        await csvWriter.writeRecords([data]);
        log("INFO", `Saved data for ${item.SKU}`);
      } else {
        log("WARN", `Skipping CSV write for ${item.SKU} (No data returned)`);
      }
    } catch(error) {
        log('ERROR', `CRITICAL FAILURE on ${item.SKU}. Moving to next item.`, error);
    }

    const pause = Math.floor(Math.random() * 3000) + 1000;
    await page.waitForTimeout(pause);
  }

  log("INFO", "Job complete. Closing browser.");
  await browser.close();
}

main();
