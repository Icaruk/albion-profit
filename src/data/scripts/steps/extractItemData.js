import fs from "node:fs";
import { ITEM_DATA_CACHE_PATH, RAW_ITEM_DEFINITIONS_CACHE_PATH } from "../lib/paths.js";

/**
 * Categories the app synthesizes recipes for (refined resources) — emitting the
 * real dump recipe would double up with `getIngredients`' synthesized one.
 */
const REFINED_CATEGORIES = new Set(["metalbar", "leather", "fiber", "stoneblock", "planks"]);

/**
 * Categories whose base (enchant 0) recipe must stay absent, replicating the
 * legacy gameinfo data the app's enchant-0 `pop()` workaround depends on.
 */
const NO_BASE_RECIPE_CATEGORIES = new Set(["potion", "cooked"]);

/**
 * Wrap a value that XML→JSON converters only turn into an array when there
 * are two or more elements.
 *
 * @template T
 * @param {T | T[] | undefined | null} value
 * @returns {T[]}
 */
function toArray(value) {
	if (value === undefined || value === null) {
		return [];
	}

	return Array.isArray(value) ? value : [value];
}

/**
 * Map a dump `craftingrequirements` node to the app recipe shape.
 *
 * Dump nodes may be an array of recipe variants (normal + faction); the
 * regular recipe is always the first one. Resource nodes may carry a
 * `@enchantmentlevel` attribute (`@0` means no suffix, `@N` appends `@N`).
 *
 * @param {object | object[] | undefined} craftingRequirements
 * @returns {object | undefined}
 */
function mapRecipe(craftingRequirements) {
	const requirements = Array.isArray(craftingRequirements)
		? craftingRequirements[0]
		: craftingRequirements;

	if (!requirements) {
		return undefined;
	}

	const craftResourceList = [];

	for (const resource of toArray(requirements.craftresource)) {
		const uniqueName = resource["@uniquename"];

		if (!uniqueName) {
			continue;
		}

		const enchantmentLevel = resource["@enchantmentlevel"];

		craftResourceList.push({
			uniqueName:
				enchantmentLevel !== undefined && enchantmentLevel !== "0"
					? `${uniqueName}@${enchantmentLevel}`
					: uniqueName,
			count: Number(resource["@count"]),
		});
	}

	if (craftResourceList.length === 0) {
		return undefined;
	}

	/** @type {object} */
	const recipe = {
		time: Number(requirements["@time"] ?? 0),
		silver: Number(requirements["@silver"] ?? 0),
		craftingFocus: Number(requirements["@craftingfocus"] ?? 0),
		craftResourceList,
	};

	// Bonus field, ignored by the app but useful for future per-craft handling.
	if (requirements["@amountcrafted"] !== undefined) {
		recipe.amountCrafted = Number(requirements["@amountcrafted"]);
	}

	return recipe;
}

/**
 * Map a dump `enchantments` node to the gameinfo `enchantments` shape the app
 * indexes directly (`enchantments.enchantments[enchant]`, index 0 = level 1).
 *
 * @param {object | undefined} entry
 * @returns {{ enchantments: object[] } | undefined}
 */
function mapEnchantments(entry) {
	const enchantments = toArray(entry.enchantments?.enchantment);

	if (enchantments.length === 0) {
		return undefined;
	}

	return {
		enchantments: enchantments.map((enchantment) => ({
			enchantmentLevel: Number(enchantment["@enchantmentlevel"]),
			itemPower:
				enchantment["@itempower"] !== undefined ? Number(enchantment["@itempower"]) : null,
			durability:
				enchantment["@durability"] !== undefined
					? Number(enchantment["@durability"])
					: null,
			craftingRequirements: mapRecipe(enchantment.craftingrequirements),
		})),
	};
}

/**
 * Resolve the categoryId for a dump entry.
 *
 * Legacy cache values win (proven vocabulary), refined resources derive from
 * `@shopsubcategory2` and everything else falls back to `@craftingcategory`.
 *
 * @param {object} entry
 * @param {string | undefined} legacyCategoryId
 * @returns {string | null}
 */
