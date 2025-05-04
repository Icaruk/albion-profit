import { buildItemId } from "@/pages/home/utils/item/buildItemId";
import { getItemIdComponents } from "@/pages/home/utils/item/getItemIdComponents";
import dame from "dame";

export async function findItemById(id) {
	const { default: itemDataJson } = await import("../items_p2.json");

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

	const url = `https://gameinfo.albiononline.com/api/gameinfo/items/${id}/data`;

	const { response: fetchedItemExtraData, isError } = await dame.get(
		`https://corsproxy.io/?url=${url}`,
		{
			timeout: 6000,
		},
	);

	if (isError) {
		return null;
	}

	foundItemData._itemData = fetchedItemExtraData;

	return foundItemData;
}
