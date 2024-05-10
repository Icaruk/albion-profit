import { Select } from "@mantine/core";
import { IconReceiptTax } from "@tabler/icons-react";

export function TaxSelector({ tax, onChange = () => {} }) {
	return (
		<Select
			placeholder="Tax %"
			value={String(tax)}
			onChange={(val) => onChange(+val)}
			data={[
				{ value: "0", label: "No tax" },
				{ value: "4", label: "4% (sell with premium)" },
				{ value: "8", label: "8% (sell without premium)" },
				{ value: "6.5", label: "6.5% (sell order with premium)" },
				{ value: "10.5", label: "10.5% (sell order without premium)" },
			]}
			leftSection={<IconReceiptTax />}
		/>
	);
}
