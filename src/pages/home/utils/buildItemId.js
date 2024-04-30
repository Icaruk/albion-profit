export function buildItemId({ id, tier, enchant }) {
	// T4_WOOD
	// T4_WOOD_LEVEL1@1
	// T4_WOOD_LEVEL2@2
	// T4_WOOD_LEVEL3@3
	// T4_WOOD_LEVEL4@4
	// T5_WOOD

	const parts = id.split(/[_@]/);
	// T4_WOOD --> ["T4", "WOOD"]
	// T4_WOOD_LEVEL1@1 --> ["T4", "WOOD", "LEVEL1", "1"]

	let tierStr = parts[0];
	const itemStr = parts[1];
	let enchant1Str = parts?.[2];
	let enchant2Str = parts?.[3];

	if (tier) {
		tierStr = `T${tier}`;
	}

	if (enchant > 0) {
		enchant1Str = `LEVEL${enchant}`;
		enchant2Str = `@${enchant}`;
	}

	let builtId = `${tierStr}_${itemStr}`;

	if (enchant1Str) {
		builtId += `_${enchant1Str}${enchant2Str}`;
	}

	return builtId;
}
