/**
 * @param {string} itemId
 * @returns {boolean}
 */
export function isArtifactItem(itemId) {
	if (itemId.includes("QUESTITEM_")) {
		return true;
	}

	if (/arti|efact/gi.test(itemId)) {
		return true;
	}

	if (itemId.includes("_SHARD_AVALONIAN")) {
		return true;
	}

	if (itemId.includes("_ROYAL_SIGIL")) {
		return true;
	}

	return false;
}
