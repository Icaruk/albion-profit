import dame from "dame";

export async function findItemById(id) {
	const { default: itemDataJson } = await import("../items_p2.json");

	for (const _itemData of itemDataJson) {
		if (_itemData?.UniqueName === id) {
			return _itemData;
		}
	}

	const url = `https://gameinfo.albiononline.com/api/gameinfo/items/${id}/data`;

	// const itemData = await findItemById(productId);
	const { response: itemData } = await dame.get(`https://corsproxy.io/?url=${url}`, {
		timeout: 6000,
	});

	return itemData;
}
