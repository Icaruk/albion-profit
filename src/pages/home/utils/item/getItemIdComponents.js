/**
 * Retrieves the tier and enchantment level of an item ID.
 *
 * @param {string} itemId Example: `"T4_WOOD"` or `"T4_WOOD_LEVEL1@1"`
 * @return {{
 * 	id: string,
 * 	tier: number,
 * 	enchant: number
 * }} An object containing the tier and enchantment level.
 */
export function getItemIdComponents(itemId) {
	// T4_WOOD
	// T4_WOOD_LEVEL1@1
	// T4_WOOD_LEVEL4@4
	// T8_MAIN_FIRESTAFF
	// T8_MAIN_FIRESTAFF@1
	// T8_MAIN_FIRESTAFF@4

	const itemIdMatch = itemId.split(/(_LEVEL)|@/);
	const id = itemIdMatch?.[0];

	const tierMatch = itemId.match(/T([0-9]{1})/i);
	let tier = tierMatch?.[1] ?? null;

	if (tier) {
		tier = Number.parseInt(tier);
	}

	const enchantMatch = itemId.match(/(_LEVEL|@)([0-9]{1})/i);
	let enchant = enchantMatch?.[2] ?? 0;

	if (enchant) {
		enchant = Number.parseInt(enchant);
	}

	return { id, tier, enchant };
}
