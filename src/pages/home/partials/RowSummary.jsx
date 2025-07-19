import { Group, NumberFormatter, Space, Stack, Table, Text, useMatches } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { globalStore } from "@/mobx/rootStore";
import * as m from "@/paraglide/messages.js";
import { getGroupParts } from "../utils/group/getGroupParts";
import { isArtifactItem } from "../utils/item/isArtifactItem";
import { TAXES } from "./TaxSelector";

const ItemSummary = observer(({ group = {}, isPerUnit = false }) => {
	// listen language changes
	globalStore.language;

	let totalCost = 0;
	let totalProfit = 0;

	const { product, ingredients } = getGroupParts(group);

	const percentageToMultiplier = 1 - product?.returnRate / 100;

	const tax = group?.tax ?? 0;
	const taxMultiplier = 1 - tax / 100;

	const productQuantity = isPerUnit ? 1 : product?.quantity;

	const totalEarnings = Math.round(product?.price * productQuantity);

	for (const _ingredient of ingredients) {
		let quantity = _ingredient.quantity;

		if (isPerUnit) {
			if (_ingredient.quantity) {
				quantity = _ingredient.originalQuantity;
			}
		}

		const isArtifact = isArtifactItem(_ingredient.id);
		const multiplier = isArtifact ? 1 : percentageToMultiplier;

		totalCost += Math.round(_ingredient.price * quantity * multiplier);
	}

	totalCost = Math.round(totalCost);

	totalProfit = totalEarnings - totalCost;
	const totalProfitAfterTax = Math.round(totalProfit * taxMultiplier);

	const totalProfitPercentage = (totalProfitAfterTax / totalEarnings) * 100;

	const isGoodProfit = totalProfit >= 0;

	let priceChangeBeforeLossCount = 0;
	let REMAINING_SAFE_ITERATIONS = 1000;

	if (isPerUnit && isGoodProfit && tax > 0) {
		let remainingProfit = totalProfitAfterTax;
		const priceChangeCost = Math.max(totalProfit * 0.025, 1);

		while (remainingProfit > 0) {
			if (REMAINING_SAFE_ITERATIONS <= 0) {
				break;
			}

			REMAINING_SAFE_ITERATIONS--;
			remainingProfit = remainingProfit - priceChangeCost;
			priceChangeBeforeLossCount++;
		}
	}

	const isSellOrder = [TAXES.sellOrderWithPremium, TAXES.sellOrderWithoutPremium].includes(tax);

	return (
		<Stack gap={0} w={300}>
			<Text ta="center" size="md" fw="bold" c={isGoodProfit ? "green.6" : "red.5"}>
				{isPerUnit ? "Per unit" : `${productQuantity} units`}
			</Text>

			<Table variant="vertical" layout="fixed" withTableBorder withColumnBorders>
				<Table.Tbody>
					<Table.Tr>
						<Table.Th w={160}>
							<Text ta="right" size="sm">
								{m.resultValue()}:
							</Text>
						</Table.Th>
						<Table.Td>
							<Text ta="left" ff="monospace" size="sm">
								<NumberFormatter
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									value={totalEarnings}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>
							<Text ta="right" size="sm">
								{m.cost()}:
							</Text>
						</Table.Th>
						<Table.Td>
							<Text ta="left" ff="monospace" size="sm">
								<NumberFormatter
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									value={totalCost}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>
							<Text ta="right" size="sm">
								{m.earnings()}:
							</Text>
						</Table.Th>
						<Table.Td>
							<Text ta="left" ff="monospace" size="sm">
								<NumberFormatter
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									value={totalProfit}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>
							<Text ta="right" size="sm">
								% {m.earningsAfterTax()}:
							</Text>
						</Table.Th>
						<Table.Td>
							<Text
								ta="left"
								ff="monospace"
								size="sm"
								fw="bold"
								c={isGoodProfit ? "green.6" : "red.5"}
							>
								<NumberFormatter
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									value={totalProfitAfterTax}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>
							<Text ta="right" size="sm">
								% {m.earnings()}:
							</Text>
						</Table.Th>
						<Table.Td>
							<Text
								ta="left"
								ff="monospace"
								size="sm"
								c={isGoodProfit ? "green.6" : "red.5"}
							>
								<NumberFormatter
									thousandSeparator={globalStore.thousandSeparator}
									decimalSeparator={globalStore.decimalSeparator}
									value={totalProfitPercentage.toFixed(1)}
									suffix="%"
								/>
							</Text>
						</Table.Td>
					</Table.Tr>
				</Table.Tbody>
			</Table>

			<Space h="md" />

			{isPerUnit && isSellOrder && (
				<Table variant="vertical" layout="fixed" withTableBorder withColumnBorders>
					<Table.Tbody>
						<Table.Tr>
							<Table.Th w={250}>{m.sellOrderPriceChangeCountBeforeLoss()}:</Table.Th>
							<Table.Td>
								<Text ta="left" ff="monospace" size="sm">
									<NumberFormatter
										thousandSeparator={globalStore.thousandSeparator}
										decimalSeparator={globalStore.decimalSeparator}
										value={priceChangeBeforeLossCount}
									/>
								</Text>
							</Table.Td>
						</Table.Tr>
					</Table.Tbody>
				</Table>
			)}
		</Stack>
	);
});

export const RowSummary = observer(({ group }) => {
	const wrap = useMatches({
		base: "wrap",
		sm: "nowrap",
	});

	return (
		<Stack gap={0}>
			<Group justify="center" align="flex-start" wrap={wrap}>
				<ItemSummary group={group} isPerUnit />
				<ItemSummary group={group} />
			</Group>
		</Stack>
	);
});
