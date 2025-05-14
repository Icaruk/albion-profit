import { makeAutoObservable, observable } from "mobx";

import { locations } from "@/data/locations";
import { generateUid } from "@/pages/home/utils/group/generateUid";
import { getGroupParts } from "@/pages/home/utils/group/getGroupParts";
import { setGroupItemsPriceWithCity } from "@/pages/home/utils/group/setGroupIngredientsWithCity";
import { buildAndFindItemId } from "@/pages/home/utils/item/buildAndFindItemid";

/**
 * @typedef {Object} PriceHistoryData
 * @property {{avg_price: number, item_count: number, timestamp: string}[]} data
 * @property {string} item_id
 * @property {string} location
 * @property {number} quality
 */

export class ItemGroupElement {
	constructor({ type }) {
		this.type = type;
		this.uid = generateUid();
		this.id = "";
		this.label = "";
		this.quantity = 1;
		this.originalQuantity = 1;
		this.price = 0;
		this.location = locations[0];
		this.priceData = [];
		/** @type {PriceHistoryData[]} */
		this.priceHistoryData = [];
		this.returnRate = 0;
		this.isLocked = false;
	}
}

export class ItemGroup {
	constructor(data, keepId = false) {
		this.id = keepId ? data.id : generateUid();
		this.name = data.name ?? "";
		this.items = data.items ?? [
			new ItemGroupElement({ type: "product" }),
			new ItemGroupElement({ type: "ingredient" }),
		];
		this.tax = data.tax ?? 0;
		this.location = data.location ?? locations[0];
		this.order = data.order ?? 0;

		makeAutoObservable(this);
	}
}

export class GroupStore {
	// group = new ItemGroup({});

	constructor(data, keepId = false) {
		this.id = keepId ? data.id : generateUid();
		this.name = data?.name ?? "";
		this.items = data?.items ?? [
			new ItemGroupElement({ type: "product" }),
			new ItemGroupElement({ type: "ingredient" }),
		];
		this.tax = data?.tax ?? 0;
		this.location = data?.location ?? locations[0];
		this.order = data?.order ?? 0;

		// if (data?.group) {
		// 	const groupClone = JSON.parse(JSON.stringify(data.group));
		// 	this.group = new ItemGroup(groupClone, keepId);
		// }

		makeAutoObservable(this);
		// persist(this, "groupStore");
	}

	/**
	 * @returns {{index: number, item: ItemGroupElement | null}}
	 */
	getGroupItemIndexById = (itemUid) => {
		const itemIndex = this.items.findIndex((item) => item.uid === itemUid);

		return {
			index: itemIndex,
			item: this.items[itemIndex],
		};
	};

	editGroup = ({ payload }) => {
		const hasLocationChanged = payload?.location !== this.location;

		// Set group ingredients price
		if (hasLocationChanged) {
			const newGroupWithData = setGroupItemsPriceWithCity({
				group: this,
				location: payload?.location,
			});

			Object.assign(this, newGroupWithData);
		}

		// Merge group with payload
		const newGroup = observable({
			...this,
			...payload,
		});

		Object.assign(this, newGroup);
	};

	changeGroupTier = ({ tierLevelChange, enchantLevelChange }) => {
		const tierChange = tierLevelChange ?? 0;
		const enchantChange = enchantLevelChange ?? 0;

		// Iterate each item and find if the new tier is valid
		for (const _item of this.items) {
			if (!["product", "ingredient"].includes(_item.type)) {
				continue;
			}

			const { item, itemId } = buildAndFindItemId({
				itemId: _item.id,
				tierChange,
				enchantChange,
			});

			if (item) {
				_item.id = itemId;
				_item.price = 0;
				_item.priceData = [];
			}
		}
	};

	addGroupItem = ({ items, cleanIngredients = false }) => {
		const isMultipleItems = Array.isArray(items);

		if (cleanIngredients === true) {
			this.items = this.items.filter((_item) => {
				return _item.type !== "ingredient";
			});
		}

		// Add only one empty item
		if (!items) {
			this.items.push(new ItemGroupElement({ type: "ingredient" }));
		} else {
			// Add multiple items
			if (isMultipleItems) {
				for (const _item of items) {
					this.items.push({
						..._item,
						uid: generateUid(),
						type: "ingredient",
					});
				}
				// Add one item
			} else {
				this.items.push({
					...items,
					uid: generateUid(),
					type: "ingredient",
				});
			}
		}
	};

	editGroupItem = ({ itemUid, payload, isProduct = false, bindQuantity = false }) => {
		// Get the item index
		const { index: itemIndex, item } = this.getGroupItemIndexById(itemUid);

		if (!itemIndex === -1) return;

		// Save old quantity
		const oldQuantity = item?.quantity;

		// Set the item
		const newItem = {
			...item,
			...payload,
		};

		// Check if we need to increment other items quantity
		if (isProduct && bindQuantity) {
			// Calculate increment multiplier between oldQuantity and newItem.quantity

			// old 1 ---> 1
			// new 2 --> X
			// mult = 2 * 1 / 1 = 2

			// old 10 ---> 1
			// new 12 --> X
			// mult = 12 * 1 / 10 = 1.2

			const incrementMultiplier = (newItem.quantity || 1) / (oldQuantity || 1);

			// Iterate all ingredients
			const { ingredients } = getGroupParts(this);

			for (const _ingredient of ingredients) {
				_ingredient.quantity = _ingredient.quantity * incrementMultiplier;
			}
		}

		const observableItem = observable(newItem);

		this.items[itemIndex] = observableItem;
	};

	deleteGroupItem = ({ itemUid }) => {
		// Get the item index
		const { index: itemIndex } = this.getGroupItemIndexById(itemUid);
		if (!itemIndex === -1) return;

		// Remove the item
		this.items.splice(itemIndex, 1);
	};

	/**
	 * @typedef {Array<{
	 * city: string,
	 * item_id: string,
	 * quality: number,
	 * sell_price_max: number,
	 * sell_price_min: number,
	 * buy_price_max: number,
	 * buy_price_min: number,
	 * }>} SetGroupPriceDataPayload
	 */

	/**
	 * @param {{
	 * 	currentPriceData: SetGroupPriceDataPayload
	 * 	priceHistoryData: {}
	 * }} params
	 */
	setGroupPriceData = ({ currentPriceData, priceHistoryData }) => {
		// Set price data
		this.priceData = observable(currentPriceData);
		this.priceHistoryData = observable(priceHistoryData);

		if (!this.location) {
			this.location = locations[0];
		}

		// Set group ingredients price
		const newGroupWithData = setGroupItemsPriceWithCity({
			group: this,
			location: this?.location,
			skipLocked: true,
		});

		Object.assign(this, observable(newGroupWithData));
	};

	cloneGroup = (data = {}) => {
		const newData = {
			...this,
			...data,
		};
		const newInstance = new GroupStore(newData);
		newInstance.id = generateUid();

		return newInstance;
	};

	toPrimitives = () => {
		return JSON.parse(JSON.stringify(this));
	};
}
