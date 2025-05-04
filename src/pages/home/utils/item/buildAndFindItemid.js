import { findItemById } from "../../../../data/utils/findItemById";
import { buildItemId } from "./buildItemId";
import { getItemIdComponents } from "./getItemIdComponents";

/**
 * @param {Object} params
 * @param {string} params.itemId
 * @param {-1 | 0 | 1} params.tierChange
 * @param {-1 | 0 | 1} params.enchantChange
 *
 * @return {{
 * 	item: {},
 * 	itemId: string
 * }}
 */
export function buildAndFindItemId({ itemId, tierChange, enchantChange }) {
	const { tier, enchant } = getItemIdComponents(itemId);

	const newItemId = buildItemId({
		id: itemId,
		tier: tier + tierChange,
		enchant: enchant + enchantChange,
	});

	const foundItem = findItemById(newItemId);

	return {
		item: foundItem,
		itemId: newItemId,
	};
}
