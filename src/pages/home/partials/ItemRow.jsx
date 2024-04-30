import {
	ActionIcon,
	Flex,
	Group,
	Image,
	NumberInput,
	Select,
	Stack,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { memo, useMemo } from "react";
import { albionData } from "../../../data/items";

export default function ItemRow({
	label,
	id,
	uid,
	quantity,
	price,
	onChange = () => {},
	onDelete,
	isHighlighted = false,
}) {
	// const [state, setState] = useState({
	// 	id,
	// 	uid,
	// 	quantity,
	// 	price,
	// });

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

	const MemoizedSelect = memo(() => {
		return (
			<Select
				label={label}
				placeholder="Pick value"
				data={itemList}
				value={id}
				limit={16}
				onChange={(value) => {
					handleChange("id", value);
				}}
				searchable
			/>
		);
	}, [itemList]);

	function handleChange(key, value) {
		// setState((_curr) => {
		// 	return {
		// 		..._curr,
		// 		[key]: value,
		// 	};
		// });

		onChange({
			uid: uid, // mandatory to identify the item
			[key]: value,
		});
	}

	/* useEffect(() => {
		debounce(
			500,
			() => {
				onChange({
					id,
					uid,
					quantity,
					price,
				});
			},
			"ItemRow",
		);
	}, [JSON.stringify(state)]); */

	let style = {};
	if (isHighlighted) {
		style = {
			borderRadius: 4,
			background: "rgba(255,255,255,0.06)",
		};
	}

	return (
		<Group h="100%" style={style} p={4} gap="md">
			<Image
				h={56}
				src={
					id
						? `https://render.albiononline.com/v1/item/${id}.png`
						: "https://render.albiononline.com/v1/spell/HASTE.png"
				}
				mt={6}
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
				value={quantity}
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
				value={price}
				onChange={(val) => handleChange("price", val)}
			/>
			<NumberInput
				variant="filled"
				label="Total"
				thousandSeparator="."
				decimalSeparator=","
				hideControls
				w={128}
				value={quantity * price}
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
