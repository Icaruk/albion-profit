export function getGroupParts(group) {
	const product = group?.items.find((_i) => _i.type === "product");
	const ingredients = group?.items.filter((_i) => _i.type === "ingredient");

	return {
		product,
		ingredients,
	};
}
