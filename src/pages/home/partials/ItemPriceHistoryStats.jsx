import { LineChart } from "@mantine/charts";
import { Badge, Group, Stack, Table, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useMemo } from "react";
import { globalStore } from "@/mobx/rootStore";
// biome-ignore lint/correctness/noUnusedImports: used only in jsdoc
import { GroupStore } from "@/mobx/stores/groupStore";
import { formatHundeds } from "@/utils/number/formatHundeds";

/**
 * @typedef Props
 * @property {typeof GroupStore} group
 */

/**
 * @param {Props} Props.
 */

export const ItemPriceHistoryStats = ({ group }) => {
	// listen language changes
	globalStore.language;

	/** @type {(import("@/mobx/stores/groupStore").PriceHistoryData)[]} */
	const priceHistoryData = group?.priceHistoryData ?? [];

	const tempLocation = group?.location;
	const locationData = priceHistoryData.filter((_item) => _item.location === tempLocation);

	const timeSeries = [];
	const chartDataByQuality = {};

	for (const _infoForQuality of locationData) {
		const { data, quality } = _infoForQuality;

		for (const _timeSerie of data) {
			timeSeries.push({
				itemCount: _timeSerie.item_count ?? "",
				avgPrice: _timeSerie.avg_price ?? 0,
				timestamp: _timeSerie.timestamp ?? 0,
				date: dayjs(_timeSerie.timestamp).format("DD-MM-YY HH:mm"),
			});

			const suffix = `_${quality}`;

			if (!chartDataByQuality[_timeSerie.timestamp]) {
				chartDataByQuality[_timeSerie.timestamp] = {
					date: dayjs(_timeSerie.timestamp).format("DD-MM-YY HH:mm"),
				};
			}

			chartDataByQuality[_timeSerie.timestamp][`itemCount${suffix}`] =
				_timeSerie.item_count ?? "";
			chartDataByQuality[_timeSerie.timestamp][`avgPrice${suffix}`] =
				_timeSerie.avg_price ?? "";
			chartDataByQuality[_timeSerie.timestamp][`timestamp${suffix}`] =
				_timeSerie.timestamp ?? "";
		}
	}

	const chartData = Object.values(chartDataByQuality);

	const { totalSoldCount, daysSinceFirstSale, averageSoldPerDay } = useMemo(() => {
		let totalSoldCount = 0;

		for (const _chartItem of timeSeries) {
			totalSoldCount += _chartItem.itemCount;
		}

		const sortedDates = [...timeSeries.map((item) => item.timestamp)].sort();
		const daysSinceFirstSale = Math.abs(dayjs(sortedDates[0]).diff(dayjs(), "days"));
		const averageSoldPerDay = +(totalSoldCount / daysSinceFirstSale).toFixed(2);

		return {
			totalSoldCount,
			daysSinceFirstSale,
			averageSoldPerDay,
		};
	}, [timeSeries]);

	if (!priceHistoryData) {
		return null;
	}

	return (
		<Stack gap="lg" justify="center">
			<Group justify="center">
				<Text size="lg" fw="bold">
					Item data for the last {daysSinceFirstSale} days
				</Text>
			</Group>

			<Table variant="vertical" layout="fixed" withTableBorder withColumnBorders>
				<Table.Tbody>
					<Table.Tr>
						<Table.Th>
							<Text ta="right">Items sold:</Text>
						</Table.Th>
						<Table.Td>
							<Text component="span" c="green" fw="bold">
								{formatHundeds(totalSoldCount)}
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th>
							<Text ta="right">Average sold per day:</Text>
						</Table.Th>
						<Table.Td>
							<Text component="span" c="green" fw="bold">
								{formatHundeds(averageSoldPerDay)}
							</Text>
						</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>

			<Stack align="center" w="100%">
				<Stack w="100%">
					<Text size="lg" ta="center" c="indigo">
						Items sold in the last {daysSinceFirstSale} days:
					</Text>

					<LineChart
						h={200}
						data={chartData}
						dataKey="date"
						gridAxis="xy"
						withLegend
						series={[
							{ name: "itemCount_1", color: "white", label: "Normal" },
							{ name: "itemCount_2", color: "green.5", label: "Good" },
							{ name: "itemCount_3", color: "blue.5", label: "Outstanding" },
							{ name: "itemCount_4", color: "violet.4", label: "Excellent" },
							{ name: "itemCount_5", color: "yellow.6", label: "Masterpiece" },
						]}
						curveType="linear"
						withDots={false}
						withXAxis={false}
						valueFormatter={(value) => {
							return formatHundeds(value);
						}}
					/>
				</Stack>

				<Stack w="100%">
					<Text size="lg" ta="center" c="yellow">
						Average sell order price in the last {daysSinceFirstSale} days:
					</Text>

					<LineChart
						h={200}
						data={chartData}
						dataKey="date"
						gridAxis="xy"
						withLegend
						series={[
							{ name: "avgPrice_1", color: "white", label: "Normal" },
							{ name: "avgPrice_2", color: "green.5", label: "Good" },
							{ name: "avgPrice_3", color: "blue.5", label: "Outstanding" },
							{ name: "avgPrice_4", color: "violet.4", label: "Excellent" },
							{ name: "avgPrice_5", color: "yellow.6", label: "Masterpiece" },
						]}
						curveType="linear"
						withDots={false}
						withXAxis={false}
						valueFormatter={(value) => {
							return formatHundeds(value);
						}}
					/>
				</Stack>
			</Stack>
		</Stack>
	);
};
