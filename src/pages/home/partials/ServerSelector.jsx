import { globalStore } from "@/mobx/rootStore";
import { Select } from "@mantine/core";
import { observer } from "mobx-react-lite";

export const ServerSelector = observer(() => {
	return (
		<Select
			w={100}
			value={globalStore.server}
			data={[
				{ label: "West", value: "west" },
				{ label: "East", value: "east" },
				{ label: "Europe", value: "europe" },
			]}
			onChange={(_val) => {
				globalStore.setServer(_val);
			}}
		/>
	);
});
