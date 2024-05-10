export function buildItemId({ id, tier, enchant }) {
	// T4_WOOD
	// T4_WOOD_LEVEL1@1
	// T4_WOOD_LEVEL2@2
	// T4_WOOD_LEVEL3@3
	// T4_WOOD_LEVEL4@4
	// T5_WOOD

	// T4_2H_CROSSBOW
	// T4_2H_CROSSBOW@1
	// T4_2H_CROSSBOW@2
	// T4_2H_CROSSBOW@3
	// T4_2H_CROSSBOW@4

	let newId = id;

	if (tier) {
		newId = newId.replace(/T[0-8]{1}/i, `T${tier}`);
	}

	if (enchant === 0) {
		newId = newId.replace(/_LEVEL[0-8]{1}/i, "");
		newId = newId.replace(/@[0-8]{1}/i, "");
	} else if (enchant === 1) {
		const isEnchanted = newId.includes("@");

		if (isEnchanted) {
			newId = newId.replace(/_LEVEL[0-8]{1}/i, `_LEVEL${enchant}`);
			newId = newId.replace(/@[0-8]{1}/i, `@${enchant}`);
		} else {
			const underscoreCount = id.match(/_/g)?.length ?? 0;

			if (underscoreCount === 1) {
				newId += `_LEVEL${enchant}@${enchant}`;
			} else if (underscoreCount === 2) {
				newId += `@${enchant}`;
			}
		}
	} else if (enchant !== undefined) {
		newId = newId.replace(/_LEVEL[0-8]{1}/i, `_LEVEL${enchant}`);
		newId = newId.replace(/@[0-8]{1}/i, `@${enchant}`);
	}

	return newId;
}
