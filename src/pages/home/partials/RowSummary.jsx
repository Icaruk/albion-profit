import { Group, NumberFormatter, Space, Stack, Table, Text } from "@mantine/core";
import { getGroupParts } from "../utils/group/getGroupParts";

import { findItemById } from "@/data/scripts/items/utils/findItemById";
import { globalStore } from "@/mobx/rootStore";
import * as m from "@/paraglide/messages.js";
import { autorun } from "mobx";
import { observer } from "mobx-react-lite";
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
		const quantity = isPerUnit ? _ingredient.originalQuantity : _ingredient.quantity;

		const isArtifact = new RegExp(/arti|efact/gi).test(_ingredient.id);
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

			<Table variant="vertical" layout="fixed" withTableBorder>
				<Table.Tbody>
					<Table.Tr>
						<Table.Th w={160}>{m.resultValue()}:</Table.Th>
						<Table.Td>
							<Text ta="right" ff="monospace" size="sm">
								<NumberFormatter
									thousandSeparator="."
									decimalSeparator=","
									value={totalEarnings}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>{m.cost()}:</Table.Th>
						<Table.Td>
							<Text ta="right" ff="monospace" size="sm">
								<NumberFormatter
									thousandSeparator="."
									decimalSeparator=","
									value={totalCost}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>{m.earnings()}:</Table.Th>
						<Table.Td>
							<Text ta="right" ff="monospace" size="sm">
								<NumberFormatter
									thousandSeparator="."
									decimalSeparator=","
									value={totalProfit}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>% {m.earningsAfterTax()}:</Table.Th>
						<Table.Td>
							<Text
								ta="right"
								ff="monospace"
								size="sm"
								fw="bold"
								c={isGoodProfit ? "green.6" : "red.5"}
							>
								<NumberFormatter
									thousandSeparator="."
									decimalSeparator=","
									value={totalProfitAfterTax}
								/>
							</Text>
						</Table.Td>
					</Table.Tr>

					<Table.Tr>
						<Table.Th w={160}>% {m.earnings()}:</Table.Th>
						<Table.Td>
							<Text
								ta="right"
								ff="monospace"
								size="sm"
								c={isGoodProfit ? "green.6" : "red.5"}
							>
								<NumberFormatter
									thousandSeparator="."
									decimalSeparator=","
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
				<Table variant="vertical" layout="fixed" withTableBorder>
					<Table.Tbody>
						<Table.Tr>
							<Table.Th w={250}>{m.sellOrderPriceChangeCountBeforeLoss()}:</Table.Th>
							<Table.Td>
								<Text ta="right" ff="monospace" size="sm">
									<NumberFormatter
										thousandSeparator="."
										decimalSeparator=","
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
	return (
		<Stack gap={0} w="100%">
			<Group justify="center">
				<ItemSummary group={group} isPerUnit />
				<ItemSummary group={group} />
			</Group>
		</Stack>
	);
});
