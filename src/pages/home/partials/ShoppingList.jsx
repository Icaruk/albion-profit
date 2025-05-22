import { findItemById } from "@/data/utils/findItemById";
import { globalStore, groupStore } from "@/mobx/rootStore";
import { GroupStore } from "@/mobx/stores/groupStore";
import * as m from "@/paraglide/messages.js";
import { Alert, Button, Card, Center, Chip, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { IconShoppingCartPlus } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import {
	getShoppingListItems,
	removeAllFromShoppingList,
} from "../utils/group/getGroupShoppingListItems";
import { ItemImage } from "./ItemWithComponents";

/**
 * @typedef Props
 * @property {GroupStore[]} groups
 * @property {(itemId: string)=>void} onCopy
 */

/**
 * @param {Props} Props.
 */

export const ShoppingList = observer(({ groups = [], onCopy }) => {
	const shoppingList = getShoppingListItems({ groups });
	const shoppingListItems = Object.values(shoppingList);

	const isEmptyList = shoppingListItems.length === 0;

	return (
		<Center pt="md">
			<Card>
				{isEmptyList && (
					<Alert variant="light" color="blue" title="Empty list">
						<Group gap="xs">
							{m.emptyShoppingListHint()}
							<IconShoppingCartPlus size={24} />
						</Group>
					</Alert>
				)}

				<Stack>
					{!isEmptyList && (
						<Button
							variant="light"
							leftSection={<IconTrash />}
							onClick={() => removeAllFromShoppingList({ groups })}
						>
							{m.removeAll()}
						</Button>
					)}

					{shoppingListItems.map((_shoppingListItem) => {
						const itemData = findItemById(_shoppingListItem.id);

						const translatedName =
							itemData.LocalizedNames[globalStore.getItemLangKey()];

						return (
							<Group key={_shoppingListItem.id}>
								<ItemImage itemId={_shoppingListItem?.id} onCopy={onCopy} />

								<TextInput value={translatedName} readOnly />

								<IconX size={16} />
								<Text size="xl" fw="bold">
									{_shoppingListItem.quantity}
								</Text>
							</Group>
						);
					})}
				</Stack>
			</Card>
		</Center>
	);
});

export const ShoppingListButton = ({ value = false, onClick }) => {
	return (
		<Group justify="center" align="center" h="100%">
			<Chip checked={value} onClick={() => onClick(value)}>
				{m.shoppingList()}
			</Chip>
		</Group>
	);
};
