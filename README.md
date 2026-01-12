# Scraper (Amazon & Walmart)

##  Tech Stack

* **Language:** TypeScript
* **Engine:** Playwright (Chromium)
* **Utilities:** `csv-writer` (Data Export)

##  Project Structure

```bash
├── src
│   ├── index.ts              # Entry point (Orchestrator)
│   ├── amazon-actions.ts     # Logic to set US NY code
│   ├── logger.ts             # Custom logger (Console + File)
│   ├── product.types.ts      # TypeScript interfaces
│   ├── selectors.ts          # Centralized DOM Selectors configuration
│   ├── scrapers
│   │   ├── amazon.ts         # Amazon-specific scraping logic
│   │   └── walmart.ts        # Walmart-specific scraping logic
│   └── utils
│       ├── file-reader.ts    # JSON input loader
├── skus.json                 # Input file containing SKUs
├── results.csv               # Output file (Generated)
└── errors.log                # Error log file (Generated)

##Installation

Clone the repository:

```bash
git clone https://github.com/Ilialtes/web-scraping.git
cd web-scraping
```

Install dependencies:

```bash
npm install
```

## Usage

**Prepare the Input: The repository includes a skus.json file pre-populated with 150+ sample items for testing. You can run the scraper immediately with this file, or replace it with your own data using the following format:

```json
[
  { "Type": "Amazon", "SKU": "B0CT4BB651" },
  { "Type": "Walmart", "SKU": "5326288985" },
  { "Type": "Amazon", "SKU": "NON_EXISTENT_SKU" }
]
```
**Run the Scraper:**

```bash
npx ts-node src/index.ts
```

**View Results:**

* Successful data is saved to `results.csv`.
* Critical errors are logged to `errors.log`.

## Assumptions & Design Decisions

### **1. Geolocation & Walmart Anti-Bot Challenges**
* **Constraint:** The development environment is located in Costa Rica. Walmart US aggressively geo-blocks non-US IP addresses using PerimeterX, often serving a "Press & Hold" CAPTCHA that cannot be bypassed programmatically without high-quality Residential Proxies.
* **Decision:**
    * **For Amazon:** Implemented an automated "Location Spoofing" mechanism (setting the delivery zip code to `10001`) to ensure the scraper sees accurate US pricing and availability instead of "International Shipping" or "Unavailable" messages.
    * **For Walmart:** Designed a "Graceful Failure" system. If the scraper detects a PerimeterX block, it logs a warning (`WARN: Geo-Block detected`) and skips the item rather than crashing the entire batch. This ensures the pipeline remains robust even in restricted network environments.

### **2. Target Market Default**
* **Assumption:** The intended use case is for the **US Market**.
* **Decision:** The scraper defaults to US settings (Zip 10001, `en-US` locale, New York timezone) regardless of the machine's physical location. This ensures consistent data retrieval for distributed teams who might be running the scraper from different regions.

### **3. Scalability vs. Simplicity**
* **Assumption:** For this assignment (~150 SKUs), a single-threaded browser instance with sequential processing is sufficient.
* **Future Optimization:** For production scale (10,000+ items), the architecture would need to be refactored to use a distributed queue (e.g., Redis/SQS) and a rotating proxy service to handle rate limits and geo-blocks effectively.

## Known Limitations & Assumptions

### 1. Walmart Geo-Blocking
* **Constraint:** This scraper was developed and tested in **Costa Rica**. Walmart US enforces strict geo-blocking policies that aggressively challenge non-US IP addresses, often serving a "Press & Hold" PerimeterX CAPTCHA that cannot be bypassed programmatically without high-quality US Residential Proxies.
* ** Mitigation Strategy:**
    * The script detects this block, logs a warning (WARN: Walmart Geo-Block detected), and skips the item gracefully to prevent crashing the entire batch.
      
### 2. Amazon Location Spoofing
* **Constraint:** By default, Amazon displays "International Shipping" prices and availability when accessed from other countries(Costa Rica in my case).
* **Solution:** The scraper includes an automated middleware that sets the delivery location to **New York (Zip 10001)** via the UI before scraping begins. This ensures the data reflects accurate US market pricing and Prime availability, simulating the experience of a US-based user.

### 3. Single-Instance Architecture
* **Constraint:** The current implementation runs as a single-threaded Node.js process using one browser instance.
* **Context:** For this assigment I assumed 150+ skus, I could scrapped skus but for ease of time and testing I repeated skus for the scraping 
* **Scaling Path:** For enterprise-scale scraping (10,000+ items), this would need to be refactored into a distributed system where a central queue (Redis) dispatches jobs to multiple worker nodes, each managing its own browser context and proxy rotation to maximize throughput without triggering rate limits.

### 4. Logging Strategy
* **Decision:** Implemented a custom, lightweight logging utility (`src/logger.ts`) using standard `fs` and `console` methods to keep the project dependency-free and easy to review.
* **Production Context:** I understand that for a production-grade distributed crawler, a robust logging framework like **Winston** or **Pino** would be preferred. These tools offer structured JSON logging, log rotation, and direct integration with observability platforms (like Datadog, Splunk, or ELK Stack) to handle high-velocity log ingestion.

### 5. Bot Evasion Strategy & Tool Selection
* **Evaluated Tools:** During development, I evaluated specialized stealth libraries including `puppeteer-extra-plugin-stealth` and `rebrowser-playwright` (a fork designed to patch CDP Runtime leaks).
* **Observation:** While these tools are effective in many scenarios, testing confirmed that Walmart's PerimeterX implementation combined with a non-US residential IP (Costa Rica) still triggered blocks even with these patches applied.
* **Decision:** Instead of relying on a potentially unstable or unmaintained fork that didn't solve the root cause (IP reputation), I chose to stick with **Native Playwright** for stability and ease of maintenance. I addressed the blocking issue at the architectural level (via the "Graceful Failure" and "Human-in-the-Loop" patterns) rather than at the library level.



