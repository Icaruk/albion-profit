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

	const tierMatch = itemId.match(/T([0-9]{1})/i);
	let tier = tierMatch?.[1] ?? null;

	if (tier) {
		tier = Number.parseInt(tier);
	}

	const enchantMatch = itemId.match(/@([0-9]{1})/i);
	let enchant = enchantMatch?.[1] ?? 0;

	if (enchant) {
		enchant = Number.parseInt(enchant);
	}

	return { tier, enchant };
}
