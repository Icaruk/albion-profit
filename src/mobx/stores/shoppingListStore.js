import { makeAutoObservable, runInAction } from "mobx";

import { GroupStore } from "./groupStore.js";

export class ShoppingListItem {
	constructor({ parentGroupId, parentItemId, requiredQuantity, owningQuantity = 0 }) {
		this.parentGroupId = parentGroupId;
		this.parentItemId = parentItemId;
		this.requiredQuantity = requiredQuantity;
		this.owningQuantity = owningQuantity;

		makeAutoObservable(this);
	}
}

export class ShoppingListStore {
	constructor(data) {
		this.items = new Map();

		if (data?.items) {
			for (const [key, value] of Object.entries(data.items)) {
				this.items.set(key, new ShoppingListItem(value));
			}
		}

		makeAutoObservable(this);
	}

	buildFromGroups(groups) {
		this.items.clear();

		for (const _group of groups) {
			const items = _group.items;

			for (const _item of items) {
				if (_item.isInShoppingList && _item.type === "ingredient") {
					const foundItem = this.items.get(_item.id);

					if (!foundItem) {
						this.items.set(
							_item.id,
							new ShoppingListItem({
								parentGroupId: _group.id,
								parentItemId: _item.id,
								requiredQuantity: _item.quantity,
								owningQuantity: _item.owningQuantity ?? 0,
							}),
						);
					} else {
						foundItem.requiredQuantity += _item.quantity;
					}
				}
			}
		}

		return this;
	}

	getItems() {
		return Array.from(this.items.values());
	}

	editItem(itemId, payload) {
		runInAction(() => {
			const found = this.items.get(itemId);

			if (!found) {
				console.error(
					`[${this.constructor.name}.editItem]: Cannot find shopping list item with id ${itemId}`,
				);
				return;
			}

			Object.assign(found, payload);
		});
	}

	isEmpty() {
		return this.items.size === 0;
	}

	addItem(item, groupId) {
		runInAction(() => {
			const foundItem = this.items.get(item.id);

			if (!foundItem) {
				this.items.set(
					item.id,
					new ShoppingListItem({
						parentGroupId: groupId,
						parentItemId: item.id,
						requiredQuantity: item.quantity,
						owningQuantity: 0,
					}),
				);
			} else {
				foundItem.requiredQuantity += item.quantity;
			}
		});
	}

	removeItem(itemId) {
		runInAction(() => {
			this.items.delete(itemId);
		});
	}

	clearItems() {
		runInAction(() => {
			this.items.clear();
		});
	}

	clearItemsInGroups(groups) {
		return groups.map((group) => {
			const groupData = group.toPrimitives ? group.toPrimitives() : group;
			const updatedItems = groupData.items.map((item) => {
				const shoppingListItem = this.items.get(item.id);
				if (shoppingListItem && shoppingListItem.parentGroupId === group.id) {
					return {
						...item,
						isInShoppingList: false,
						owningQuantity: 0,
					};
				}
				return item;
			});

			const updatedGroup = new GroupStore(
				{
					...groupData,
					items: updatedItems,
				},
				true,
			);

			return updatedGroup;
		});
	}

	toPrimitives() {
		return {
			items: Object.fromEntries(
				Array.from(this.items.entries()).map(([key, value]) => [
					key,
					{
						parentGroupId: value.parentGroupId,
						parentItemId: value.parentItemId,
						requiredQuantity: value.requiredQuantity,
						owningQuantity: value.owningQuantity,
					},
				]),
			),
		};
	}

	getUpdatedGroups(groups) {
		return groups.map((group) => {
			const groupData = group.toPrimitives ? group.toPrimitives() : group;
			const updatedItems = groupData.items.map((item) => {
				const shoppingListItem = this.items.get(item.id);
				if (shoppingListItem && shoppingListItem.parentGroupId === group.id) {
					return {
						...item,
						owningQuantity: shoppingListItem.owningQuantity,
					};
				}
				return item;
			});

			const updatedGroup = new GroupStore(
				{
					...groupData,
					items: updatedItems,
				},
				true,
			);

			return updatedGroup;
		});
	}
}
