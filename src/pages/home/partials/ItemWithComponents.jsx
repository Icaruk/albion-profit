import { globalStore } from "@/mobx/rootStore";
import { PRICE_MODES } from "@/mobx/stores/groupStore";
import * as m from "@/paraglide/messages.js";
import {
	ActionIcon,
	Grid,
	Group,
	Image,
	Input,
	NumberInput,
	Select,
	Stack,
	Text,
	ThemeIcon,
	Tooltip,
} from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconArrowLeft,
	IconArrowRight,
	IconClipboard,
	IconHelp,
	IconLock,
	IconShoppingCartMinus,
	IconShoppingCartPlus,
	IconX,
} from "@tabler/icons-react";
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
	/**
	 * @param {Object} props
	 * @param {import("@/mobx/stores/groupStore").ItemGroupElement} props.item
	 * @param {(props: import("@/mobx/stores/groupStore").ItemGroupElement) => void} props.onChange
	 * @param {() => void} props.onDelete
	 * @param {(item: import("@/mobx/stores/groupStore").ItemGroupElement) => void} props.onShoppingListClick
	 * @param {boolean} props.isHighlighted
	 */
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

		function handlePriceModeChange() {
			/** @type {import("@/mobx/stores/groupStore").PriceMode} */
			const nextPriceMode =
				item.priceMode === PRICE_MODES.sell ? PRICE_MODES.buyOrder : PRICE_MODES.sell;
			const nextPrice =
				nextPriceMode === PRICE_MODES.buyOrder ? item.buyOrderPrice : item.sellPrice;

			handleChange({
				priceMode: nextPriceMode,
				price: nextPrice,
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

		const style = {
			backgroundColor: "rgba(255,255,255,0.02)",
			opacity: item.quantity === 0 ? 0.4 : undefined,
		};

		if (isHighlighted) {
			style.borderRadius = 4;
			style.backgroundColor = "rgba(255,255,255,0.06)";
		}

		const calculatedTotal = Math.round(item?.quantity * item?.price * (item?.multiply ?? 1))

		const isProduct = item?.type === "product";
		const isInShoppingList = item.isInShoppingList;

		const priceModeIsSell = item.priceMode === PRICE_MODES.sell;

		function buildInpuSelectedStyle(requiredPriceMode) {
			const isRequiredPriceMode = item.priceMode === requiredPriceMode;

			return {
				color: isRequiredPriceMode ? "var(--mantine-color-blue-4)" : undefined,
				opacity: isRequiredPriceMode ? undefined : 0.4,
			};
		}

		return (
			<Grid h="100%" style={style} p="xxs">
				<Grid.Col span="content">
					<ItemImage itemId={item?.id} onCopy={handleCopyItemId} />
				</Grid.Col>

				<Grid.Col span="content">
					<Stack gap="xxs">
						<Group>
							<MemoizedSelect />
							<Group gap="xs" wrap="nowrap">
								<NumberInput
									label={<Text size="xs">{m.sellPrice()}</Text>}
									allowNegative={false}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={100}
									value={item?.sellPrice}
									onChange={(val) =>
										handleChange({
											price: val,
											sellPrice: val,
											priceMode: PRICE_MODES.sell,
											isLocked: true,
										})
									}
									rightSection={
										<LockedPriceButton
											item={item}
											onChange={({ isLocked }) => handleChange({ isLocked })}
										/>
									}
									error={!item?.price}
									style={buildInpuSelectedStyle(PRICE_MODES.sell)}
								/>

								<Input.Wrapper label=" ">
									<Group justify="center">
										<Tooltip label={m.priceModeSwitchTooltip()}>
											<ActionIcon
												size="sm"
												variant="light"
												onClick={handlePriceModeChange}
											>
												{priceModeIsSell ? (
													<IconArrowLeft />
												) : (
													<IconArrowRight />
												)}
											</ActionIcon>
										</Tooltip>
									</Group>
								</Input.Wrapper>

								<NumberInput
									label={<Text size="xs">{m.buyPrice()}</Text>}
									allowNegative={false}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={100}
									value={item?.buyOrderPrice}
									onChange={(val) =>
										handleChange({
											price: val,
											buyOrderPrice: val,
											priceMode: PRICE_MODES.buyOrder,
											isLocked: true,
										})
									}
									rightSection={
										<LockedPriceButton
											item={item}
											onChange={({ isLocked }) => handleChange({ isLocked })}
										/>
									}
									error={!item?.price}
									style={buildInpuSelectedStyle(PRICE_MODES.buyOrder)}
								/>
							</Group>

							{isProduct && (
								<NumberInput
									label={
										<Group wrap="nowrap" gap="xxxs">
											<Text size="sm" fw="500">
												Return %
											</Text>
											<Tooltip
												w={200}
												multiline
												label={m.returnRateTooltip()}
											>
												<ThemeIcon
													size="sm"
													variant="transparent"
													color="gray.5"
												>
													<IconHelp />
												</ThemeIcon>
											</Tooltip>
										</Group>
									}
									allowNegative={true}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									hideControls
									w={100}
									value={item?.returnRate}
									min={0}
									max={100}
									onChange={(val) => handleChange({ returnRate: val })}
								/>
							)}
						</Group>

						<Group>
							<NumberInput
								label={m.quantity()}
								allowNegative={false}
								allowDecimal={false}
								thousandSeparator={globalStore.thousandSeparator}
								decimalSeparator={globalStore.decimalSeparator}
								min={0}
								max={999_999}
								w={80}
								value={item?.quantity}
								onChange={(val) => handleChange({ quantity: val })}
								prefix="x "
							/>

							{isProduct && (
								<NumberInput
									label="Multiply"
									allowNegative={false}
									allowDecimal={false}
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									min={1}
									max={999_999}
									w={80}
									value={item?.multiply ?? 1}
									onChange={(val) => handleChange({ multiply: val })}
									prefix="× "
								/>

							)}

							<NumberInput
								variant="filled"
								label={m.total()}
								thousandSeparator={globalStore.thousandSeparator}
								decimalSeparator={globalStore.decimalSeparator}
								hideControls
								w={120}
								value={calculatedTotal}
								readOnly
							/>
						</Group>
					</Stack>
				</Grid.Col>

				<Grid.Col span="content">
					<Input.Wrapper label=" ">
						<Group gap="xs" pr="xs">
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
					</Input.Wrapper>
				</Grid.Col>
			</Grid>
		);
	},
);
