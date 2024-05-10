import { globalStore } from "@/mobx/rootStore";
import * as m from "@/paraglide/messages.js";
import { ActionIcon, Group, Image, NumberInput, Select, Stack } from "@mantine/core";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconClipboard, IconX } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { memo, useMemo } from "react";
import { albionData } from "../../../data/items";

export const ItemRow = observer(
	({ label, item = {}, onChange = () => {}, onDelete, isHighlighted = false }) => {
		const clipboard = useClipboard();

		const language = globalStore.language;

		const itemList = useMemo(() => {
			const list = new Set();

			for (const _item of albionData) {
				let label = _item.LocalizedNames?.[globalStore.getItemLangKey()];

				if (!label) {
					continue;
				}

				// _item.UniqueName = "T8_SHOES_LEATHER_MORGANA@1"
				const itemId = _item.UniqueName;

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
					limit={16}
					onChange={(value) => {
						handleChange("id", value);
					}}
					searchable
				/>
			);
		}, [itemList]);

		function handleChange(key, value) {
			onChange({
				uid: item?.uid, // mandatory to identify the item
				[key]: value,
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

		const percentageToMultiplier = 1 + (item?.modifierPercentage ?? 0) / 100;
		const calculatedTotal = Math.round(item?.quantity * item?.price * percentageToMultiplier);

		return (
			<Group h="100%" style={style} p={4} gap="md">
				<Image
					h={56}
					src={
						item?.id
							? `https://render.albiononline.com/v1/item/${item?.id}.png`
							: "https://render.albiononline.com/v1/spell/HASTE.png"
					}
					mt={6}
					onClick={() => handleCopyItemId()}
					style={{ cursor: "pointer" }}
				/>

				<MemoizedSelect />
				<NumberInput
					label={m.quantity()}
					allowNegative={false}
					allowDecimal={false}
					thousandSeparator="."
					decimalSeparator=","
					hideControls
					w={70}
					value={item?.quantity}
					onChange={(val) => handleChange("quantity", val)}
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
					onChange={(val) => handleChange("price", val)}
				/>
				{item?.type === "product" && (
					<NumberInput
						label="Mod. %"
						allowNegative={true}
						allowDecimal={false}
						thousandSeparator="."
						decimalSeparator=","
						hideControls
						w={64}
						value={item?.modifierPercentage}
						onChange={(val) => handleChange("modifierPercentage", val)}
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
				{onDelete && (
					<Stack justify="flex-end" mt="lg">
						<ActionIcon variant="subtle" onClick={onDelete}>
							<IconX />
						</ActionIcon>
					</Stack>
				)}
			</Group>
		);
	},
);
