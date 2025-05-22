import { locations } from "@/data/locations";
import { findItemById } from "@/data/scripts/items/utils/findItemById";
import { globalStore } from "@/mobx/rootStore";
import { GroupStore } from "@/mobx/stores/groupStore";
import * as m from "@/paraglide/messages.js";
import {
	ActionIcon,
	Box,
	Button,
	Card,
	Code,
	Container,
	Divider,
	Group,
	SimpleGrid,
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
	IconPlus,
	IconTrash,
	IconX,
} from "@tabler/icons-react";
import { IconHammer } from "@tabler/icons-react";
import { IconCopy } from "@tabler/icons-react";
import dame from "dame";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import { memo } from "react";
import { Tooltip } from "recharts";
import { getGroupItemIdsForFetch } from "../utils/group/getGroupItemIdsForFetch";
import { getGroupParts } from "../utils/group/getGroupParts";
import { buildAndFindItemId } from "../utils/item/buildAndFindItemid";
import { buildItemId } from "../utils/item/buildItemId";
import { getItemIdComponents } from "../utils/item/getItemIdComponents";
import { ItemPriceHistoryStats } from "./ItemPriceHistoryStats";
import { ItemWithComponents } from "./ItemWithComponents";
import LocationsSelector from "./LocationsSelector";
import { RowSummary } from "./RowSummary";
import { TaxSelector } from "./TaxSelector";
import TierSelector from "./TierSelector";

function ComponentList({ ingredients, groupStore, handleOnChange, bindQuantity = false }) {
	return (
		<Stack gap="2">
			{ingredients.map((_ingredient, _idx) => {
				return (
					<ItemWithComponents
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
					/>
				);
			})}
		</Stack>
	);
}

/**
 * @typedef ItemGroupParams
 * @prop {GroupStore} groupStore
 * @prop {number} index
 * @prop {(params: any) => void} onChange
 * @prop {(params: any) => void} onDelete
 * @prop {(params: any) => void} onDuplicate
 * @prop {(params: any) => void} onMove
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
		index,
		onDelete = () => {},
		onDuplicate = () => {},
		onMove = () => {},
		isSingleColumn = false,
		bindQuantity = false,
		isDebugMode = false,
	}) => {
		const [_groupStore] = useState(new GroupStore(groupStore, true));
		const group = _groupStore;

		const { product, ingredients } = getGroupParts(group);
		const [isLoading, setIsLoading] = useState(false);

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

		async function getIngredients() {
			setIsLoading(true);

			const { product } = getGroupParts(_groupStore);

			const productId = product?.id;

			const { tier, enchant } = getItemIdComponents(productId);

			const { _itemData: itemData } = await findItemById(productId);

			setIsLoading(false);

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
					originalQuantity: _resource.count,
				});
			}

			_groupStore.addGroupItem({
				items: newItemsToAdd,
				cleanIngredients: true,
			});
		}

		function handleOnChange() {
			globalStore.getIndexedDb().add("groups", _groupStore.toPrimitives());
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
							disabled={index === 0}
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
									handleOnChange();
								}}
								leftSection={<IconHammer />}
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

					<Button
						rightSection={<IconCloudDownload />}
						variant="light"
						onClick={() => {
							getPrices({ groupId: group.id });
							handleOnChange();
						}}
						loading={isLoading}
					>
						{m.fetchPrices()}
					</Button>
				</Group>
			);
		}

		function ItemDataTable() {
			return (
				<Group justify="center">
					<Container fluid>
						{isDebugMode && (
							<Code block>
								{JSON.stringify(
									{
										productId: product?.id,
										ingredientIds: ingredients.map((i) => i.id),
									},
									null,
									2,
								)}
							</Code>
						)}

						<RowSummary group={group} />
					</Container>
				</Group>
			);
		}

		const hasIngredients = group?.items?.length > 1;
		const atLeastOneItemIsInShoppingList = group.atLeastOneItemIsInShoppingList();

		return (
			<Card
				key={_groupStore.id}
				style={{
					outline: atLeastOneItemIsInShoppingList
						? "3px solid var(--mantine-color-blue-5)"
						: undefined,
				}}
			>
				<SimpleGrid cols={1} spacing="lg" maw={850}>
					<Stack gap="md">
						<Group justify="space-between">
							<Text size="xs" c="dimmed">
								{m.group()} {index + 1}
							</Text>

							{globalStore.debugMode && (
								<Text size="md">
									{group.id}_{group.order}
								</Text>
							)}

							<GroupActions />
						</Group>

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

						<Stack>
							<ItemWithComponents
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
							/>

							<ProductOptions />

							<Divider my="xs" label={m.components()} labelPosition="center" />

							<ComponentList
								ingredients={ingredients}
								groupStore={_groupStore}
								handleOnChange={handleOnChange}
								bindQuantity={bindQuantity}
							/>
							<ComponentActions />

							<Divider my="xs" label="Item data" labelPosition="center" />

							<ItemDataTable />
						</Stack>
					</Stack>

					<Stack>
						<ItemPriceHistoryStats group={group} />
					</Stack>
				</SimpleGrid>
			</Card>
		);
	},
);
