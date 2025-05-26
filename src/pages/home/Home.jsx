import { globalStore } from "@/mobx/rootStore";
import { GroupStore } from "@/mobx/stores/groupStore";
import { ShoppingListStore } from "@/mobx/stores/shoppingListStore";
import * as m from "@/paraglide/messages.js";
import { useAutoAnimate } from "@formkit/auto-animate/react";
import {
	Anchor,
	Avatar,
	Badge,
	Button,
	Center,
	Checkbox,
	Drawer,
	Grid,
	Group,
	Image,
	Loader,
	ScrollArea,
	SimpleGrid,
	Space,
	Text,
	Tooltip,
	useMatches,
} from "@mantine/core";
import { useClipboard, useResizeObserver } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconBrandGithub, IconBrandReddit, IconClipboard, IconPlus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { useEffect, useMemo, useState } from "react";
import classes from "./Home.module.css";
import { ItemGroup } from "./partials/ItemGroup";
import { LanguageSelector } from "./partials/LanguageSelector";
import { ServerSelector } from "./partials/ServerSelector";
import { ShoppingList, ShoppingListButton } from "./partials/ShoppingList";
import { IndexedDB } from "./utils/IndexedDB/IndexedDB";
import { getRandomWallpaper } from "./utils/getRandomWallpaper";

function loadFromLocalStorage() {
	const str = localStorage.getItem("state");
	if (!str) return null;

	try {
		const parsedGroup = JSON.parse(str);

		if (!Array.isArray(parsedGroup)) {
			return [];
		}

		for (let _i = 0; _i < parsedGroup.length; ++_i) {
			const primitiveGroup = parsedGroup[_i];
			const groupEntity = new GroupStore(primitiveGroup);

			parsedGroup[_i] = groupEntity;
		}

		console.log("state loaded");

		return parsedGroup;
	} catch (err) {
		return null;
	}
}

