export async function findFullItemDataById(id) {
	const { albionItems } = await import("../itemsWithAllData");

	return albionItems.find((_item) => _item.uniqueName === id);
}
