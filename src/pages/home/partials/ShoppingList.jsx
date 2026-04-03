import {
	Alert,
	alpha,
	Box,
	Button,
	Center,
	Checkbox,
	Chip,
	Group,
	Input,
	NumberInput,
	Progress,
	Stack,
	Text,
	TextInput,
} from "@mantine/core";
import { IconShoppingCartPlus, IconTrash } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { findSimpleItemDataById } from "@/data/utils/findSimpleItemDataById";
import { globalStore } from "@/mobx/rootStore";
import * as m from "@/paraglide/messages.js";
import { ItemImage } from "./ProductRow.jsx";

/**
 * @typedef Props
 * @property {import("@/mobx/stores/shoppingListStore").ShoppingListStore} shoppingList
 * @property {(itemId: string)=>void} onCopy
 * @property {()=>void} onClear
 * @property {()=>void} onEdit
 */

/**
 * @param {Props} Props.
 */

export const ShoppingList = observer(({ shoppingList, onCopy, onClear, onEdit }) => {
	const items = shoppingList.getItems();
	const isEmptyList = shoppingList.isEmpty();

	function handleEditOwningQuantity(parentItemId, quantity) {
		shoppingList.editItem(parentItemId, { owningQuantity: quantity });
		onEdit?.();
	}

	function handleClear() {
		onClear?.();
	}

	const readyItems = items.filter((_item) => {
		const requiredQuantity = Math.round(_item.requiredQuantity);
		const owningQuantity = Math.round(_item.owningQuantity);
		return owningQuantity >= requiredQuantity;
	}).length;

	const totalItems = items.length;
	const progressPercent = totalItems > 0 ? (readyItems / totalItems) * 100 : 0;

	return (
		<>
			{isEmptyList && (
				<Alert variant="light" color="blue" title="Empty list" mb="md">
					<Group gap="xs">
						{m.emptyShoppingListHint()}
						<IconShoppingCartPlus size={24} />
					</Group>
				</Alert>
			)}

			{!isEmptyList && (
				<Center>
					<Button
						variant="subtle"
						leftSection={<IconTrash />}
						onClick={handleClear}
						mb="md"
					>
						{m.removeAll()}
					</Button>
				</Center>
			)}

			<Stack gap="xs" mb={isEmptyList ? 0 : 80}>
				{items.map((_shoppingListItem) => {
					const itemData = findSimpleItemDataById(_shoppingListItem.parentItemId);

					const translatedName =
						itemData?.LocalizedNames[globalStore.getItemLangKey()] ??
						_shoppingListItem.parentItemId;

					const requiredQuantity = Math.round(_shoppingListItem.requiredQuantity);
					const owningQuantity = Math.round(_shoppingListItem.owningQuantity);
					const pendingQuantity = Math.round(
						_shoppingListItem.requiredQuantity - _shoppingListItem.owningQuantity,
					);

					const isReady = owningQuantity >= requiredQuantity;
					const isPending = owningQuantity > 0 && !isReady;

					let bgColor;

					if (isReady) {
						bgColor = alpha("var(--mantine-color-green-4)", 0.07);
					} else if (isPending) {
						bgColor = alpha("var(--mantine-color-yellow-4)", 0.05);
					}

					return (
						<Group
							key={_shoppingListItem.parentItemId}
							p="xs"
							style={{
								backgroundColor: bgColor,
							}}
						>
							<ItemImage
								itemId={_shoppingListItem.parentItemId}
								onCopy={() => onCopy(translatedName)}
							/>

							<TextInput label="Item name" value={translatedName} readOnly />

							<TextInput
								label={<Text size="xs">Required</Text>}
								w={60}
								value={requiredQuantity}
								readOnly
								variant="unstyled"
							/>

							<NumberInput
								label={<Text size="xs">Owned</Text>}
								w={60}
								value={owningQuantity}
								onChange={(val) => {
									handleEditOwningQuantity(_shoppingListItem.parentItemId, val);
								}}
								min={0}
								hideControls
							/>

							<TextInput
								label={<Text size="xs">Pending</Text>}
								w={60}
								color={isPending ? "yellow" : undefined}
								value={pendingQuantity}
								readOnly
								variant="unstyled"
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
											handleEditOwningQuantity(
												_shoppingListItem.parentItemId,
												val,
											);
										}}
									/>
								</Group>
							</Input.Wrapper>
						</Group>
					);
				})}
			</Stack>

			{!isEmptyList && (
				<Box
					pos="sticky"
					bottom={0}
					left={0}
					right={0}
					p="sm"
					style={{
						backgroundColor: "var(--mantine-color-body)",
						borderTop: "1px solid var(--mantine-color-default-border)",
					}}
				>
					<Group justify="space-between" mb="xs">
						<Text size="sm" fw={500}>
							Progress
						</Text>
						<Text size="sm" c="dimmed">
							{readyItems}/{totalItems}
						</Text>
					</Group>
					<Progress
						value={progressPercent}
						size="sm"
						color={progressPercent === 100 ? "green" : undefined}
					/>
				</Box>
			)}
		</>
	);
});

export const ShoppingListButton = ({ value = false, onClick, count = 0 }) => {
	return (
		<Group justify="center" align="center" h="100%">
			<Chip checked={value} onClick={() => onClick(value)}>
				{m.shoppingList()} ({count})
			</Chip>
		</Group>
	);
};
