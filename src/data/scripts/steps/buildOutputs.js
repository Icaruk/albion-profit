import fs from "node:fs";
import {
	ITEM_DATA_CACHE_PATH,
	ITEMS_JS_PATH,
	ITEMS_WITH_ALL_DATA_PATH,
	RAW_ITEMS_CACHE_PATH,
} from "../lib/paths.js";

/**
 * Build the entry consumed by the app (names in the 3 supported languages).
 * Matches the legacy generator, including the "missing" fallback.
 *
 * @param {object} rawItem
 * @returns {object}
 */
function toSimpleItem(rawItem) {
	return {
		LocalizationNameVariable: rawItem.LocalizationNameVariable,
		LocalizedNames: {
			"EN-US": rawItem.LocalizedNames?.["EN-US"] ?? "missing",
			"ES-ES": rawItem.LocalizedNames?.["ES-ES"] ?? "missing",
			"FR-FR": rawItem.LocalizedNames?.["FR-FR"] ?? "missing",
		},
		UniqueName: rawItem.UniqueName,
	};
}

/**
 * Serialize items as a JSON array with one entry per line.
 * `firstLinePrefix` is either the JS export header or `[`.
 *
 * @param {object[]} items
 * @param {string} firstLinePrefix
 * @returns {string}
 */
function serializeOnePerLine(items, firstLinePrefix) {
	const lines = items.map((item, index) => {
		const prefix = index === 0 ? firstLinePrefix : "";
		const trailingComma = index < items.length - 1 ? "," : "";
		return `${prefix}${JSON.stringify(item)}${trailingComma}`;
	});

	lines.push("]");

	return lines.join("\n");
}

/**
 * Regenerate `src/data/items.js` and `src/data/itemsWithAllData.json`
 * from the raw items cache + the scraped item data cache.
 *
 * @returns {Promise<{ simpleCount: number, enrichedCount: number, withItemData: number, notFound: number }>}
 */
export async function buildOutputs() {
	const rawItems = JSON.parse(fs.readFileSync(RAW_ITEMS_CACHE_PATH, "utf8"));
	const itemDataCache = JSON.parse(fs.readFileSync(ITEM_DATA_CACHE_PATH, "utf8"));

	let withItemData = 0;
	let notFound = 0;

	const simpleItems = [];
	const enrichedItems = rawItems.map((_rawItem) => {
		const id = _rawItem.UniqueName;
		const simpleItem = toSimpleItem(_rawItem);
		const scrapedData = itemDataCache[id];

		simpleItems.push(simpleItem);

		if (scrapedData === null) {
			notFound++;
			return simpleItem;
		}

		if (scrapedData && typeof scrapedData === "object") {
			withItemData++;
			return { ...simpleItem, _itemData: scrapedData };
		}

		return simpleItem;
	});

	fs.writeFileSync(
		ITEMS_JS_PATH,
		serializeOnePerLine(simpleItems, "export const albionData = ["),
	);
	fs.writeFileSync(ITEMS_WITH_ALL_DATA_PATH, serializeOnePerLine(enrichedItems, "["));

	console.log(`Built ${simpleItems.length} items -> ${ITEMS_JS_PATH}`);
	console.log(
		`Built ${enrichedItems.length} items (${withItemData} with _itemData, ${notFound} 404) -> ${ITEMS_WITH_ALL_DATA_PATH}`,
	);

	return {
		simpleCount: simpleItems.length,
		enrichedCount: enrichedItems.length,
		withItemData,
		notFound,
	};
}
