/**
 * localStorage cache for fetched prices, so switching between items
 * does not require fetching again.
 *
 * Entries are keyed by server + item list + locations and expire after TTL_MS.
 */

const PREFIX = "albion-profit:prices:v1";
const TTL_MS = 10 * 60 * 1000; // 10 minutes
const MAX_ENTRIES = 30;

function isCacheEntryValid(entry) {
	return (
		typeof entry?.savedAt === "number" &&
		Date.now() - entry.savedAt < TTL_MS &&
		Array.isArray(entry?.prices)
	);
}

/**
 * djb2 hash, used to keep localStorage keys short.
 * @param {string} str
 * @returns {string}
 */
function hashString(str) {
	let hash = 5381;

	for (let i = 0; i < str.length; i++) {
		hash = ((hash << 5) + hash + str.charCodeAt(i)) | 0;
	}

	return (hash >>> 0).toString(36);
}

/**
 * @param {Object} params
 * @param {string} params.server
 * @param {string} params.itemIds - Comma separated item ids, e.g. "T4_PLANKS,T4_WOOD"
 * @param {string} params.locations - Comma separated locations
 * @returns {string}
 */
function buildCacheKey({ server, itemIds, locations }) {
	const sortedItemIds = itemIds
		.split(",")
		.map((_id) => _id.trim())
		.sort()
		.join(",");

	return `${PREFIX}:${server}:${hashString(`${sortedItemIds}|${locations}`)}`;
}

/**
 * Removes expired entries and keeps entry count under MAX_ENTRIES.
 * @returns {void}
 */
function purgeCache() {
	const now = Date.now();
	/** @type {{key: string, savedAt: number}[]} */
	const entries = [];

	for (let i = 0; i < localStorage.length; i++) {
		const key = localStorage.key(i);

		if (!key?.startsWith(PREFIX)) continue;

		try {
			const entry = JSON.parse(localStorage.getItem(key) ?? "{}");
			entries.push({ key, savedAt: entry?.savedAt ?? 0 });
		} catch {
			entries.push({ key, savedAt: 0 });
		}
	}

	const keysToRemove = entries
		.filter((_entry) => now - _entry.savedAt >= TTL_MS)
		.map((_entry) => _entry.key);

	const validEntries = entries
		.filter((_entry) => now - _entry.savedAt < TTL_MS)
		.sort((a, b) => b.savedAt - a.savedAt);

	while (validEntries.length > MAX_ENTRIES - 1) {
		keysToRemove.push(validEntries.pop().key);
	}

	for (const _key of keysToRemove) {
		localStorage.removeItem(_key);
	}
}

/**
 * @param {Object} params
 * @param {string} params.server
 * @param {string} params.itemIds
 * @param {string} params.locations
 * @param {string} params.productId - Product the history data belongs to
 * @param {import("@/mobx/stores/groupStore").GroupPriceData[]} params.prices
 * @param {import("@/mobx/stores/groupStore").PriceHistoryData[]} params.history
 * @returns {void}
 */
export function savePricesCache({ server, itemIds, locations, productId, prices, history }) {
	try {
		purgeCache();

		const key = buildCacheKey({ server, itemIds, locations });

		localStorage.setItem(
			key,
			JSON.stringify({
				savedAt: Date.now(),
				productId,
				prices,
				history: history ?? [],
			}),
		);
	} catch (error) {
		console.warn("Could not save prices cache", error);
	}
}

/**
 * @param {Object} params
 * @param {string} params.server
 * @param {string} params.itemIds
 * @param {string} params.locations
 * @returns {{
 * 	savedAt: number,
 * 	productId: string,
 * 	prices: import("@/mobx/stores/groupStore").GroupPriceData[],
 * 	history: import("@/mobx/stores/groupStore").PriceHistoryData[],
 * } | null}
 */
export function loadPricesCache({ server, itemIds, locations }) {
	try {
		const key = buildCacheKey({ server, itemIds, locations });
		const entry = JSON.parse(localStorage.getItem(key) ?? "null");

		if (!isCacheEntryValid(entry)) {
			localStorage.removeItem(key);
			return null;
		}

		return entry;
	} catch (error) {
		console.warn("Could not load prices cache", error);
		return null;
	}
}
