import { GroupStore } from "@/mobx/stores/groupStore";
import { locations } from "../../../../data/locations";

/**
 * @param {Object} props
 * @param {GroupStore} props.group
 * @param {typeof locations} props.location
 */
export function setGroupItemsPriceWithCity({
	group = {},
	location = locations[0],
	skipLocked = false,
}) {
	const newGroupItems = group.items.map((_item) => {
		if (!_item?.price === undefined) {
			return _item;
		}

		if (skipLocked && _item.isLocked) {
			return _item;
		}

		const priceData = group.priceData ?? [];

		/** @type {import("@/mobx/stores/groupStore").GroupPriceData} */
		const foundData = priceData.find(
			(_priceData) => _priceData.item_id === _item.id && _priceData.city === location,
		);

		if (!foundData) {
			return _item;
		}

		const sellPrice = foundData.sell_price_min ?? 0;
		const buyOrderPrice = foundData.buy_price_max ?? 0;

		_item.price = sellPrice;
		_item.sellPrice = sellPrice;
		_item.buyOrderPrice = buyOrderPrice;

		return _item;
	});

	return newGroupItems;
}
