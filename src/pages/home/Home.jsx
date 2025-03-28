import { globalStore } from "@/mobx/rootStore";
import * as m from "@/paraglide/messages.js";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	ActionIcon,
	Anchor,
	Avatar,
	Button,
	Card,
	Center,
	Code,
	Divider,
	Group,
	Image,
	ScrollArea,
	SimpleGrid,
	Stack,
	Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
	IconArrowDown,
	IconArrowLeft,
	IconArrowRight,
	IconArrowUp,
	IconBrandGithub,
	IconBrandReddit,
	IconCheck,
	IconCloudDownload,
	IconCopy,
	IconPlus,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import dame from "dame";
import { observer } from "mobx-react-lite";
import { useReducer, useState } from "react";
import { locations } from "../../data/locations";
import classes from "./Home.module.css";
import { ItemRow } from "./partials/ItemRow";
import { LanguageSelector } from "./partials/LanguageSelector";
import LocationsSelector from "./partials/LocationsSelector";
import RowSummary from "./partials/RowSummary";
import { ServerSelector } from "./partials/ServerSelector";
import { TaxSelector } from "./partials/TaxSelector";
import TierSelector from "./partials/TierSelector";
import { getRandomWallpaper } from "./utils/getRandomWallpaper";
import { generateUid } from "./utils/group/generateUid";
import { getGroupItemIds } from "./utils/group/getGroupItemIds";
import { getGroupParts } from "./utils/group/getGroupParts";
import { setGroupItemsPriceWithCity } from "./utils/group/setGroupIngredientsWithCity";
import { buildAndFindItemId } from "./utils/item/buildAndFindItemid";
import { buildItemId } from "./utils/item/buildItemId";
import { getItemIdComponents } from "./utils/item/getItemIdComponents";

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
		this.modifierPercentage = 0;
	}
}

class ItemGroup {
	constructor({ name }) {
		this.id = generateUid();
		this.name = name ?? "";
		this.items = [
			new ItemGroupElement({ type: "product" }),
			new ItemGroupElement({ type: "ingredient" }),
		];
		this.tax = 0;
	}
}

/**
 * Finds the index of a group in the state array by its ID.
 * @param {Object} groups `state.groups`
 * @param {string} id
 * @return {{
 * 	index: number,
 * 	group: ItemGroup
 * }}
 */
function getGroupIndexById(groups, id) {
	const index = groups.findIndex((_group) => _group.id === id);
	if (index === -1)
		return {
			index: -1,
			group: null,
		};

	return {
		index: index,
		group: groups[index],
	};
}

