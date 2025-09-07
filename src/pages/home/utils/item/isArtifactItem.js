import { findSimpleItemDataById } from "@/data/utils/findSimpleItemDataById";

/**
 * @param {string} itemId
 * @returns {boolean}
 */
export function isArtifactItem(itemId) {
	if (itemId.includes("QUESTITEM_")) {
		return true;
	}

	if (new RegExp(/arti|efact/gi).test(itemId)) {
		return true;
	}

	return false;
}
