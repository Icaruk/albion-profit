import { Select } from "@mantine/core";
import { IconReceiptTax } from "@tabler/icons-react";
import * as m from "@/paraglide/messages.js";

export function TaxSelector({ tax, onChange = () => {} }) {
	return (
		<Select
			placeholder="Tax %"
			value={String(tax)}
			onChange={(val) => onChange(+val)}
			data={[
				{ value: "0", label: m.noTax() },
				{ value: "4", label: m.sellWithPremium({ num: 4 }) },
				{ value: "8", label: m.sellWIthoutPremium({ num: 8 }) },
				{ value: "6.5", label: m.sellOrderWithPremium({ num: 6.5 }) },
				{ value: "10.5", label: m.sellOrderWithoutPremium({ num: 10.5 }) },
			]}
			leftSection={<IconReceiptTax />}
		/>
	);
}
