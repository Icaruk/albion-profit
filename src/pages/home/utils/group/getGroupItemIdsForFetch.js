import { getGroupParts } from "./getGroupParts";

export function getGroupItemIdsForFetch({ group }) {
	const { product, ingredients } = getGroupParts(group);

	const itemList = new Set(); // "ITEMS_T4_WOOD", "ITEMS_T4_PLANKS"
	itemList.add(product.id);

	for (const _ingredient of ingredients) {
		itemList.add(_ingredient.id);
	}

	const itemIdList = [...itemList].map((_itemId) => {
		// "ITEMS_T4_WOOD" --> "T4_WOOD"
		return _itemId
			.replace(/^ITEMS_/, "")
			.replace(/_SET\d$/, "")
			.toUpperCase();
	});

	const itemIdListStr = itemIdList.join(",");

	return itemIdListStr;
}
