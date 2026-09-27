import dame from "dame";
import { buildItemId } from "@/pages/home/utils/item/buildItemId";
import { getItemIdComponents } from "@/pages/home/utils/item/getItemIdComponents";

/**
 * Finds an item by id in the locally generated `itemsWithAllData.json`.
 * Falls back to the gameinfo proxy worker when the item has no scraped `_itemData`.
 *
 * @param {string} id Item unique name, e.g. "T4_MAIN_SWORD" or "T5_BAG@2".
 * @returns {Promise<null | { LocalizationNameVariable: string, LocalizedNames: object, UniqueName: string, _itemData?: object }>}
 */
export async function findItemById(id) {
	const { default: itemDataJson } = await import("../itemsWithAllData.json");

	const itemIdsToFetch = new Set([id]);
	let foundItemData = null;

	const { tier, enchant } = getItemIdComponents(id);

	if (enchant !== 0) {
		const enchant0ItemId = buildItemId({
			id,
			tier,
			enchant: 0,
		});

		if (enchant0ItemId) {
			itemIdsToFetch.add(enchant0ItemId);
		}
	}

	for (const _itemData of itemDataJson) {
		if (itemIdsToFetch.has(_itemData?.UniqueName)) {
			foundItemData = _itemData;
			break;
		}
	}

	if (foundItemData?._itemData) {
		return foundItemData;
	}

	if (!foundItemData) {
		return null;
	}

	// const url = `https://gameinfo.albiononline.com/api/gameinfo/items/${id}/data`;
	const url = `https://albion.icaruk.workers.dev/items/${id}/data`;

	const { response: fetchedItemExtraData, isError } = await dame.get(url, {
		timeout: 6000,
	});

	if (isError) {
		return null;
	}

	foundItemData._itemData = fetchedItemExtraData;

	return foundItemData;
}
