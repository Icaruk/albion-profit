import { ActionIcon, Flex, Group, Image, NumberInput, Select, Stack } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { memo, useMemo } from "react";
import { albionData } from "../../../data/items";
import { useClipboard } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconClipboard } from "@tabler/icons-react";

export default function ItemRow({
	label,
	item = {},
	onChange = () => {},
	onDelete,
	isHighlighted = false,
}) {
	const clipboard = useClipboard();

	const itemList = useMemo(() => {
		const list = new Set();

		for (const _item of albionData) {
			let label = _item.LocalizedNames?.["ES-ES"];

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
	}, []);

	const currentItemName = useMemo(() => {
		for (const _item of albionData) {
			if (_item.UniqueName === item?.id) {
				return _item.LocalizedNames?.["ES-ES"];
			}
		}
	}, [item?.id]);

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
				label="Quantity"
				allowNegative={false}
				allowDecimal={false}
				thousandSeparator="."
				decimalSeparator=","
				hideControls
				w={80}
				value={item?.quantity}
				onChange={(val) => handleChange("quantity", val)}
			/>
			<NumberInput
				label="Price"
				allowNegative={false}
				allowDecimal={false}
				thousandSeparator="."
				decimalSeparator=","
				hideControls
				w={128}
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
				label="Total"
				thousandSeparator="."
				decimalSeparator=","
				hideControls
				w={128}
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
}
