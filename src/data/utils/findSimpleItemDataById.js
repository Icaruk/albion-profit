import { albionData } from "../items";

export function findSimpleItemDataById(id) {
	return albionData.find((_item) => _item.UniqueName === id);
}
