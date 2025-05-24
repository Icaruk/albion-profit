import { GroupStore, ItemGroupElement } from "@/mobx/stores/groupStore";

/**
 * @param {GroupStore} group
 * @returns {{product: ItemGroupElement, ingredients: ItemGroupElement[]}}
 */
export function getGroupParts(group) {
	if (!group) {
		return {
			product: null,
			ingredients: null,
		};
	}

	const product = group?.items.find((_i) => _i.type === "product");
	const ingredients = group?.items.filter((_i) => _i.type === "ingredient");

	return {
		product,
		ingredients,
	};
}
