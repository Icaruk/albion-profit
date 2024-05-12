export async function findItemById(id) {
	const { albionItems } = await import("../items");

	return albionItems.find((_item) => _item.uniqueName === id);
}
