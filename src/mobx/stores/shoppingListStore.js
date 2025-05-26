// @ts-check

import { makeAutoObservable, observable } from "mobx";

import { GroupStore, ItemGroupElement } from "./groupStore";

/**
 * @typedef ShoppingListItemElement
 * @prop {string} parentGroupId
 * @prop {string} parentItemId
 * @prop {number} requiredQuantity
 * @prop {number} owningQuantity
 * @prop {ItemGroupElement} observable
 */

export class ShoppingListStore {
	constructor(data) {
		/** @type {Record<string, ShoppingListItemElement>} */
		this.items = data?.items ?? {};

		makeAutoObservable(this);
	}

	/**
	 * @param {GroupStore[]} groups
	 * @return {ShoppingListStore}
	 */
	buildFromGroups(groups) {
		for (const _group of groups) {
			const items = _group.items;

			for (const _item of items) {
				if (_item.isInShoppingList && _item.type === "ingredient") {
					this.addItem(_item, _group.id);
				}
			}
		}

		return this;
	}

	/**
	 * @returns {ShoppingListItemElement[]}
	 */
	getItems() {
		return Object.values(this.items);
	}

	/**
	 * @param {string} itemId
	 * @param {Partial<ShoppingListItemElement>} payload
	 */
	editItem(itemId, payload) {
		const found = this.items[itemId];

		if (!found) {
			console.error(
				`[${this.constructor.name}.editItem]: Cannot find shopping list item with id ${itemId}`,
			);
			return;
		}

		const newObservable = observable({
			...found,
			...payload,
		});

		this.items[itemId] = newObservable;
	}

	isEmpty() {
		return Object.keys(this.items).length === 0;
	}

	/**
	 * @param {ItemGroupElement} item
	 * @param {string} groupId
	 */
	addItem(item, groupId) {
		const foundItem = this.items[item.id];

		if (!foundItem) {
			this.items[item.id] = observable({
				observable: item,
				parentGroupId: groupId,
				parentItemId: item.id,
				requiredQuantity: item.quantity,
				owningQuantity: 0,
			});
		} else {
			foundItem.requiredQuantity += item.quantity;
		}
	}

	clearItems() {
		for (const _item of this.getItems()) {
			const observableItem = _item.observable;
			observableItem.isInShoppingList = false;
		}
	}

	toPrimitives = () => {
		return JSON.parse(JSON.stringify(this));
	};
}
