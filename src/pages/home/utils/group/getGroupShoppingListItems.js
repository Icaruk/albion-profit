// @ts-check

import { GroupStore, ItemGroupElement } from "@/mobx/stores/groupStore";
import { useEffect } from "react";

/**
 * @typedef ShoppingList
 * @type {Record<string, ItemGroupElement>}
 */

/**
 * @typedef GetShoppingListItemsProps
 * @property {GroupStore[]} groups
 */

/**
 * @param {GetShoppingListItemsProps} Props
 * @returns {ShoppingList}
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
					// Crear una copia completa del objeto para evitar modificar el original
					shoppingList[_item.id] = { ..._item };
				} else {
					// Crear un nuevo objeto con la cantidad actualizada en lugar de modificar directamente
					shoppingList[_item.id] = {
						...foundItem,
						quantity: foundItem.quantity + _item.quantity,
					};
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
