import {
	ActionIcon,
	Box,
	Button,
	Card,
	Center,
	Code,
	Divider,
	Group,
	ScrollArea,
	Skeleton,
	Stack,
	Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	IconArrowDown,
	IconArrowLeft,
	IconArrowRight,
	IconArrowUp,
	IconCheck,
	IconCloudDownload,
	IconCopy,
	IconHammer,
	IconPlus,
	IconShoppingCartPlus,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import dame from "dame";
import { toJS } from "mobx";
import { observer } from "mobx-react-lite";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { locations } from "@/data/locations";
import { findItemById } from "@/data/scripts/items/utils/findItemById";
import { globalStore } from "@/mobx/rootStore";
import { GroupStore } from "@/mobx/stores/groupStore";
import * as m from "@/paraglide/messages.js";
import { getGroupItemIdsForFetch } from "../utils/group/getGroupItemIdsForFetch";
import { getGroupParts } from "../utils/group/getGroupParts";
import { buildAndFindItemId } from "../utils/item/buildAndFindItemid";
import { buildItemId } from "../utils/item/buildItemId";
import { getItemIdComponents } from "../utils/item/getItemIdComponents";
import LocationsSelector from "./LocationsSelector";
import { ProductRow } from "./ProductRow";
import { RowSummary } from "./RowSummary";
import { TaxSelector } from "./TaxSelector";
import TierSelector from "./TierSelector";

const ItemPriceHistoryStats = lazy(() =>
	import("./ItemPriceHistoryStats").then((mod) => ({ default: mod.ItemPriceHistoryStats })),
);

const FISH_SAUCE_ITEM_IDS = new Set([
	"T1_FISHSAUCE_LEVEL1",
	"T1_FISHSAUCE_LEVEL2",
	"T1_FISHSAUCE_LEVEL3",
	"T1_FISH_FRESHWATER_ALL_COMMON",
	"T2_FISH_FRESHWATER_ALL_COMMON",
	"T3_FISH_FRESHWATER_ALL_COMMON",
	"T4_FISH_FRESHWATER_ALL_COMMON",
	"T5_FISH_FRESHWATER_ALL_COMMON",
	"T6_FISH_FRESHWATER_ALL_COMMON",
	"T7_FISH_FRESHWATER_ALL_COMMON",
	"T8_FISH_FRESHWATER_ALL_COMMON",
	"T1_FISH_SALTWATER_ALL_COMMON",
	"T2_FISH_SALTWATER_ALL_COMMON",
	"T3_FISH_SALTWATER_ALL_COMMON",
	"T4_FISH_SALTWATER_ALL_COMMON",
	"T5_FISH_SALTWATER_ALL_COMMON",
	"T6_FISH_SALTWATER_ALL_COMMON",
	"T7_FISH_SALTWATER_ALL_COMMON",
	"T8_FISH_SALTWATER_ALL_COMMON",
	"T3_FISH_FRESHWATER_FOREST_RARE",
	"T5_FISH_FRESHWATER_FOREST_RARE",
	"T7_FISH_FRESHWATER_FOREST_RARE",
	"T3_FISH_FRESHWATER_MOUNTAIN_RARE",
	"T5_FISH_FRESHWATER_MOUNTAIN_RARE",
	"T7_FISH_FRESHWATER_MOUNTAIN_RARE",
	"T3_FISH_FRESHWATER_HIGHLANDS_RARE",
	"T5_FISH_FRESHWATER_HIGHLANDS_RARE",
	"T7_FISH_FRESHWATER_HIGHLANDS_RARE",
	"T3_FISH_FRESHWATER_STEPPE_RARE",
	"T5_FISH_FRESHWATER_STEPPE_RARE",
	"T7_FISH_FRESHWATER_STEPPE_RARE",
	"T3_FISH_FRESHWATER_SWAMP_RARE",
	"T5_FISH_FRESHWATER_SWAMP_RARE",
	"T7_FISH_FRESHWATER_SWAMP_RARE",
	"T3_FISH_SALTWATER_ALL_RARE",
	"T5_FISH_SALTWATER_ALL_RARE",
	"T7_FISH_SALTWATER_ALL_RARE",
	"T3_FISH_FRESHWATER_AVALON_RARE",
	"T5_FISH_FRESHWATER_AVALON_RARE",
	"T7_FISH_FRESHWATER_AVALON_RARE",
]);

const ARCANE_EXTRACT_ITEM_IDS = new Set([
	"T1_ALCHEMY_EXTRACT_LEVEL1",
	"T1_ALCHEMY_EXTRACT_LEVEL2",
	"T1_ALCHEMY_EXTRACT_LEVEL3",
]);

/**
 * @param {Object} params
 * @param {[]} params.ingredients
 * @param {GroupStore} params.groupStore
 * @param {(params: any) => void} params.handleOnChange
 * @param {boolean} params.bindQuantity
 */
function ComponentList({
	ingredients,
	groupStore,
	handleOnChange,
	bindQuantity = false,
	hasFetchedPrices = false,
}) {
	return (
		<Stack gap="2">
			{ingredients.map((_ingredient, _idx) => {
				return (
					<ProductRow
						key={_ingredient.uid}
						label={`Component ${_idx + 1}`}
						item={_ingredient}
						onDelete={() => {
							groupStore.deleteGroupItem({
								itemUid: _ingredient.uid,
							});
							handleOnChange();
						}}
						onShoppingListClick={(currValue) => {
							groupStore.editGroupItem({
								itemUid: currValue.uid,
								payload: {
									isInShoppingList: !currValue.isInShoppingList,
								},
							});
							handleOnChange();
						}}
						onChange={(_payload) => {
							groupStore.editGroupItem({
								itemUid: _payload.uid,
								payload: _payload,
								bindQuantity,
							});
							handleOnChange();
						}}
						hasFetchedPrices={hasFetchedPrices}
						withOmit
					/>
				);
			})}
		</Stack>
	);
}

/**
 * @typedef ItemGroupParams
 * @prop {GroupStore} groupStore
 * @prop {(params: any) => void} onChange
 * @prop {(params: any) => void} onDelete
 * @prop {(params: any) => void} onDuplicate
 * @prop {(params: any) => void} onMove
 * @prop {(params: any) => void} onUpdate
 * @prop {boolean} isSingleColumn
 * @prop {boolean} bindQuantity
 * @prop {boolean} isDebugMode
 */

export const ItemGroup = observer(
	/**
	 * @param {ItemGroupParams} params
	 */
	({
		groupStore = {},
		onDelete = () => {},
		onDuplicate = () => {},
		onMove = () => {},
		onUpdate = () => {},
		isSingleColumn = false,
		bindQuantity = false,
		isDebugMode = false,
	}) => {
		const [_groupStore] = useState(new GroupStore(groupStore, true));
		const group = _groupStore;
		const saveTimeoutRef = useRef(null);

		const { product, ingredients } = getGroupParts(group);
		const [isLoading, setIsLoading] = useState(false);
		const [isLoadingComponents, setIsLoadingComponents] = useState(false);

		useEffect(() => {
			return () => {
				if (saveTimeoutRef.current) {
					clearTimeout(saveTimeoutRef.current);
				}
			};
		}, []);

		const order = group.order;

		async function getPrices() {
			setIsLoading(true);

			const itemIdListStr = getGroupItemIdsForFetch({ group });
			const locationWithCommas = locations.join(",");

			const currentPriceUrl = new URL(
				`https://${globalStore.server}.albion-online-data.com/api/v2/stats/prices/${itemIdListStr}`,
			);
			currentPriceUrl.searchParams.append("locations", locationWithCommas);

			const priceHistoryUrl = new URL(
				`https://${globalStore.server}.albion-online-data.com/api/v2/stats/history/${product.id}`,
			);

			const [currentPriceResponse, priceHistoryResponse] = await Promise.all([
				dame.get(currentPriceUrl.toString()),
				dame.get(priceHistoryUrl.toString()),
			]);

			const { isError: currentPriceHasError, response: currentPriceData } =
				currentPriceResponse;
			const { response: priceHistoryData } = priceHistoryResponse;

			setIsLoading(false);

			if (currentPriceHasError) {
				return;
			}

			_groupStore.setGroupPriceData({
				currentPriceData,
				priceHistoryData,
			});
		}

		function shouldAddIngredientForEnchantZero(uniqueName, enchant) {
			if (enchant > 0) {
				return true;
			}

			if (ARCANE_EXTRACT_ITEM_IDS.has(uniqueName)) {
				return false;
			}

			if (FISH_SAUCE_ITEM_IDS.has(uniqueName)) {
				return false;
			}

			return true;
		}

		async function getIngredients() {
			setIsLoadingComponents(true);

			const { product } = getGroupParts(_groupStore);

			const productId = product?.id;

			const { tier, enchant } = getItemIdComponents(productId);

			const foundItem = await findItemById(productId);

			if (!foundItem) {
				setIsLoadingComponents(false);
				return;
			}

			const { _itemData: itemData } = foundItem;

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
				["metalbar", "leather", "fiber", "stoneblock", "planks"].includes(
					itemData?.categoryId,
				)
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

				if (!shouldAddIngredientForEnchantZero(uniqueName, enchant)) {
					continue;
				}

				const { tier: resourceTier, enchant: resourceEnchant } =
					getItemIdComponents(uniqueName);

				const itemId = buildItemId({
					id: uniqueName,
					tier: resourceTier,
					enchant: resourceEnchant,
					appendEnchantSymbol: true,
				});

				newItemsToAdd.push({
					id: itemId,
					quantity: _resource.count,
					originalQuantity: _resource.count,
				});
			}

			_groupStore.addGroupItem({
				items: newItemsToAdd,
				cleanIngredients: true,
			});

			setIsLoadingComponents(false);
			await getPrices();
			handleOnChange();
		}

		function handleOnChange() {
			if (saveTimeoutRef.current) {
				clearTimeout(saveTimeoutRef.current);
			}

			saveTimeoutRef.current = setTimeout(() => {
				globalStore.getIndexedDb().add("groups", _groupStore.toPrimitives());
				onUpdate(_groupStore.toPrimitives());
			}, 1000);
		}

		if (!group) {
			return null;
		}

		function GroupActions() {
			return (
				<Group>
					<Group gap={0}>
						<ActionIcon
							variant="subtle"
							onClick={() => {
								onMove({
									id: group.id,
									direction: 1,
								});
							}}
						>
							{isSingleColumn ? <IconArrowDown /> : <IconArrowRight />}
						</ActionIcon>

						<ActionIcon
							variant="subtle"
							disabled={order === 0}
							onClick={() => {
								onMove({
									id: group.id,
									direction: -1,
								});
							}}
						>
							{isSingleColumn ? <IconArrowUp /> : <IconArrowLeft />}
						</ActionIcon>
					</Group>

					<ActionIcon
						variant="subtle"
						onClick={() => {
							onDuplicate({ id: group.id });
						}}
					>
						<IconCopy />
					</ActionIcon>

					<ActionIcon
						color="red"
						variant="subtle"
						onClick={() => {
							onDelete({ id: group.id });
						}}
					>
						<IconTrash />
					</ActionIcon>
				</Group>
			);
		}

		function ProductOptions() {
			return (
				<Group justify="space-evenly">
					<TierSelector
						onTierChange={(tier) => {
							_groupStore.changeGroupTier({
								tierLevelChange: tier,
							});
							handleOnChange();
						}}
						onEnchantChange={(enchant) => {
							_groupStore.changeGroupTier({
								enchantLevelChange: enchant,
							});
							handleOnChange();
						}}
					/>

					<TaxSelector
						tax={_groupStore.tax}
						onChange={(tax) => {
							_groupStore.editGroup({
								payload: {
									tax,
								},
							});
							handleOnChange();
						}}
					/>

					<Group justify="flex-start">
						<Box>
							<Button
								size="xs"
								variant={hasIngredients ? "transparent" : "light"}
								onClick={() => {
									getIngredients();
								}}
								leftSection={<IconHammer />}
								loading={isLoadingComponents}
							>
								{m.getComponents()}
							</Button>
						</Box>
					</Group>
				</Group>
			);
		}

		function ComponentActions() {
			return (
				<Group grow>
					<Button
						leftSection={<IconPlus />}
						variant="light"
						onClick={() => {
							_groupStore.addGroupItem({});
							handleOnChange();
						}}
					>
						{m.addComponent()}
					</Button>
				</Group>
			);
		}

		function ShoppingListToggle() {
			if (ingredients.length === 0) return null;

			return (
				<Center>
					<Button
						size="xs"
						leftSection={<IconShoppingCartPlus />}
						variant="subtle"
						onClick={() => {
							for (const _ingredient of ingredients) {
								_groupStore.editGroupItem({
									itemUid: _ingredient.uid,
									payload: {
										isInShoppingList: true,
									},
								});
							}
							handleOnChange();

							notifications.show({
								color: "green",
								icon: <IconCheck />,
								title: `${ingredients.length} components have been added to shopping list`,
							});
						}}
					>
						{m.addToShoppingList()}
					</Button>
				</Center>
			);
		}

		function ItemDataTable() {
			return (
				<Group justify="center">
					<Box>
						{isDebugMode && (
							<ScrollArea h={300}>
								<Code block>{JSON.stringify(toJS(groupStore), null, 2)}</Code>
							</ScrollArea>
						)}

						<RowSummary group={group} />
					</Box>
				</Group>
			);
		}

		const hasIngredients = group?.items?.length > 1;
		const hasFetchedPrices = (group?.priceData?.length ?? 0) > 0;
		// const atLeastOneItemIsInShoppingList = group.atLeastOneItemIsInShoppingList();

		return (
			<Group wrap="nowrap" h="100%">
				<Card h="100%" id="item-group-card" miw="fit-content">
					<Group justify="space-between" pb="xs">
						<Text size="xs" c="dimmed">
							{m.group()} {order + 1}
						</Text>

						{globalStore.debugMode && (
							<Text size="md">
								{group.id}_{group.order}
							</Text>
						)}

						<GroupActions />
					</Group>

					<Group wrap="nowrap">
						<Stack h="100%" justify="flex-start" gap="md">
							<LocationsSelector
								location={group.location}
								onChange={({ location }) => {
									_groupStore.editGroup({
										payload: {
											location,
										},
									});
									handleOnChange();
								}}
							/>

							<Stack miw="700px">
								<ProductRow
									label={m.result()}
									item={product}
									onChange={(_payload) => {
										_groupStore.editGroupItem({
											itemUid: _payload.uid,
											payload: _payload,
											isProduct: true,
											bindQuantity,
										});
										handleOnChange();
									}}
									isHighlighted
									hasFetchedPrices={hasFetchedPrices}
								/>

								<ProductOptions />

								<Divider my="xs" label={m.components()} labelPosition="center" />

								<ShoppingListToggle />

								<ComponentList
									ingredients={ingredients}
									groupStore={_groupStore}
									handleOnChange={handleOnChange}
									bindQuantity={bindQuantity}
									hasFetchedPrices={hasFetchedPrices}
								/>
								<ComponentActions />
							</Stack>
						</Stack>
					</Group>
				</Card>

				<Card h="100%">
					<Stack h="100%" justify="flex-start">
						<Text size="lg" fw="bold" ta="center">
							{m.itemData()}
						</Text>

						<Center>
							<Button
								rightSection={<IconCloudDownload />}
								variant="light"
								onClick={async () => {
									await getPrices({ groupId: group.id });
									handleOnChange();
								}}
								loading={isLoading}
							>
								{m.fetchPrices()}
							</Button>
						</Center>

						<ItemDataTable />

						<Suspense fallback={<Skeleton height={300} />}>
							<ItemPriceHistoryStats group={group} />
						</Suspense>
					</Stack>
				</Card>
			</Group>
		);
	},
);