export default observer(function Home() {
	const [isInitialized, setIsInitialized] = useState(false);

	/** @type {[GroupStore[], React.Dispatch<React.SetStateAction<GroupStore[]>>]} */
	const [groups, setGroups] = useState([new GroupStore()]);

	const [showShoppingList, setShowShoppingList] = useState(false);

	const [wallpaper] = useState(() => getRandomWallpaper());

	const isSingleColumn = useMatches({
		base: true,
		xl: false,
	});

	const [resizeObserverRef, rect] = useResizeObserver();
	const clipboard = useClipboard();

	const [parentAutoAnimate] = useAutoAnimate();

	const isDebugMode = globalStore.debugMode;
	const bindQuantity = globalStore.bindQuantity;

	function handleLoad() {
		const state = loadFromLocalStorage();

		if (!state) {
			return;
		}

		setGroups(state);
	}

	async function loadFromIndexedDB() {
		try {
			const indexedDb = globalStore.getIndexedDb();
			if (!indexedDb || !indexedDb.db) {
				console.log("IndexedDB not initialized yet");
				return null;
			}

			const groups = await indexedDb.getAll("groups");
			if (groups && groups.length > 0) {
				console.log("Loaded groups from IndexedDB:", groups.length);
				return groups;
			}
			return null;
		} catch (error) {
			console.error("Error loading from IndexedDB:", error);
			return null;
		}
	}

	useEffect(() => {
		(async () => {
			const indexedDB = new IndexedDB();
			await indexedDB.init();
			globalStore.indexedDb = indexedDB;

			const indexedDBGroups = await loadFromIndexedDB();

			if (indexedDBGroups && indexedDBGroups.length > 0) {
				const builtGroups = [];

				for (const _group of indexedDBGroups) {
					builtGroups.push(new GroupStore(_group, true));
				}

				setGroups(builtGroups);
			}

			setIsInitialized(true);
		})();
	}, []);

	function handleAddGroup() {
		setGroups((prev) => {
			const groupsClone = [...prev];

			let newOrder = 0;

			for (const _groupStore of groupsClone) {
				if (_groupStore.order > newOrder) {
					newOrder = _groupStore.order;
				}
			}

			const newGroup = new GroupStore({ order: newOrder + 1 });
			groupsClone.push(newGroup);

			// Save the new group to IndexedDB
			const indexedDb = globalStore.getIndexedDb();
			if (indexedDb?.db) {
				indexedDb.add("groups", newGroup.toPrimitives());
			}

			return groupsClone;
		});
	}

	function handleDeleteGroup(id) {
		setGroups((_prev) => {
			const groupsClone = [..._prev];
			const idx = groupsClone.findIndex((_groupStore) => _groupStore.id === id);

			if (idx !== -1) {
				groupsClone.splice(idx, 1);

				// Delete from IndexedDB
				const indexedDb = globalStore.getIndexedDb();
				if (indexedDb?.db) {
					indexedDb.deleteOne("groups", id);
				}
			}

			return groupsClone;
		});
	}

	function handleDuplicateGroup(id) {
		setGroups((_prev) => {
			const groupsClone = [..._prev];
			const idx = groupsClone.findIndex((_groupStore) => _groupStore.id === id);

			if (idx !== -1) {
				const clonedGroup = groupsClone[idx].cloneGroup();

				// Insert the same group after the index
				groupsClone.splice(idx + 1, 0, clonedGroup);

				// Save the cloned group to IndexedDB
				const indexedDb = globalStore.getIndexedDb();
				if (indexedDb?.db) {
					indexedDb.add("groups", clonedGroup.toPrimitives());
				}
			}

			return groupsClone;
		});
	}

	function handleMoveGroup(id, direction) {
		setGroups((_prev) => {
			const groupsClone = [..._prev];
			const idx = groupsClone.findIndex((_groupStore) => _groupStore.id === id);

			if (idx === -1) {
				return groupsClone;
			}

			// Check if the group can be moved
			if (direction === 1 && idx === groupsClone.length - 1) {
				return groupsClone;
			}
			if (direction === -1 && idx === 0) {
				return groupsClone;
			}

			const prevGroup = groupsClone[Math.max(0, idx - 1)];
			const currentGroup = groupsClone[idx];
			const nextGroup = groupsClone[idx + 1];

			if (currentGroup.order === nextGroup.order) {
				nextGroup.order++;
			}

			const currentOrder = currentGroup.order;

			if (direction === 1) {
				currentGroup.order = nextGroup.order;
				nextGroup.order = currentOrder;

				// Update both groups in IndexedDB
				const indexedDb = globalStore.getIndexedDb();
				if (indexedDb?.db) {
					indexedDb.add("groups", currentGroup.toPrimitives());
					indexedDb.add("groups", nextGroup.toPrimitives());
				}
			} else {
				currentGroup.order = prevGroup.order;
				prevGroup.order = currentOrder;

				// Update both groups in IndexedDB
				const indexedDb = globalStore.getIndexedDb();
				if (indexedDb?.db) {
					indexedDb.add("groups", currentGroup.toPrimitives());
					indexedDb.add("groups", prevGroup.toPrimitives());
				}
			}

			return groupsClone;
		});
	}

	const { headerHeight } = useMemo(() => {
		// temporal fix for margin-inline and margin-block... automatically applied by Mantine?
		if (resizeObserverRef?.current?.style?.margin) {
			resizeObserverRef.current.style.margin = 0;
		}

		return {
			headerHeight: rect.height,
		};
	}, [rect]);

	const sortedGroups = (groups ?? []).sort((a, b) => a.order - b.order);

	const shoppingList = new ShoppingListStore().buildFromGroups(groups);

	if (!isInitialized) {
		return <Loader />;
	}

	return (
		<div className={classes.mainContainer} ref={parentAutoAnimate}>
			<Image className={classes.image} src={wallpaper} />

			<ScrollArea w="100%">
				<Grid
					ref={resizeObserverRef}
					// my="xs"
					// mx="md"
					px="sm"
					py="xs"
					style={{
						backgroundColor: "rgba(0, 0, 0, 0.4)",
						backdropFilter: "blur(6px)",
						position: "absolute",
						left: 0,
						top: 0,
						zIndex: 90,
						width: "100%",
						margin: 0,
					}}
				>
					<Grid.Col span={4}>
						<Group justify="flex-start">
							<LanguageSelector />
							<ServerSelector />

							<Tooltip label={m.bindQuantityTooltip()}>
								<Checkbox
									label={m.bindQuantity()}
									onChange={(ev) => {
										globalStore.bindQuantity = ev.target.checked;
									}}
									checked={bindQuantity}
								/>
							</Tooltip>
						</Group>
					</Grid.Col>

					<Grid.Col span={4}>
						<ShoppingListButton
							value={showShoppingList}
							onClick={(val) => setShowShoppingList(!val)}
						/>
					</Grid.Col>

					<Grid.Col span={4}>
						<Group justify="flex-end">
							<Button
								variant={isDebugMode ? "filled" : "outline"}
								onClick={() => {
									globalStore.debugMode = !isDebugMode;
								}}
							>
								Debug mode
							</Button>

							<Anchor href="https://github.com/Icaruk/albion-profit" target="_blank">
								<Avatar variant="light">
									<IconBrandGithub size={32} />
								</Avatar>
							</Anchor>

							<Anchor
								href="https://www.reddit.com/r/albiononline/comments/1co93rm/i_created_a_tool_to_calculate_profits/"
								target="_blank"
							>
								<Avatar variant="light">
									<IconBrandReddit
										size={32}
										color="var(--mantine-color-orange-7)"
									/>
								</Avatar>
							</Anchor>
						</Group>
					</Grid.Col>
				</Grid>

				<Space h={headerHeight} />

				<Center>
					<SimpleGrid p="md" cols={{ base: 1, xl: 2 }}>
						{sortedGroups?.map((_groupStore, _idx) => {
							const group = _groupStore;

							if (!group) {
								return null;
							}

							return (
								<ItemGroup
									key={group.id}
									groupStore={_groupStore}
									index={_idx}
									onDelete={({ id }) => {
										handleDeleteGroup(id);
									}}
									onDuplicate={({ id }) => {
										handleDuplicateGroup(id);
									}}
									onMove={({ id, direction }) => {
										handleMoveGroup(id, direction);
									}}
									isSingleColumn={isSingleColumn}
									bindQuantity={bindQuantity}
									isDebugMode={isDebugMode}
								/>
							);
						})}

						<Button
							leftSection={<IconPlus />}
							onClick={() => {
								handleAddGroup();
							}}
						>
							{m.addGroup()}
						</Button>
					</SimpleGrid>
				</Center>
			</ScrollArea>

			<Drawer
				opened={showShoppingList}
				size={"xl"}
				onClose={() => setShowShoppingList(false)}
				title={
					<Group>
						<Text fw="bold" ta="center" size="lg">
							Shopping list
						</Text>

						<Badge>BETA</Badge>
					</Group>
				}
				keepMounted={false}
			>
				<ShoppingList
					shoppingList={shoppingList}
					onCopy={(text) => {
						clipboard.copy(text);

						notifications.show({
							color: "green",
							icon: <IconClipboard />,
							title: "Item has been copied to clipboard",
						});
					}}
				/>
			</Drawer>
		</div>
	);
});
