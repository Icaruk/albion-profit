import fs from "node:fs";
import { fetchJson } from "../lib/http.js";
import {
	ITEM_DEFINITIONS_URL,
	RAW_ITEM_DEFINITIONS_CACHE_PATH,
	RAW_ITEMS_CACHE_PATH,
	RAW_ITEMS_URL,
} from "../lib/paths.js";

/** Languages kept from the raw dump. */
const KEPT_LANGUAGES = ["EN-US", "ES-ES", "FR-FR"];

/**
 * Trim a raw dump entry down to the fields the app needs
 * (no descriptions, no unused languages).
 *
 * @param {object} rawItem
 * @returns {object}
 */
function trimRawItem(rawItem) {
	const localizedNames = {};

	for (const lang of KEPT_LANGUAGES) {
		const value = rawItem.LocalizedNames?.[lang];
		if (value !== undefined) {
			localizedNames[lang] = value;
		}
	}

	return {
		LocalizationNameVariable: rawItem.LocalizationNameVariable,
		LocalizedNames: localizedNames,
		UniqueName: rawItem.UniqueName,
	};
}

/**
 * Download the raw item list from GitHub and write the trimmed cache.
 *
 * @returns {Promise<{ itemCount: number, url: string, downloadedAt: string }>}
 */
export async function downloadItems() {
	console.log(`Downloading raw items from ${RAW_ITEMS_URL} ...`);

	const { ok, data, error } = await fetchJson(RAW_ITEMS_URL, { timeoutMs: 120000 });

	if (!ok || !Array.isArray(data) || data.length < 1000) {
		throw new Error(`Failed to download raw items: ${error?.message ?? "unexpected payload"}`);
	}

	const trimmed = data.map(trimRawItem);

	fs.writeFileSync(RAW_ITEMS_CACHE_PATH, JSON.stringify(trimmed));

	const stats = fs.statSync(RAW_ITEMS_CACHE_PATH);
	const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);

	console.log(`Downloaded ${trimmed.length} items -> ${RAW_ITEMS_CACHE_PATH} (${sizeMB} MB)`);

	console.log(`Downloading item definitions from ${ITEM_DEFINITIONS_URL} ...`);

	const definitions = await fetchJson(ITEM_DEFINITIONS_URL, { timeoutMs: 120000 });

	if (!definitions.ok || !definitions.data?.items) {
		throw new Error(
			`Failed to download item definitions: ${definitions.error?.message ?? "unexpected payload"}`,
		);
	}

	fs.writeFileSync(RAW_ITEM_DEFINITIONS_CACHE_PATH, JSON.stringify(definitions.data));

	const definitionsStats = fs.statSync(RAW_ITEM_DEFINITIONS_CACHE_PATH);
	const definitionsSizeMB = (definitionsStats.size / (1024 * 1024)).toFixed(2);

	console.log(
		`Downloaded item definitions -> ${RAW_ITEM_DEFINITIONS_CACHE_PATH} (${definitionsSizeMB} MB)`,
	);

	return {
		itemCount: trimmed.length,
		url: RAW_ITEMS_URL,
		downloadedAt: new Date().toISOString(),
	};
}
