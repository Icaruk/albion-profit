import { Select } from "@mantine/core";

export function TaxSelector() {
	return (
		<Select
			label="Tax %"
			placeholder="Pick value"
			data={[
				{ value: "4", label: "4% (sell with premium)" },
				{ value: "8", label: "8% (sell without premium)" },
				{ value: "6.5", label: "6.5% (sell order with premium)" },
				{ value: "10.5", label: "10.5% (sell order without premium)" },
			]}
		/>
	);
}
