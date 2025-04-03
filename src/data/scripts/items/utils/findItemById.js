import dame from "dame";

export async function findItemById(id) {
	const { default: itemDataJson } = await import("../items_p2.json");

	let foundItemData = null;

	for (const _itemData of itemDataJson) {
		if (_itemData?.UniqueName === id) {
			foundItemData = _itemData;
			break;
		}
	}

	if (foundItemData?._itemData) {
		return foundItemData;
	}

	const url = `https://gameinfo.albiononline.com/api/gameinfo/items/${id}/data`;

	const { response: fetchedItemExtraData } = await dame.get(`https://corsproxy.io/?url=${url}`, {
		timeout: 6000,
	});

	foundItemData._itemData = fetchedItemExtraData;

	return foundItemData;
}
