import path from "node:path";

/** Folder that holds the source-of-truth caches (committed to git). */
export const CACHE_DIR = path.join("src", "data", "scripts", "cache");

/** Raw item list downloaded from the ao-bin-dumps GitHub repository. */
export const RAW_ITEMS_CACHE_PATH = path.join(CACHE_DIR, "raw-items.json");

/** Item definitions (parsed items.xml) downloaded from the ao-bin-dumps GitHub repository. */
export const RAW_ITEM_DEFINITIONS_CACHE_PATH = path.join(CACHE_DIR, "raw-item-definitions.json");

/** Item extra data scraped from the official gameinfo API, keyed by item id. */
export const ITEM_DATA_CACHE_PATH = path.join(CACHE_DIR, "item-data.json");

/** Pipeline metadata (urls, dates, counts). */
export const METADATA_PATH = path.join(CACHE_DIR, "metadata.json");

/** Generated app file: simple item list (names only). */
export const ITEMS_JS_PATH = path.join("src", "data", "items.js");

/** Generated app file: simple item list + scraped `_itemData`. */
export const ITEMS_WITH_ALL_DATA_PATH = path.join("src", "data", "itemsWithAllData.json");

/** Source of the raw item list. */
export const RAW_ITEMS_URL =
	"https://raw.githubusercontent.com/ao-data/ao-bin-dumps/refs/heads/master/formatted/items.json";

/** Source of the item definitions dump (parsed items.xml, includes recipes). */
export const ITEM_DEFINITIONS_URL =
	"https://raw.githubusercontent.com/ao-data/ao-bin-dumps/refs/heads/master/items.json";

/**
 * Extra data (recipes, category) for a single item.
 *
 * @param {string} itemId
 * @returns {string}
 */
export function gameInfoItemUrl(itemId) {
	return `https://gameinfo.albiononline.com/api/gameinfo/items/${itemId}/data`;
}
