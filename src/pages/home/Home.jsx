import {
	ActionIcon,
	Button,
	Card,
	Center,
	Group,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { IconCloudDownload, IconPlus, IconTrash } from "@tabler/icons-react";
import { useReducer } from "react";
import ItemRow from "./partials/ItemRow";
import RowSummary from "./partials/RowSummary";
import { generateUid } from "./utils/generateUid";
import { getGroupParts } from "./utils/getGroupParts";
import dame from "dame";
import { locations } from "../../data/locations";
import LocationsSelector from "./partials/LocationsSelector";
import { setGroupItemsPriceWithCity } from "./utils/setGroupIngredientsWithCity";
import { getGroupItemIds } from "./utils/getGroupItemIds";

class ItemGroupElement {
	constructor({ type }) {
		this.type = type;
		this.uid = generateUid();
		this.id = "";
		this.label = "";
		this.quantity = 1;
		this.price = 0;
		this.location = "";
		this.priceData = [];
	}
}

class ItemGroup {
	constructor({ id }) {
		this.id = id;
		this.items = [
			new ItemGroupElement({ type: "product" }),
			new ItemGroupElement({ type: "ingredient" }),
		];
	}
}

function reducer(state, action) {
	if (action.type === "ADD_GROUP") {
		// Get last group id and inc 1
		const lastGroupId = state.groups[state.groups.length - 1]?.id ?? 0;
		const newGroupId = lastGroupId + 1;

		return {
			...state,
			groups: [...state.groups, new ItemGroup({ id: newGroupId })],
		};
	}
	if (action.type === "EDIT_GROUP") {
		// params:
		//  - action.groupId
		//  - action.payload

		const newGroups = [...state.groups];

		// Get the group index using id
		const index = newGroups.findIndex((_group) => _group.id === action.groupId);
		if (index === -1) return state;

		const group = newGroups[index];

		// Merge
		const newGroup = {
			...group,
			...action.payload,
		};

		// Set the group
		newGroups[index] = newGroup;

		// Check if location has been changed
		if (newGroup.location !== group.location) {
			// Set group ingredients price
			const newGroupWithData = setGroupItemsPriceWithCity({
				group: newGroups[index],
				location: newGroup.location,
			});
			newGroups[index] = newGroupWithData;
		}

		return {
			...state,
			groups: newGroups,
		};
	}
	if (action.type === "DELETE_GROUP") {
		const newGroups = [...state.groups];

		// Get the group index using id
		const index = newGroups.findIndex((_group) => _group.id === action.id);
		if (index === -1) return state;

		// Remove the group
		newGroups.splice(index, 1);

		return {
			...state,
			groups: newGroups,
		};
	}

	if (action.type === "ADD_GROUP_ITEM") {
		// params:
		//  - action.groupId

		const newGroups = [...state.groups];

		// Get the group index
		const index = newGroups.findIndex((_group) => _group.id === action.groupId);
		if (index === -1) return state;

		// Add the item
		newGroups[index].items.push(new ItemGroupElement({ type: "ingredient" }));

		return {
			...state,
			groups: newGroups,
		};
	}
	if (action.type === "EDIT_GROUP_ITEM") {
		// params:
		//  - action.groupId
		//  - action.itemUid
		//  - action.payload
		//  - action.isProduct

		const newGroups = [...state.groups];

		// Get the group index
		const index = newGroups.findIndex((_group) => _group.id === action.groupId);
		if (index === -1) return state;

		const group = newGroups[index];

		// Get the item index
		const itemIndex = group.items.findIndex(
			(_item) => _item.uid === action.itemUid,
		);
		if (!itemIndex === -1) return state;

		const foundItem = group.items[itemIndex];

		// Save old quantity
		const oldQuantity = foundItem.quantity;

		// Merge
		const newItem = { ...foundItem, ...action.payload };

		// Set the item
		newGroups[index].items[itemIndex] = newItem;

		// Check if we need to increment other items quantity
		if (action.isProduct) {
			// Calculate increment multiplier between oldQuantity and newItem.quantity

			// old 1 ---> 1
			// new 2 --> X
			// mult = 2 * 1 / 1 = 2

			// old 10 ---> 1
			// new 12 --> X
			// mult = 12 * 1 / 10 = 1.2

			const incrementMultiplier = (newItem.quantity || 1) / (oldQuantity || 1);

			// Iterate all ingredients
			const { ingredients } = getGroupParts(group);

			for (const _ingredient of ingredients) {
				_ingredient.quantity = _ingredient.quantity * incrementMultiplier;
			}
		}

		return {
			...state,
			groups: newGroups,
		};
	}
	if (action.type === "DELETE_GROUP_ITEM") {
		// params:
		//  - action.groupId
		//  - action.itemUid

		const newGroups = [...state.groups];

		// Get the group index
		const index = newGroups.findIndex((_group) => _group.id === action.groupId);
		if (index === -1) return state;

		let group = newGroups[index];

		// Get the item index
		const foundItem = group.items.find((_item) => _item.uid === action.itemUid);
		if (foundItem === -1) return state;

		// Remove the item
		group = group.items.filter((_item) => _item.uid !== action.itemUid);
		newGroups[index].items = group;

		return {
			...state,
			groups: newGroups,
		};
	}

	if (action.type === "SET_GROUP_PRICE_DATA") {
		// params:
		//  - action.groupId
		//  - action.payload

		/**
		 * @type {Array<{
		 * city: string,
		 * item_id: string,
		 * quality: number,
		 * sell_price_max: number,
		 * sell_price_min: number,
		 * }>}
		 */
		const payload = action.payload;

		const newGroups = [...state.groups];

		// Get the group index
		const index = newGroups.findIndex((_group) => _group.id === action.groupId);
		if (index === -1) return state;

		const group = newGroups[index];

		// Set price data
		newGroups[index].priceData = payload;

		if (!group.location) {
			newGroups[index].location = locations[0];
		}

		// Set group ingredients price
		const newGroupWithData = setGroupItemsPriceWithCity({
			group: newGroups[index],
			location: group?.location,
		});
		newGroups[index] = newGroupWithData;

		return {
			...state,
			groups: newGroups,
		};
	}

	return state;
}

const initialState = {
	groups: [new ItemGroup({ id: 1 })],
};

export default function Home() {
	const [state, dispatch] = useReducer(reducer, initialState);

	async function getPrices({ groupId }) {
		const group = state.groups.find((_group) => _group.id === groupId);
		const itemIdListStr = getGroupItemIds({ group });

		const url = new URL(
			`https://west.albion-online-data.com/api/v2/stats/prices/${itemIdListStr}`,
		);
		url.searchParams.append("locations", locations.join(","));

		const { isError, response } = await dame.get(url.toString());
		if (isError) {
			return;
		}

		dispatch({
			type: "SET_GROUP_PRICE_DATA",
			groupId: groupId,
			payload: response,
		});
	}

	console.log("state", state);

	return (
		<Center>
			<Stack p="md" gap="md">
				{state?.groups?.map((_group) => {
					const group = state.groups.find((_g) => _g.id === _group.id);
					const { product, ingredients } = getGroupParts(group);

					return (
						<Card key={_group.id}>
							<Stack gap="md">
								<Group justify="space-between">
									<Title order={3}>Grupo {_group.id}</Title>
									<ActionIcon
										color="red"
										variant="subtle"
										onClick={() =>
											dispatch({ type: "DELETE_GROUP", id: _group.id })
										}
									>
										<IconTrash />
									</ActionIcon>
								</Group>

								<LocationsSelector
									location={group.location}
									onChange={({ location }) => {
										dispatch({
											type: "EDIT_GROUP",
											groupId: _group.id,
											payload: {
												location,
											},
										});
									}}
								/>

								<Stack>
									<ItemRow
										label="Producto"
										id={product.id}
										uid={product.uid}
										quantity={product.quantity}
										price={product.price}
										onChange={(_payload) => {
											dispatch({
												type: "EDIT_GROUP_ITEM",
												groupId: _group.id,
												itemUid: _payload.uid,
												payload: _payload,
												isProduct: true,
											});
										}}
										isHighlighted
									/>

									<Stack gap="2">
										{ingredients.map((_ingredient, _idx) => {
											return (
												<ItemRow
													key={_ingredient.uid}
													label={`Ingrediente ${_idx + 1}`}
													id={_ingredient.id}
													uid={_ingredient.uid}
													quantity={_ingredient.quantity}
													price={_ingredient.price}
													onDelete={() => {
														dispatch({
															type: "DELETE_GROUP_ITEM",
															groupId: _group.id,
															itemUid: _ingredient.uid,
														});
													}}
													onChange={(_payload) => {
														dispatch({
															type: "EDIT_GROUP_ITEM",
															groupId: _group.id,
															itemUid: _payload.uid,
															payload: _payload,
														});
													}}
												/>
											);
										})}
									</Stack>

									<Group grow>
										<Button
											leftSection={<IconCloudDownload />}
											variant="light"
											onClick={() => {
												getPrices({ groupId: _group.id });
											}}
										>
											Cargar precios
										</Button>
										<Button
											leftSection={<IconPlus />}
											variant="light"
											onClick={() => {
												dispatch({
													type: "ADD_GROUP_ITEM",
													groupId: _group.id,
												});
											}}
										>
											Añadir ingrediente
										</Button>
									</Group>

									<RowSummary group={group} />
								</Stack>
							</Stack>
						</Card>
					);
				})}

				<Button
					leftSection={<IconPlus />}
					onClick={() => dispatch({ type: "ADD_GROUP" })}
				>
					Añadir grupo
				</Button>
			</Stack>
		</Center>
	);
}
