import { globalStore } from "@/mobx/rootStore";
import * as m from "@/paraglide/messages.js";
import {
	ActionIcon,
	Group,
	Image,
	NumberInput,
	Select,
	Text,
	ThemeIcon,
	Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconClipboard,
	IconHelp,
	IconLock,
	IconShoppingCartPlus,
	IconX,
} from "@tabler/icons-react";
import { IconShoppingCartMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { memo, useMemo } from "react";
import { albionData } from "../../../data/items";

export const LockedPriceButton = ({ item, onChange = {} }) => {
	return (
		<Tooltip label={m.priceIsLockedTooltip()}>
			<ThemeIcon
				size="sm"
				variant="transparent"
				color={item.isLocked ? "blue.3" : "gray.9"}
				style={{ cursor: "pointer" }}
				onClick={() => {
					onChange({
						uid: item.uid,
						isLocked: !item.isLocked,
					});
				}}
			>
				<IconLock />
			</ThemeIcon>
		</Tooltip>
	);
};

export const ItemImage = ({ itemId, onCopy }) => {
	return (
		<Image
			h={56}
			w={56}
			src={
				itemId
					? `https://render.albiononline.com/v1/item/${itemId}.png`
					: "https://render.albiononline.com/v1/spell/HASTE.png"
			}
			mt={6}
			onClick={onCopy}
			style={{ cursor: "pointer" }}
			onError={(ev) => {
				ev.currentTarget.src = "https://render.albiononline.com/v1/spell/HASTE.png";
			}}
		/>
	);
};

export const ItemWithComponents = observer(
	({
		label,
		item = {},
		onChange = () => {},
		onDelete,
		onShoppingListClick,
		isHighlighted = false,
	}) => {
		const clipboard = useClipboard();

		const language = globalStore.language;

		const itemList = useMemo(() => {
			const list = new Set();

			for (const _item of albionData) {
				let label = _item.LocalizedNames?.[globalStore.getItemLangKey()];

				if (!label) {
					continue;
				}

				const itemId = _item.UniqueName; // "T8_SHOES_LEATHER_MORGANA@1"

				const parts = itemId.match(/T([0-9])[^@]*@?([0-9])?/);

				const tier = parts?.[1] ?? "";
				const enchant = parts?.[2] ?? "0";

				let prefix = "";
				if (tier) {
					prefix = `T${tier}`;

					if (enchant) {
						prefix = `${prefix}.${enchant}`;
					}

					prefix += " ";
				}

				label = `${prefix}${label}`;

				list.add({
					value: _item.UniqueName,
					label,
				});
			}

			return [...list];
		}, [language]);

		const currentItemName = useMemo(() => {
			for (const _item of albionData) {
				if (_item.UniqueName === item?.id) {
					return _item.LocalizedNames?.[globalStore.getItemLangKey()];
				}
			}
		}, [item?.id, language]);

		const MemoizedSelect = memo(() => {
			return (
				<Select
					label={label}
					placeholder="Pick value"
					data={itemList}
					value={item?.id}
					limit={24}
					onChange={(value) => {
						handleChange({ id: value });
					}}
					searchable
				/>
			);
		}, [itemList]);

		function handleChange(newItem = {}) {
			onChange({
				uid: item?.uid, // mandatory to identify the item
				...newItem,
			});
		}

		function handleCopyItemId() {
			clipboard.copy(currentItemName);

			notifications.show({
				color: "green",
				icon: <IconClipboard />,
				title: "Item has been copied to clipboard",
			});
		}

		let style = {};
		if (isHighlighted) {
			style = {
				borderRadius: 4,
				background: "rgba(255,255,255,0.06)",
			};
		}

		const calculatedTotal = Math.round(item?.quantity * item?.price);

		const isProduct = item?.type === "product";
		const isInShoppingList = item.isInShoppingList;

		return (
			<Group
				h="100%"
				style={style}
				p={4}
				gap="md"
				opacity={item.quantity === 0 ? 0.4 : undefined}
			>
				<ItemImage itemId={item?.id} onCopy={handleCopyItemId} />
				<MemoizedSelect />
				<NumberInput
					label={m.quantity()}
					allowNegative={false}
					allowDecimal={false}
					thousandSeparator="."
					decimalSeparator=","
					min={0}
					max={999_999}
					w={70}
					value={item?.quantity}
					onChange={(val) => handleChange({ quantity: val })}
				/>

				<NumberInput
					label={m.price()}
					allowNegative={false}
					allowDecimal={false}
					thousandSeparator="."
					decimalSeparator=","
					hideControls
					w={100}
					value={item?.price}
					onChange={(val) => handleChange({ price: val, isLocked: true })}
					rightSection={
						<LockedPriceButton
							item={item}
							onChange={({ isLocked }) => handleChange({ isLocked })}
						/>
					}
					error={!item?.price}
				/>

				{isProduct && (
					<NumberInput
						label={
							<Group wrap="nowrap" gap="xxxs">
								<Text size="sm" fw="500">
									Return %
								</Text>
								<Tooltip w={200} multiline label={m.returnRateTooltip()}>
									<ThemeIcon size="sm" variant="transparent" color="gray.5">
										<IconHelp />
									</ThemeIcon>
								</Tooltip>
							</Group>
						}
						allowNegative={true}
						allowDecimal={false}
						thousandSeparator="."
						decimalSeparator=","
						hideControls
						w={100}
						value={item?.returnRate}
						min={0}
						max={100}
						onChange={(val) => handleChange({ returnRate: val })}
					/>
				)}
				<NumberInput
					variant="filled"
					label={m.total()}
					thousandSeparator="."
					decimalSeparator=","
					hideControls
					w={100}
					value={calculatedTotal}
					readOnly
				/>
				<Group gap="xs" mt="lg" pr="xs">
					{onDelete && (
						<Tooltip label={m.deleteThisComponent()}>
							<ActionIcon color="red" variant="subtle" onClick={onDelete}>
								<IconX />
							</ActionIcon>
						</Tooltip>
					)}
					{onShoppingListClick && (
						<Tooltip
							label={
								isInShoppingList
									? m.removeFromShoppingList()
									: m.addToShoppingList()
							}
						>
							<ActionIcon
								variant="subtle"
								onClick={() => {
									onShoppingListClick(item);
								}}
								color={isInShoppingList ? "gray" : "blue"}
							>
								{isInShoppingList ? (
									<IconShoppingCartMinus />
								) : (
									<IconShoppingCartPlus />
								)}
							</ActionIcon>
						</Tooltip>
					)}
				</Group>
			</Group>
		);
	},
);