function resolveCategoryId(entry, legacyCategoryId) {
	if (legacyCategoryId) {
		return legacyCategoryId;
	}

	if (entry["@shopsubcategory1"] === "refinedresources") {
		const subcategory = entry["@shopsubcategory2"] ?? "";

		return subcategory === "" ? null : subcategory.replace(/s$/, "");
	}

	return entry["@craftingcategory"] ?? null;
}

/**
 * Extract item data (categories + recipes) from the item definitions dump
 * into the item data cache. Enriches existing entries (legacy or previously
 * scraped) without discarding them.
 *
 * @returns {{ baseEntries: number, variantEntries: number, total: number }}
 */
export function extractItemData() {
	if (!fs.existsSync(RAW_ITEM_DEFINITIONS_CACHE_PATH)) {
		throw new Error(
			`Item definitions cache not found at ${RAW_ITEM_DEFINITIONS_CACHE_PATH} (run without --skip-download)`,
		);
	}

	const definitions = JSON.parse(fs.readFileSync(RAW_ITEM_DEFINITIONS_CACHE_PATH, "utf8"));
	const existing = fs.existsSync(ITEM_DATA_CACHE_PATH)
		? JSON.parse(fs.readFileSync(ITEM_DATA_CACHE_PATH, "utf8"))
		: {};

	const groups = Object.keys(definitions.items ?? {}).filter((key) => !key.startsWith("@"));

	let baseEntries = 0;
	let variantEntries = 0;
	let skippedNoCategory = 0;
	let skippedNoRecipe = 0;

	for (const group of groups) {
		for (const entry of toArray(definitions.items[group])) {
			const baseId = entry["@uniquename"];

			if (!baseId) {
				continue;
			}

			const categoryId = resolveCategoryId(entry, existing[baseId]?.categoryId);

			if (!categoryId) {
				skippedNoCategory++;
				continue;
			}

			const baseRecipe = mapRecipe(entry.craftingrequirements);
			const enchantments = mapEnchantments(entry);
			const enchantmentList = enchantments?.enchantments ?? [];

			/** @type {object} */
			const baseData = {};

			if (
				baseRecipe &&
				!REFINED_CATEGORIES.has(categoryId) &&
				!NO_BASE_RECIPE_CATEGORIES.has(categoryId)
			) {
				baseData.craftingRequirements = baseRecipe;
			}

			if (enchantments) {
				baseData.enchantments = enchantments;
			}

			if (Object.keys(baseData).length > 0) {
				existing[baseId] = { categoryId, ...baseData };
				baseEntries++;
			} else if (!existing[baseId]) {
				skippedNoRecipe++;
			}

			// Enchanted variants get their own cache entry with the recipe of
			// their enchantment level, except refined resources (synthesized).
			for (const enchantment of enchantmentList) {
				const variantId = `${baseId}@${enchantment.enchantmentLevel}`;

				/** @type {object} */
				const variantData = {};

				if (enchantment.craftingRequirements && !REFINED_CATEGORIES.has(categoryId)) {
					variantData.craftingRequirements = enchantment.craftingRequirements;
				}

				if (enchantments) {
					variantData.enchantments = enchantments;
				}

				if (Object.keys(variantData).length > 0) {
					existing[variantId] = {
						categoryId: existing[variantId]?.categoryId ?? categoryId,
						...variantData,
					};
					variantEntries++;
				}
			}
		}
	}

	fs.writeFileSync(ITEM_DATA_CACHE_PATH, JSON.stringify(existing));

	const total = Object.keys(existing).length;

	console.log(
		`Extracted ${baseEntries} base + ${variantEntries} enchanted entries from the item definitions dump`,
	);
	console.log(
		`Item data cache now has ${total} entries (skipped: ${skippedNoCategory} without category, ${skippedNoRecipe} without recipes)`,
	);

	return { baseEntries, variantEntries, total };
}
