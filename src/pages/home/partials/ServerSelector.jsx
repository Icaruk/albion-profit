import { globalStore } from "@/mobx/rootStore";
import { Select } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

export const ServerSelector = observer(() => {
	return (
		<Select
			w={120}
			value={globalStore.server}
			data={[
				{ label: "America", value: "west" },
				{ label: "Asia", value: "east" },
				{ label: "Europe", value: "europe" },
			]}
			onChange={(_val) => {
				globalStore.setServer(_val);
			}}
			leftSection={<IconMapPin />}
		/>
	);
});
