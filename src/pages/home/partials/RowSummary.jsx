import { Group, NumberFormatter, Stack, Text } from "@mantine/core";
import { getGroupParts } from "../utils/group/getGroupParts";

import * as m from "@/paraglide/messages.js";

export default function RowSummary({ group }) {
	let totalCost = 0;
	let totalProfit = 0;

	const { product, ingredients } = getGroupParts(group);

	const percentageToMultiplier = 1 + product?.modifierPercentage / 100;

	const totalEarnings = Math.round(product.price * product.quantity * percentageToMultiplier);

	for (const _ingredient of ingredients) {
		totalCost += _ingredient.price * _ingredient.quantity;
	}

	totalCost = Math.round(totalCost);

	totalProfit = totalEarnings - totalCost;
	const totalProfitPercentage = (totalProfit / totalEarnings) * 100;

	const isGoodProfit = totalProfit >= 0;

	return (
		<Stack gap={0}>
			<Group justify="flex-end">
				<Stack gap={0}>
					<Group justify="flex-end">
						<Text>{m.resultValue()}:</Text>
						<Text>
							<NumberFormatter
								thousandSeparator="."
								decimalSeparator=","
								value={totalEarnings}
							/>
						</Text>
					</Group>

					<Group justify="flex-end">
						<Text>{m.cost()}:</Text>
						<Text>
							<NumberFormatter
								thousandSeparator="."
								decimalSeparator=","
								value={totalCost}
							/>
						</Text>
					</Group>

					<Group justify="flex-end">
						<Text>{m.earnings()}:</Text>
						<Text>
							<NumberFormatter
								thousandSeparator="."
								decimalSeparator=","
								value={totalProfit}
							/>
						</Text>
					</Group>

					<Group justify="flex-end">
						<Text>% {m.earnings()}:</Text>
						<Text c={isGoodProfit ? "green" : "red"}>
							<NumberFormatter
								thousandSeparator="."
								decimalSeparator=","
								value={totalProfitPercentage.toFixed(1)}
								suffix="%"
							/>
						</Text>
					</Group>
				</Stack>
			</Group>
		</Stack>
	);
}
