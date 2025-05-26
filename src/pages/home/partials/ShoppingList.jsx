import { findItemById } from "@/data/utils/findItemById";
import { globalStore } from "@/mobx/rootStore";
import * as m from "@/paraglide/messages.js";
import {
	Alert,
	Button,
	Card,
	Checkbox,
	Chip,
	Group,
	Input,
	Stack,
	Text,
	TextInput,
	alpha,
} from "@mantine/core";
import { IconShoppingCartPlus, IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { ItemImage } from "./ItemWithComponents";

/**
 * @typedef Props
 * @property {import("@/mobx/stores/shoppingListStore").ShoppingListStore} shoppingList
 * @property {(itemId: string)=>void} onCopy
 */

/**
 * @param {Props} Props.
 */

export const ShoppingList = observer(({ shoppingList, onCopy }) => {
	const items = shoppingList.getItems();
	const isEmptyList = shoppingList.isEmpty();

	function handleEditOwningQuantity(itemId, quantity) {
		shoppingList.editItem(itemId, { owningQuantity: quantity });
	}

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
						onClick={() => shoppingList.clearItems()}
					>
						{m.removeAll()}
					</Button>
				)}

				{items.map((_shoppingListItem) => {
					const itemFromGroup = _shoppingListItem.observable;
					const itemData = findItemById(itemFromGroup.id);

					const translatedName =
						itemData?.LocalizedNames[globalStore.getItemLangKey()] ??
						_shoppingListItem.id;

					const requiredQuantity = Math.round(_shoppingListItem.requiredQuantity);
					const owningQuantity = Math.round(_shoppingListItem.owningQuantity);
					const pendingQuantity = Math.round(
						_shoppingListItem.requiredQuantity - _shoppingListItem.owningQuantity,
					);
					const isReady = owningQuantity >= requiredQuantity;

					return (
						<Group
							key={itemFromGroup.id}
							p="xs"
							style={{
								backgroundColor: isReady
									? alpha("var(--mantine-color-green-2)", 0.05)
									: undefined,
							}}
						>
							<ItemImage
								itemId={itemFromGroup?.id}
								onCopy={() => onCopy(translatedName)}
							/>

							<TextInput label="Item name" value={translatedName} readOnly />

							<TextInput
								label={<Text size="xs">Required</Text>}
								w={60}
								value={requiredQuantity}
								readOnly
								variant="filled"
							/>

							<TextInput
								label={<Text size="xs">Owned</Text>}
								w={60}
								value={owningQuantity}
								onChange={(ev) => {
									const val = Number(ev.target.value);
									handleEditOwningQuantity(itemFromGroup.id, val);
								}}
							/>

							<TextInput
								label={<Text size="xs">Pending</Text>}
								w={60}
								value={pendingQuantity}
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
											const val = ev.currentTarget.checked
												? requiredQuantity
												: 0;
											handleEditOwningQuantity(itemFromGroup.id, val);
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
