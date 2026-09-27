// node src/data/scripts/updateData.js
//
// Single entry point for the item data pipeline:
//   1. Download the raw item list + item definitions from the ao-bin-dumps GitHub repository.
//   2. Extract categories and recipes from the item definitions dump.
//   3. Scrape any item still missing data from the official gameinfo API (fallback).
//   4. Rebuild the generated files consumed by the app.
//
// Flags:
//   --skip-download    Reuse the existing raw items / definitions caches.
//   --skip-scrape      Do not scrape, rebuild outputs from the existing caches.
//   --refresh-scrape   Discard the item data cache before extracting/scraping.
//
// Environment:
//   SCRAPE_CONCURRENCY  Parallel scrape workers (default 2).
//   SCRAPE_DELAY_MS     Delay between requests per worker (default 300).

import fs from "node:fs";
import { ITEM_DATA_CACHE_PATH, METADATA_PATH } from "./lib/paths.js";
import { buildOutputs } from "./steps/buildOutputs.js";
import { downloadItems } from "./steps/downloadItems.js";
import { extractItemData } from "./steps/extractItemData.js";
import { scrapeItemData } from "./steps/scrapeItemData.js";

const args = new Set(process.argv.slice(2));

async function main() {
	console.log("=== Albion item data pipeline ===");

	let metadata = {};

	if (fs.existsSync(METADATA_PATH)) {
		metadata = JSON.parse(fs.readFileSync(METADATA_PATH, "utf8"));
	}

	if (args.has("--skip-download")) {
		console.log("[1/4] Skipping download (--skip-download)");
	} else {
		console.log("[1/4] Downloading raw items and definitions");
		metadata.download = await downloadItems();
	}

	if (args.has("--refresh-scrape")) {
		console.log("--refresh-scrape: discarding existing item data cache");
		fs.rmSync(ITEM_DATA_CACHE_PATH, { force: true });
	}

	console.log("[2/4] Extracting item data from definitions dump");
	metadata.extract = { ...extractItemData(), extractedAt: new Date().toISOString() };

	if (args.has("--skip-scrape")) {
		console.log("[3/4] Skipping scrape (--skip-scrape)");
	} else {
		console.log("[3/4] Scraping missing item data");
		metadata.scrape = {
			...(await scrapeItemData()),
			scrapedAt: new Date().toISOString(),
		};
	}

	console.log("[4/4] Building outputs");
	metadata.build = { ...(await buildOutputs()), builtAt: new Date().toISOString() };

	fs.writeFileSync(METADATA_PATH, `${JSON.stringify(metadata, null, "\t")}\n`);

	console.log("=== Done ===");
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
