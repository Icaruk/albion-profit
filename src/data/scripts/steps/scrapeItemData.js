import fs from "node:fs";
import { fetchJson } from "../lib/http.js";
import { gameInfoItemUrl, ITEM_DATA_CACHE_PATH, RAW_ITEMS_CACHE_PATH } from "../lib/paths.js";

/** Parallel scrape workers. */
const DEFAULT_CONCURRENCY = Number(process.env.SCRAPE_CONCURRENCY ?? 2);

/** Delay applied by each worker between requests. */
const DEFAULT_DELAY_MS = Number(process.env.SCRAPE_DELAY_MS ?? 300);

/** Write the cache to disk every N processed items. */
const FLUSH_EVERY = 50;

/** Progress log every N processed items. */
const LOG_EVERY = 25;

/**
 * Keep only the fields the app reads from gameinfo responses.
 * Kept verbatim: whole `craftingRequirements`, whole `enchantments`
 * (its inner array is indexed by enchant level) and `categoryId`.
 *
 * @param {object} response
 * @returns {object}
 */
function trimItemData(response) {
	const trimmed = {};

	if ("categoryId" in response) {
		trimmed.categoryId = response.categoryId;
	}

	if ("craftingRequirements" in response) {
		trimmed.craftingRequirements = response.craftingRequirements;
	}

	if ("enchantments" in response) {
		trimmed.enchantments = response.enchantments;
	}

	return trimmed;
}

function readJsonFile(filepath, fallback) {
	if (!fs.existsSync(filepath)) {
		return fallback;
	}

	return JSON.parse(fs.readFileSync(filepath, "utf8"));
}

/**
 * Scrape missing item data from the official gameinfo API into the cache.
 *
 * Cache value semantics:
 * - `null`  -> API returned 404, item has no data (never retried).
 * - object  -> scraped successfully (may be empty: no recipe at all).
 * - absent  -> not scraped yet or failed (retried on the next run).
 *
 * @param {{ refresh?: boolean }} options
 * @returns {Promise<{ scraped: number, ok: number, notFound: number, failed: number, cached: number }>}
 */
export async function scrapeItemData({ refresh = false } = {}) {
	const rawItems = readJsonFile(RAW_ITEMS_CACHE_PATH, null);

	if (!Array.isArray(rawItems)) {
		throw new Error(
			`Raw items cache not found at ${RAW_ITEMS_CACHE_PATH}. Run the download step first.`,
		);
	}

	const cache = refresh ? {} : readJsonFile(ITEM_DATA_CACHE_PATH, {});

	if (refresh) {
		console.log("--refresh-scrape: discarding existing item data cache");
	}

	const pending = rawItems
		.map((_item) => _item?.UniqueName)
		.filter((id) => Boolean(id) && !(id in cache));

	console.log(
		`${rawItems.length} items in raw cache, ${Object.keys(cache).length} already cached, ${pending.length} to scrape (concurrency ${DEFAULT_CONCURRENCY}, delay ${DEFAULT_DELAY_MS}ms)`,
	);

	const stats = { scraped: 0, ok: 0, notFound: 0, failed: 0, cached: Object.keys(cache).length };

	if (pending.length === 0) {
		console.log("Nothing to scrape, cache is up to date");
		return { ...stats, cached: Object.keys(cache).length };
	}

	let nextIndex = 0;
	let dirtyCount = 0;

	const flush = () => {
		fs.writeFileSync(`${ITEM_DATA_CACHE_PATH}.tmp`, JSON.stringify(cache));
		fs.renameSync(`${ITEM_DATA_CACHE_PATH}.tmp`, ITEM_DATA_CACHE_PATH);
	};

	const worker = async () => {
		while (nextIndex < pending.length) {
			const id = pending[nextIndex++];
			const { ok, status, data } = await fetchJson(gameInfoItemUrl(id));

			if (ok) {
				cache[id] = trimItemData(data);
				stats.ok++;
			} else if (status === 404) {
				cache[id] = null;
				stats.notFound++;
			} else {
				// Absent from cache: retried on the next run
				stats.failed++;
			}

			stats.scraped++;
			dirtyCount++;

			if (stats.scraped % LOG_EVERY === 0) {
				console.log(
					`  [${stats.scraped}/${pending.length}] ok=${stats.ok} notFound=${stats.notFound} failed=${stats.failed}`,
				);
			}

			if (dirtyCount >= FLUSH_EVERY) {
				flush();
				dirtyCount = 0;
			}

			await new Promise((resolve) => setTimeout(resolve, DEFAULT_DELAY_MS));
		}
	};

	await Promise.all(
		Array.from({ length: Math.min(DEFAULT_CONCURRENCY, pending.length) }, worker),
	);

	flush();

	console.log(
		`Scrape done: ok=${stats.ok} notFound=${stats.notFound} failed=${stats.failed} -> ${ITEM_DATA_CACHE_PATH}`,
	);

	return { ...stats, cached: Object.keys(cache).length };
}
