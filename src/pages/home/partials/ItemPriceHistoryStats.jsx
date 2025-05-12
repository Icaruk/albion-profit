import { LineChart } from "@mantine/charts";
import { Group, Stack } from "@mantine/core";
import dayjs from "dayjs";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";

export const ItemPriceHistoryStats = observer(({ group }) => {
	console.log("group:", group);

	const priceHistoryData = group.priceHistoryData ?? [];

	const tempLocation = "Lymhurst";
	const locationData = priceHistoryData.filter((_item) => _item.location === tempLocation);

	autorun(() => {
		console.log("aaa", group);
	});

	const chartData = [];

	for (const _itemWithQuality of locationData) {
		const data = _itemWithQuality.data;

		for (const _a of data) {
			chartData.push({
				itemCount: _a.item_count ?? "",
				avgPrice: _a.avg_price ?? 0,
				timestamp: _a.timestamp ?? 0,
				date: dayjs(_a.timestamp).format("DD-MM-YY"),
			});
		}
	}

	return (
		<Stack>
			<LineChart
				h={200}
				data={chartData}
				dataKey="date"
				series={[{ name: "itemCount", color: "indigo.6" }]}
				curveType="linear"
			/>
		</Stack>
	);
});
