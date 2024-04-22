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

	return (
		<Group h="100%">
			{/* <TextInput
				label={label}
				value={id}
				onChange={(ev) => {
					const value = (ev.target.value ?? "").toUpperCase().replace(" ", "_");
					handleChange("id", value);
				}}
				placeholder={uid}
			/> */}

			<Image
				h={56}
				src={`https://render.albiononline.com/v1/item/${id}.png`}
				mt={6}
			/>

			<MemoizedSelect />
			<NumberInput
				label="Cantidad"
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
				label="Precio"
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
