// @ts-check

import { GroupStore } from "@/mobx/stores/groupStore";

/**
 * @typedef ShoppingList
 * @type {{[key:string]:{id:string, quantity:number}}}
 */

/**
 * @typedef GetShoppingListItemsProps
 * @property {GroupStore[]} groups
 */

/**
 * @param {GetShoppingListItemsProps} Props
 */
export function getShoppingListItems({ groups }) {
	/** @type {ShoppingList} */
	const shoppingList = {};

	for (const _groupStore of groups) {
		const items = _groupStore.items;

		for (const _item of items) {
			if (_item.isInShoppingList && _item.type === "ingredient") {
				const foundItem = shoppingList[_item.id];

				if (!foundItem) {
					shoppingList[_item.id] = {
						id: _item.id,
						quantity: _item.quantity,
					};
				} else {
					foundItem.quantity += _item.quantity;
				}
			}
		}
	}

	return shoppingList;
}

/**
 * @typedef RemoveAllFromShoppingList
 * @property {GroupStore[]} groups
 */

/**
 * @param {RemoveAllFromShoppingList} Props
 */
export function removeAllFromShoppingList({ groups }) {
	for (const _groupStore of groups) {
		_groupStore.removeAllFromShoppingList();
	}
}

/**
 * @param {ShoppingList[]} shoppingLists
 * @returns {ShoppingList}
 */
export function mergeShoppingLists(shoppingLists = []) {
	return shoppingLists.reduce((acc, curr) => {
		for (const key in curr) {
			if (!acc[key]) {
				acc[key] = curr[key];
			} else {
				acc[key].quantity += curr[key].quantity;
			}
		}
		return acc;
	}, {});
}
