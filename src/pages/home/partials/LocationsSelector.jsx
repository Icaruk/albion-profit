import { Button, Group } from "@mantine/core";
import { locations } from "../../../data/locations";

export default function LocationsSelector({
	location = "",
	onChange = () => {},
}) {
	return (
		<Group>
			{locations.map((_location) => {
				const isSelected = location === _location;

				return (
					<Button
						key={_location}
						size="xs"
						variant={isSelected ? "filled" : "default"}
						onClick={() => {
							onChange({
								location: _location,
							});
						}}
					>
						{_location}
					</Button>
				);
			})}
		</Group>
	);
}