function reducer(state, action) {
	if (action.type === "ADD_GROUP") {
		const newGroups = [...state.groups, new ItemGroup({})];

		return {
			...state,
			groups: newGroups,
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
	if (action.type === "MOVE_GROUP") {
		// params:
		//  - action.groupId
		//  - action.direction (1, -1)

		const newGroups = [...state.groups];

		// Get the group index using id
		const index = newGroups.findIndex((_group) => _group.id === action.groupId);
		if (index === -1) return state;

		const group = newGroups[index];

		// Check if the group can be moved
		if (action.direction === 1 && index === newGroups.length - 1) return state;
		if (action.direction === -1 && index === 0) return state;

		// Move the group
		newGroups.splice(index, 1);
		newGroups.splice(index + action.direction, 0, group);

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
	if (action.type === "DUPLICATE_GROUP") {
		const newGroups = [...state.groups];

		const { index } = getGroupIndexById(newGroups, action.id);
		if (index === -1) return state;

		const clonedGroup = JSON.parse(JSON.stringify(newGroups[index]));
		clonedGroup.name = `${clonedGroup.name}_copy`;
		clonedGroup.id = generateUid();

		// Insert the same group after the index
		newGroups.splice(index + 1, 0, clonedGroup);

		return {
			...state,
			groups: newGroups,
		};
	}
	if (action.type === "CHANGE_GROUP_TIER") {
		// action.type
		// action.groupId
		// action.tierLevelChange
		// action.enchantLevelChange

		const newGroups = [...state.groups];
		const { index, group } = getGroupIndexById(newGroups, action.groupId);

		const tierChange = action?.tierLevelChange ?? 0;
		const enchantChange = action?.enchantLevelChange ?? 0;

		// Iterate each group and find if the new tier is valid
		for (const _item of group.items) {
			if (!["product", "ingredient"].includes(_item.type)) {
				continue;
			}

			const { item, itemId } = buildAndFindItemId({
				itemId: _item.id,
				tierChange,
				enchantChange,
			});

			if (item) {
				_item.id = itemId;
				_item.price = 0;
				_item.priceData = [];
			}
		}

		// Set the group
		newGroups[index] = group;

		return {
			...state,
			groups: newGroups,
		};
	}

	if (action.type === "ADD_GROUP_ITEM") {
		// params:
		//  - action.groupId
		//  - action.items?
		//  - action.cleanIngredients?

		const newGroups = [...state.groups];

		// Get the group index
		const index = newGroups.findIndex((_group) => _group.id === action.groupId);
		if (index === -1) return state;

		const items = action?.items;
		const isMultipleItems = Array.isArray(items);

		if (action?.cleanIngredients === true) {
			newGroups[index].items = newGroups[index].items.filter((_item) => {
				return _item.type !== "ingredient";
			});
		}

		// Add only one empty item
		if (!items) {
			newGroups[index].items.push(new ItemGroupElement({ type: "ingredient" }));
		} else {
			// Add multiple items
			if (isMultipleItems) {
				for (const _item of items) {
					newGroups[index].items.push({
						..._item,
						uid: generateUid(),
						type: "ingredient",
					});
				}
				// Add one item
			} else {
				newGroups[index].items.push({
					...items,
					uid: generateUid(),
					type: "ingredient",
				});
			}
		}

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
		const itemIndex = group.items.findIndex((_item) => _item.uid === action.itemUid);
		if (!itemIndex === -1) return state;

		const foundItem = group.items[itemIndex];

		// Save old quantity
		const oldQuantity = foundItem?.quantity;

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
	groups: [new ItemGroup({})],
};

function saveToLocalStorage(state) {
	const str = JSON.stringify(state);
	if (str) {
		localStorage.setItem("state", str);
		console.log("state saved");
	}
}

function loadFromLocalStorage() {
	const str = localStorage.getItem("state");
	if (!str) return null;
	try {
		const parsed = JSON.parse(str);
		console.log("state loaded");
		return parsed;
	} catch (err) {
		return null;
	}
}

export default observer(function Home() {
	const [state, dispatch] = useReducer(reducer, null, () => {
		const loadedState = loadFromLocalStorage();
		return loadedState || initialState;
	});
	const [loadingGroup, setLoadingGroup] = useState(null);
	const [wallpaper] = useState(() => getRandomWallpaper());

	const isSingleColumn = useMediaQuery("(width <= 1407px)");

	const [parent] = useAutoAnimate();

	function dispatchWithSave(...args) {
		saveToLocalStorage(state);
		dispatch(...args);
	}

	async function getPrices({ groupId }) {
		setLoadingGroup(groupId);

		const group = state.groups.find((_group) => _group.id === groupId);
		const itemIdListStr = getGroupItemIds({ group });

		const url = new URL(
			`https://${globalStore.server}.albion-online-data.com/api/v2/stats/prices/${itemIdListStr}`,
		);
		url.searchParams.append("locations", locations.join(","));

		const { isError, response } = await dame.get(url.toString());

		setLoadingGroup(null);

		if (isError) {
			return;
		}

		dispatchWithSave({
			type: "SET_GROUP_PRICE_DATA",
			groupId: groupId,
			payload: response,
		});
	}

	async function getIngredients({ groupId }) {
		setLoadingGroup(groupId);

		const group = state.groups.find((_group) => _group.id === groupId);
		const { product } = getGroupParts(group);

		const productId = product?.id;

		const { id, tier, enchant } = getItemIdComponents(productId);
		console.log({ id, tier, enchant });

		const url = `https://gameinfo.albiononline.com/api/gameinfo/items/${id}/data`;

		// const itemData = await findItemById(productId);
		const { response: itemData } = await dame.get(`https://corsproxy.io/?url=${url}`, {
			timeout: 6000,
		});

		setLoadingGroup(null);

		const newItemsToAdd = [];

		let craftingRequirements = itemData?.craftingRequirements ?? {};
		let enchantZeroNotFound = false;

		if (Object.keys(craftingRequirements).length === 0) {
			let enchantData = itemData?.enchantments?.enchantments[enchant];

			if (!enchantData) {
				enchantData = itemData?.enchantments?.enchantments[enchant + 1];
				enchantZeroNotFound = true;
			}

			craftingRequirements = enchantData?.craftingRequirements ?? {};
		}

		/** @type {Array<{uniqueName: string, count: number}>} */
		let craftResourceList = craftingRequirements?.craftResourceList ?? [];

		if (enchantZeroNotFound) {
			// Temporary fix when enchant 0 is not found, enchant 1 is used instead and only the first resource is used
			craftResourceList = [craftResourceList[0]];
		}

		/*
			ore -> metalbar
				TX_METALBAR + TX_ORE
			
			hide -> leather
				TX_LEATHER + TX_HIDE
				
			cloth -> fiber
				TX_FIBER + TX_CLOTH
			
			rock -> stoneblock
				TX_STONEBLOCK + TX_ROCK
			
			wood -> planks
			    TX_PLANKS + TX_WOOD
			
		*/

		if (["potion", "cooked"].includes(itemData?.categoryId)) {
			if (enchant === 0) {
				craftResourceList.pop();
			}
		}

		if (
			["metalbar", "leather", "fiber", "stoneblock", "planks"].includes(itemData?.categoryId)
		) {
			const refinedToRaw = {
				metalbar: "ore",
				leather: "hide",
				fiber: "cloth",
				stoneblock: "rock",
				planks: "wood",
			};

			const craftTierQuantity = {
				2: {
					refined: 0,
					raw: 1,
				},
				3: {
					refined: 1,
					raw: 2,
				},
				4: {
					refined: 1,
					raw: 2,
				},
				5: {
					refined: 1,
					raw: 3,
				},
				6: {
					refined: 1,
					raw: 4,
				},
				7: {
					refined: 1,
					raw: 5,
				},
				8: {
					refined: 1,
					raw: 5,
				},
			};

			const refinedCount = craftTierQuantity[tier].refined;
			const rawCount = craftTierQuantity[tier].raw;

			if (refinedCount) {
				const previousRefinedComponent = buildAndFindItemId({
					itemId: productId,
					tierChange: -1,
				});

				craftResourceList.push({
					uniqueName: previousRefinedComponent.itemId,
					count: 1,
				});
			}

			if (rawCount) {
				const rawItemId = `T${tier}_${refinedToRaw[itemData?.categoryId].toUpperCase()}`;

				const rawComponent = buildAndFindItemId({
					itemId: rawItemId,
				});

				craftResourceList.push({
					uniqueName: rawComponent.itemId,
					count: rawCount,
				});
			}
		}

		if (craftResourceList.length === 0) {
			notifications.show({
				color: "red",
				icon: <IconX />,
				title: "Item ingredients could not be found",
				message:
					"This tool uses Albion Online API to fetch the required items, but nothing was found.",
				autoClose: 8000,
			});

			return;
		}
		notifications.show({
			color: "green",
			icon: <IconCheck />,
			title: "Item ingredients found",
		});

		for (const _resource of craftResourceList) {
			const uniqueName = _resource.uniqueName;

			const { tier, enchant } = getItemIdComponents(uniqueName);

			const itemId = buildItemId({
				id: uniqueName,
				tier,
				enchant,
				appendEnchantSymbol: true,
			});

			newItemsToAdd.push({
				id: itemId,
				quantity: _resource.count,
			});
		}

		dispatchWithSave({
			type: "ADD_GROUP_ITEM",
			groupId: groupId,
			items: newItemsToAdd,
			cleanIngredients: true,
		});
	}

	// This will force re-render
	const language = globalStore.language;

	const isDebugMode = globalStore.debugMode;

	return (
		<div className={classes.mainContainer}>
			<Image className={classes.image} src={wallpaper} />

			<Group my="xs" mx="md" justify="space-between">
				<Group>
					<LanguageSelector />
					<ServerSelector />
				</Group>

				<Group align="center">
					<Button
						variant={isDebugMode ? "filled" : "outline"}
						onClick={() => {
							globalStore.debugMode = !isDebugMode;
						}}
					>
						{isDebugMode ? "Debug mode enabled" : "Debug mode"}
					</Button>

					<Anchor href="https://github.com/Icaruk/albion-profit" target="_blank">
						<Avatar variant="light">
							<IconBrandGithub size={32} color="var(--mantine-color-dark-9)" />
						</Avatar>
					</Anchor>

					<Anchor
						href="https://www.reddit.com/r/albiononline/comments/1co93rm/i_created_a_tool_to_calculate_profits/"
						target="_blank"
					>
						<Avatar variant="light">
							<IconBrandReddit size={32} color="var(--mantine-color-orange-7)" />
						</Avatar>
					</Anchor>
				</Group>
			</Group>

			<ScrollArea w="100%">
				<Center>
					<SimpleGrid p="md" ref={parent} cols={{ base: 1, xl: 2 }}>
						{state?.groups?.map((_group, _idx) => {
							const group = state.groups.find((_g) => _g.id === _group.id);
							const { product, ingredients } = getGroupParts(group);

							return (
								<Card key={_group.id}>
									<Stack gap="md">
										<Group justify="space-between">
											<Text size="xs" c="dimmed">
												{m.group()} {_idx + 1}
											</Text>

											<Group>
												<Group gap={0}>
													<ActionIcon
														variant="subtle"
														onClick={() =>
															dispatchWithSave({
																type: "MOVE_GROUP",
																groupId: _group.id,
																direction: 1,
															})
														}
													>
														{isSingleColumn ? (
															<IconArrowDown />
														) : (
															<IconArrowRight />
														)}
													</ActionIcon>

													<ActionIcon
														variant="subtle"
														onClick={() =>
															dispatchWithSave({
																type: "MOVE_GROUP",
																groupId: _group.id,
																direction: -1,
															})
														}
													>
														{isSingleColumn ? (
															<IconArrowUp />
														) : (
															<IconArrowLeft />
														)}
													</ActionIcon>
												</Group>

												<ActionIcon
													variant="subtle"
													onClick={() =>
														dispatchWithSave({
															type: "DUPLICATE_GROUP",
															id: _group.id,
														})
													}
												>
													<IconCopy />
												</ActionIcon>

												<ActionIcon
													color="red"
													variant="subtle"
													onClick={() =>
														dispatchWithSave({
															type: "DELETE_GROUP",
															id: _group.id,
														})
													}
												>
													<IconTrash />
												</ActionIcon>
											</Group>
										</Group>

										<LocationsSelector
											location={group.location}
											onChange={({ location }) => {
												dispatchWithSave({
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
												label={m.result()}
												item={product}
												onChange={(_payload) => {
													dispatchWithSave({
														type: "EDIT_GROUP_ITEM",
														groupId: _group.id,
														itemUid: _payload.uid,
														payload: _payload,
														isProduct: true,
													});
												}}
												onGetIngredients={() => {
													getIngredients({ groupId: _group.id });
												}}
												isHighlighted
											/>

											<Group align="center">
												<TierSelector
													onTierChange={(tier) => {
														dispatchWithSave({
															type: "CHANGE_GROUP_TIER",
															groupId: _group.id,
															tierLevelChange: tier,
														});
													}}
													onEnchantChange={(enchant) => {
														dispatchWithSave({
															type: "CHANGE_GROUP_TIER",
															groupId: _group.id,
															enchantLevelChange: enchant,
														});
													}}
												/>

												<TaxSelector
													tax={group.tax}
													onChange={(tax) => {
														dispatchWithSave({
															type: "EDIT_GROUP",
															groupId: _group.id,
															payload: {
																tax,
															},
														});
													}}
												/>
											</Group>

											<Divider
												my="xs"
												label={m.components()}
												labelPosition="center"
											/>

											<Stack gap="2">
												{ingredients.map((_ingredient, _idx) => {
													return (
														<ItemRow
															key={_ingredient.uid}
															label={`Component ${_idx + 1}`}
															item={_ingredient}
															onDelete={() => {
																dispatchWithSave({
																	type: "DELETE_GROUP_ITEM",
																	groupId: _group.id,
																	itemUid: _ingredient.uid,
																});
															}}
															onChange={(_payload) => {
																dispatchWithSave({
																	type: "EDIT_GROUP_ITEM",
																	groupId: _group.id,
																	itemUid: _payload.uid,
																	payload: _payload,
																});
															}}
															// onGetIngredients={() =>
															// 	getIngredients({
															// 		groupId: _group.id,
															// 	})
															// }
														/>
													);
												})}
											</Stack>

											<Group grow>
												<Button
													leftSection={<IconPlus />}
													variant="light"
													onClick={() => {
														dispatchWithSave({
															type: "ADD_GROUP_ITEM",
															groupId: _group.id,
														});
													}}
												>
													{m.addComponent()}
												</Button>

												<Button
													rightSection={<IconCloudDownload />}
													variant="light"
													onClick={() => {
														getPrices({ groupId: _group.id });
													}}
													loading={loadingGroup === _group.id}
												>
													{m.fetchPrices()}
												</Button>
											</Group>

											<Group
												justify={isDebugMode ? "space-between" : "flex-end"}
												gap="xl"
											>
												{isDebugMode && (
													<Code block>
														{JSON.stringify(
															{
																productId: product?.id,
																ingredientIds: ingredients.map(
																	(i) => i.id,
																),
															},
															null,
															2,
														)}
													</Code>
												)}

												<RowSummary group={group} />
											</Group>
										</Stack>
									</Stack>
								</Card>
							);
						})}

						<Button
							leftSection={<IconPlus />}
							onClick={() => dispatchWithSave({ type: "ADD_GROUP" })}
						>
							{m.addGroup()}
						</Button>
					</SimpleGrid>
				</Center>
			</ScrollArea>
		</div>
	);
});
