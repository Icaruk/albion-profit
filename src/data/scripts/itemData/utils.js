import dame from "dame";
import itemData from "./itemData.json" with { type: "json" };

export async function getOrFetchItemData(itemId) {
	if (!itemId) {
		return null;
	}

	const itemIds = new Set();

	itemIds.add(itemId);
	itemIds.add(itemId.replace(/_CRYSTAL/gi, ""));
	itemIds.add(itemId.replace(/^ITEMS_/gi, ""));
	itemIds.add(itemId.replace(/_SET\d$/gi, ""));

	for (const _itemData of itemData) {
		if (itemIds.has(_itemData.uniqueName)) {
			// Data found
			if (
				_itemData.craftingRequirements ||
				_itemData.enchantments?.[0]?.craftingRequirements
			) {
				return {
					craftingRequirements: _itemData.craftingRequirements,
					enchantments: _itemData.enchantments,
					categoryId: _itemData.categoryId,
				};
			}

			// Need to fetch data
			console.log(`Fetching data for ${Array.from(itemIds).join(", ")}`);

			for await (const _itemId of Array.from(itemIds)) {
				console.log(`  Fetching ${_itemId}`);
				const { isError, response, code } = await dame.get(
					`https://gameinfo.albiononline.com/api/gameinfo/items/${_itemId}/data`,
				);

				if (isError) {
					console.error("  ", response, code);
					return null;
				}

				if (
					_itemData.craftingRequirements ||
					_itemData.enchantments?.[0]?.craftingRequirements
				) {
					return {
						craftingRequirements: response.craftingRequirements,
						enchantments: response.enchantments,
						categoryId: response.categoryId,
					};
				}
			}

			return null;
		}
	}
}

export function asd() {
	return true;
}
