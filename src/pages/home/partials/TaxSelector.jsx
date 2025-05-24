import * as m from "@/paraglide/messages.js";
import { Select } from "@mantine/core";
import { IconReceiptTax } from "@tabler/icons-react";

export const TAXES = {
	noTax: 0,
	sellWithPremium: 4,
	sellWithoutPremium: 8,
	sellOrderWithPremium: 6.5,
	sellOrderWithoutPremium: 10.5,
};

/**
 * @typedef {typeof TAXES} Taxes
 */

/**
 * @typedef {typeof TAXES[keyof typeof TAXES]} TaxesValue
 */

/**
 * @param {Object} props
 * @param {TaxesValue} props.tax
 * @param {(tax: TaxesValue) => void} [props.onChange=()=>{}]
 */
export function TaxSelector({ tax, onChange = () => {} }) {
	return (
		<Select
			placeholder="Tax %"
			value={String(tax)}
			onChange={(val) => onChange(+val)}
			data={[
				{ value: TAXES.noTax.toString(), label: m.noTax() },
				{
					value: TAXES.sellWithPremium.toString(),
					label: m.sellWithPremium({ num: TAXES.sellWithPremium }),
				},
				{
					value: TAXES.sellWithoutPremium.toString(),
					label: m.sellWithoutPremium({ num: TAXES.sellWithoutPremium }),
				},
				{
					value: TAXES.sellOrderWithPremium.toString(),
					label: m.sellOrderWithPremium({ num: TAXES.sellOrderWithPremium }),
				},
				{
					value: TAXES.sellOrderWithoutPremium.toString(),
					label: m.sellOrderWithoutPremium({ num: TAXES.sellOrderWithoutPremium }),
				},
			]}
			leftSection={<IconReceiptTax />}
		/>
	);
}
