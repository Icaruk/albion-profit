/**
 * Retrieves the tier and enchantment level of an item ID.
 *
 * @param {string} itemId Example: `"T4_WOOD"` or `"T4_WOOD_LEVEL1@1"`
 * @return {{
 * 	tier: number,
 * 	enchant: number
 * }} An object containing the tier and enchantment level.
 */
export function getItemIdComponents(itemId) {
	// T4_WOOD
	// T4_WOOD_LEVEL1@1
	// T4_WOOD_LEVEL2@2
	// T4_WOOD_LEVEL3@3
	// T4_WOOD_LEVEL4@4
	// T5_WOOD

	let tier = null;
	let enchant = 0;

	const parts = itemId.split("_");
	// T4_WOOD --> ["T4", "WOOD"]
	// T4_WOOD_LEVEL1@1 --> ["T4", "WOOD", "LEVEL1@1"]

	const strTier = parts[0]; // "T4"
	tier = +strTier[1]; // 4

	if (parts?.[2]) {
		const partsEnchant = parts[2].split("@"); // ["LEVEL1", "1"]
		enchant = +partsEnchant[1]; // 1
	}

	return { tier, enchant };
}
