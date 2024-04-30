import { albionData } from "../items";

export function findItemById(id) {
	return albionData.find((_item) => _item.UniqueName === id);
}
