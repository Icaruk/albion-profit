import { Button, Group, Text } from "@mantine/core";
import { locations } from "../../../data/locations";
import { IconPlus } from "@tabler/icons-react";
import { IconMinus } from "@tabler/icons-react";

export default function TierSelector({
	onTierChange = () => {},
	onEnchantChange = () => {},
}) {
	return (
		<Group gap="xl">
			<Group gap="xs">
				<Button
					variant="subtle"
					size="compact-xs"
					onClick={() => onTierChange(-1)}
				>
					<IconMinus size={16} />
				</Button>
				<Text>Tier</Text>
				<Button
					variant="subtle"
					size="compact-xs"
					onClick={() => onTierChange(1)}
				>
					<IconPlus size={16} />
				</Button>
			</Group>

			{/* 			<Group gap="xs">
				<Button
					variant="subtle"
					size="compact-xs"
					onClick={() => onEnchantChange(-1)}
				>
					<IconMinus size={16} />
				</Button>
				<Text>Enchant</Text>
				<Button
					variant="subtle"
					size="compact-xs"
					onClick={() => onEnchantChange(1)}
				>
					<IconPlus size={16} />
				</Button>
			</Group> */}
		</Group>
	);
}
