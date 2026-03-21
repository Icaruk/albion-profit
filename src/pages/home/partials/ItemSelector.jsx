import { Select, Skeleton } from "@mantine/core";
import { useEffect, useMemo, useState } from "react";
import { globalStore } from "@/mobx/rootStore";

let albionDataPromise = null;

function getAlbionData() {
	if (!albionDataPromise) {
		albionDataPromise = import("../../../data/items").then((m) => m.albionData);
	}
	return albionDataPromise;
}

export function ItemSelector({ label, itemId, onChange }) {
	const [albionData, setAlbionData] = useState(null);

	useEffect(() => {
		getAlbionData().then(setAlbionData);
	}, []);

	const itemList = useMemo(() => {
		if (!albionData) return [];

		const list = new Set();

		for (const _item of albionData) {
			let itemLabel = _item.LocalizedNames?.[globalStore.getItemLangKey()];

			if (!itemLabel) {
				continue;
			}

			const parts = _item.UniqueName.match(/T([0-9])[^@]*@?([0-9])?/);

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

			itemLabel = `${prefix}${itemLabel}`;

			list.add({
				value: _item.UniqueName,
				label: itemLabel,
			});
		}

		return [...list];
	}, [albionData, globalStore.language]);

	if (!albionData) {
		return <Skeleton height={36} width={200} />;
	}

	return (
		<Select
			label={label}
			placeholder="Pick value"
			data={itemList}
			value={itemId}
			limit={24}
			onChange={(value) => onChange({ id: value })}
			searchable
		/>
	);
}
