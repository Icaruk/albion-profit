import { locations } from "../../../../data/locations";

export function setGroupItemsPriceWithCity({ group = {}, location = locations[0] }) {
	const newGroupItems = group.items.map((_item) => {
		if (!_item?.price === undefined) {
			return _item;
		}

		const priceData = group.priceData ?? [];

		const foundData = priceData.find(
			(_priceData) => _priceData.item_id === _item.id && _priceData.city === location,
		);
		if (!foundData) {
			return _item;
		}

		_item.price =
			foundData.sell_price_min ?? foundData.buy_price_min ?? foundData.buy_price_max;
		return _item;
	});

	return {
		...group,
		items: newGroupItems,
	};
}
