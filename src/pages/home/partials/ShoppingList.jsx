import { findItemById } from "@/data/utils/findItemById";
import { globalStore, groupStore } from "@/mobx/rootStore";
import { GroupStore } from "@/mobx/stores/groupStore";
import * as m from "@/paraglide/messages.js";
import {
	ActionIcon,
	Alert,
	Button,
	Card,
	Center,
	Checkbox,
	Chip,
	Group,
	Input,
	InputWrapper,
	Stack,
	Text,
	TextInput,
	ThemeIcon,
	alpha,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { IconShoppingCartPlus } from "@tabler/icons-react";
import { IconTrash } from "@tabler/icons-react";
import { IconCheck } from "@tabler/icons-react";
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
						variant="subtle"
						leftSection={<IconTrash />}
						onClick={() => removeAllFromShoppingList({ groups })}
					>
						{m.removeAll()}
					</Button>
				)}

				{shoppingListItems.map((_shoppingListItem) => {
					const itemData = findItemById(_shoppingListItem.id);

					const translatedName =
						itemData?.LocalizedNames[globalStore.getItemLangKey()] ??
						_shoppingListItem.id;
					const isReady = _shoppingListItem.owningQuantity >= _shoppingListItem.quantity;

					return (
						<Group
							key={_shoppingListItem.id}
							p="xs"
							style={{
								backgroundColor: isReady
									? alpha("var(--mantine-color-green-2)", 0.05)
									: undefined,
							}}
						>
							<ItemImage
								itemId={_shoppingListItem?.id}
								onCopy={() => onCopy(_shoppingListItem.id)}
							/>

							<TextInput label="Item name" value={translatedName} readOnly />

							<TextInput
								label={<Text size="xs">Required</Text>}
								w={60}
								value={_shoppingListItem.quantity}
								readOnly
								variant="filled"
							/>

							<TextInput
								label={<Text size="xs">Owned</Text>}
								w={60}
								value={_shoppingListItem.owningQuantity}
								onChange={(ev) => {
									_shoppingListItem.owningQuantity = Number(ev.target.value) || 0;
								}}
							/>

							<TextInput
								label={<Text size="xs">Pending</Text>}
								w={60}
								value={
									_shoppingListItem.quantity - _shoppingListItem.owningQuantity
								}
								readOnly
								variant="filled"
							/>

							<Input.Wrapper label=" ">
								<Group justify="center">
									<Checkbox
										checked={isReady}
										label="Ready"
										radius="xl"
										onChange={(ev) => {
											if (ev.target.checked) {
												_shoppingListItem.owningQuantity =
													_shoppingListItem.quantity;
											} else {
												_shoppingListItem.owningQuantity = 0;
											}
										}}
									/>
								</Group>
							</Input.Wrapper>
						</Group>
					);
				})}
			</Stack>
		</Card>
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
