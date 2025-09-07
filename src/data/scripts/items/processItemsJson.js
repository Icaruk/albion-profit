// node src\data\scripts\items\processItemsJson.js

import fs from "node:fs";
import path from "node:path";
import { getOrFetchItemData } from "../itemData/utils.js";
import items from "./items.json" with { type: "json" };

const filename = "itemsWithAllData.json";
const filepath = path.join("./src/data/scripts/items", filename);

const simpleFilename = "items2.js";
const simpleFilepath = path.join("./src/data", simpleFilename);

/**
 * @typedef {Object} ItemData
 * @property {string} itemType
 * @property {string} uniqueName
 * @property {string} uiSprite
 * @property {null} uiSpriteOverlay1
 * @property {null} uiSpriteOverlay2
 * @property {null} uiSpriteOverlay3
 * @property {null} uiAtlas
 * @property {boolean} showinmarketplace
 * @property {number} level
 * @property {number} tier
 * @property {number} enchantmentLevel
 * @property {string} categoryId
 * @property {string} categoryName
 * @property {number} revision
 * @property {object} enchantments
 * @property {object[]} enchantments.enchantments
 * @property {number} enchantments.enchantments.enchantmentLevel
 * @property {number} enchantments.enchantments.itemPower
 * @property {number} enchantments.enchantments.durability
 * @property {object} enchantments.enchantments.craftingRequirements
 * @property {number} enchantments.enchantments.craftingRequirements.time
 * @property {number} enchantments.enchantments.craftingRequirements.silver
 * @property {number} enchantments.enchantments.craftingRequirements.craftingFocus
 * @property {object[]} enchantments.enchantments.craftingRequirements.craftResourceList
 * @property {string} enchantments.enchantments.craftingRequirements.craftResourceList.uniqueName
 * @property {number} enchantments.enchantments.craftingRequirements.craftResourceList.count
 * @property {object} activeSlots
 * @property {object[]} activeSlots.1
 * @property {string} activeSlots.1.spellType
 * @property {string} activeSlots.1.uniqueName
 * @property {null} activeSlots.1.uiAtlas
 * @property {string} activeSlots.1.uiSprite
 * @property {number} activeSlots.1.revision
 * @property {null} activeSlots.1.nameLocaTag
 * @property {null} activeSlots.1.descriptionLocaTag
 * @property {object} activeSlots.1.localizedNames
 * @property {string} activeSlots.1.localizedNames.IT-IT
 * @property {string} activeSlots.1.localizedNames.RU-RU
 * @property {string} activeSlots.1.localizedNames.PL-PL
 * @property {string} activeSlots.1.localizedNames.TR-TR
 * @property {string} activeSlots.1.localizedNames.ID-ID
 * @property {string} activeSlots.1.localizedNames.FR-FR
 * @property {string} activeSlots.1.localizedNames.JA-JP
 * @property {string} activeSlots.1.localizedNames.EN-US
 * @property {string} activeSlots.1.localizedNames.DE-DE
 * @property {string} activeSlots.1.localizedNames.AR-SA
 * @property {string} activeSlots.1.localizedNames.KO-KR
 * @property {string} activeSlots.1.localizedNames.PT-BR
 * @property {string} activeSlots.1.localizedNames.ZH-TW
 * @property {string} activeSlots.1.localizedNames.ES-ES
 * @property {string} activeSlots.1.localizedNames.ZH-CN
 * @property {object} activeSlots.1.localizedDescriptions
 * @property {string} activeSlots.1.localizedDescriptions.IT-IT
 * @property {string} activeSlots.1.localizedDescriptions.RU-RU
 * @property {string} activeSlots.1.localizedDescriptions.PL-PL
 * @property {string} activeSlots.1.localizedDescriptions.TR-TR
 * @property {string} activeSlots.1.localizedDescriptions.ID-ID
 * @property {string} activeSlots.1.localizedDescriptions.FR-FR
 * @property {string} activeSlots.1.localizedDescriptions.JA-JP
 * @property {string} activeSlots.1.localizedDescriptions.EN-US
 * @property {string} activeSlots.1.localizedDescriptions.DE-DE
 * @property {string} activeSlots.1.localizedDescriptions.AR-SA
 * @property {string} activeSlots.1.localizedDescriptions.KO-KR
 * @property {string} activeSlots.1.localizedDescriptions.PT-BR
 * @property {string} activeSlots.1.localizedDescriptions.ZH-TW
 * @property {string} activeSlots.1.localizedDescriptions.ES-ES
 * @property {string} activeSlots.1.localizedDescriptions.ZH-CN
 * @property {string} activeSlots.1.target
 * @property {number} activeSlots.1.castingTime
 * @property {number} activeSlots.1.hitDelay
 * @property {number} activeSlots.1.standTime
 * @property {number|null} activeSlots.1.disruptionFactor
 * @property {number} activeSlots.1.recastDelay
 * @property {number} activeSlots.1.energyUsage
 * @property {number} activeSlots.1.castRange
 * @property {string} activeSlots.1.category
 * @property {string} activeSlots.1.uiType
 * @property {number|null} activeSlots.1.maxCharges
 * @property {object[]|null} activeSlots.1.buffOverTime
 * @property {string} activeSlots.1.buffOverTime.target
 * @property {string} activeSlots.1.buffOverTime.type
 * @property {number} activeSlots.1.buffOverTime.time
 * @property {number} activeSlots.1.buffOverTime.value
 * @property {null} activeSlots.1.buffOverTime.effectAreaRadius
 * @property {object[]|null} activeSlots.1.directAttributeChange
 * @property {string} activeSlots.1.directAttributeChange.target
 * @property {string} activeSlots.1.directAttributeChange.attribute
 * @property {number} activeSlots.1.directAttributeChange.change
 * @property {string} activeSlots.1.directAttributeChange.effectType
 * @property {null} activeSlots.1.directAttributeChange.effectAreaRadius
 * @property {null} activeSlots.1.root
 * @property {null} activeSlots.1.stun
 * @property {null} activeSlots.1.attributeChangeOverTime
 * @property {null} activeSlots.1.silence
 * @property {null} activeSlots.1.damageShield
 * @property {null} activeSlots.1.channeling
 * @property {null} activeSlots.1.knockback
 * @property {null} activeSlots.1.spellEffectArea
 * @property {null} activeSlots.1.invisibility
 * @property {object[]} activeSlots.2
 * @property {string} activeSlots.2.spellType
 * @property {string} activeSlots.2.uniqueName
 * @property {null} activeSlots.2.uiAtlas
 * @property {string} activeSlots.2.uiSprite
 * @property {number} activeSlots.2.revision
 * @property {null} activeSlots.2.nameLocaTag
 * @property {null} activeSlots.2.descriptionLocaTag
 * @property {object} activeSlots.2.localizedNames
 * @property {string} activeSlots.2.localizedNames.IT-IT
 * @property {string} activeSlots.2.localizedNames.RU-RU
 * @property {string} activeSlots.2.localizedNames.PL-PL
 * @property {string} activeSlots.2.localizedNames.TR-TR
 * @property {string} activeSlots.2.localizedNames.ID-ID
 * @property {string} activeSlots.2.localizedNames.FR-FR
 * @property {string} activeSlots.2.localizedNames.JA-JP
 * @property {string} activeSlots.2.localizedNames.EN-US
 * @property {string} activeSlots.2.localizedNames.DE-DE
 * @property {string} activeSlots.2.localizedNames.AR-SA
 * @property {string} activeSlots.2.localizedNames.KO-KR
 * @property {string} activeSlots.2.localizedNames.PT-BR
 * @property {string} activeSlots.2.localizedNames.ZH-TW
 * @property {string} activeSlots.2.localizedNames.ES-ES
 * @property {string} activeSlots.2.localizedNames.ZH-CN
 * @property {object} activeSlots.2.localizedDescriptions
 * @property {string} activeSlots.2.localizedDescriptions.IT-IT
 * @property {string} activeSlots.2.localizedDescriptions.RU-RU
 * @property {string} activeSlots.2.localizedDescriptions.PL-PL
 * @property {string} activeSlots.2.localizedDescriptions.TR-TR
 * @property {string} activeSlots.2.localizedDescriptions.ID-ID
 * @property {string} activeSlots.2.localizedDescriptions.FR-FR
 * @property {string} activeSlots.2.localizedDescriptions.JA-JP
 * @property {string} activeSlots.2.localizedDescriptions.EN-US
 * @property {string} activeSlots.2.localizedDescriptions.DE-DE
 * @property {string} activeSlots.2.localizedDescriptions.AR-SA
 * @property {string} activeSlots.2.localizedDescriptions.KO-KR
 * @property {string} activeSlots.2.localizedDescriptions.PT-BR
 * @property {string} activeSlots.2.localizedDescriptions.ZH-TW
 * @property {string} activeSlots.2.localizedDescriptions.ES-ES
 * @property {string} activeSlots.2.localizedDescriptions.ZH-CN
 * @property {string} activeSlots.2.target
 * @property {number} activeSlots.2.castingTime
 * @property {number} activeSlots.2.hitDelay
 * @property {number} activeSlots.2.standTime
 * @property {number} activeSlots.2.disruptionFactor
 * @property {number} activeSlots.2.recastDelay
 * @property {number} activeSlots.2.energyUsage
 * @property {number} activeSlots.2.castRange
 * @property {string} activeSlots.2.category
 * @property {string} activeSlots.2.uiType
 * @property {null} activeSlots.2.maxCharges
 * @property {null} activeSlots.2.buffOverTime
 * @property {null|object[]} activeSlots.2.directAttributeChange
 * @property {null} activeSlots.2.root
 * @property {null} activeSlots.2.stun
 * @property {null} activeSlots.2.attributeChangeOverTime
 * @property {null} activeSlots.2.silence
 * @property {null} activeSlots.2.damageShield
 * @property {null} activeSlots.2.channeling
 * @property {null} activeSlots.2.knockback
 * @property {object|null} activeSlots.2.spellEffectArea
 * @property {number} activeSlots.2.spellEffectArea.time
 * @property {string} activeSlots.2.spellEffectArea.effect
 * @property {string} activeSlots.2.spellEffectArea.target
 * @property {string} activeSlots.2.spellEffectArea.position
 * @property {boolean} activeSlots.2.spellEffectArea.removeOnLeave
 * @property {boolean} activeSlots.2.spellEffectArea.visible
 * @property {null} activeSlots.2.invisibility
 * @property {string} activeSlots.2.directAttributeChange.target
 * @property {string} activeSlots.2.directAttributeChange.attribute
 * @property {number} activeSlots.2.directAttributeChange.change
 * @property {string} activeSlots.2.directAttributeChange.effectType
 * @property {null} activeSlots.2.directAttributeChange.effectAreaRadius
 * @property {object[]} activeSlots.3
 * @property {string} activeSlots.3.spellType
 * @property {string} activeSlots.3.uniqueName
 * @property {null} activeSlots.3.uiAtlas
 * @property {string} activeSlots.3.uiSprite
 * @property {number} activeSlots.3.revision
 * @property {null} activeSlots.3.nameLocaTag
 * @property {null} activeSlots.3.descriptionLocaTag
 * @property {object} activeSlots.3.localizedNames
 * @property {string} activeSlots.3.localizedNames.IT-IT
 * @property {string} activeSlots.3.localizedNames.RU-RU
 * @property {string} activeSlots.3.localizedNames.PL-PL
 * @property {string} activeSlots.3.localizedNames.TR-TR
 * @property {string} activeSlots.3.localizedNames.ID-ID
 * @property {string} activeSlots.3.localizedNames.FR-FR
 * @property {string} activeSlots.3.localizedNames.JA-JP
 * @property {string} activeSlots.3.localizedNames.EN-US
 * @property {string} activeSlots.3.localizedNames.DE-DE
 * @property {string} activeSlots.3.localizedNames.AR-SA
 * @property {string} activeSlots.3.localizedNames.KO-KR
 * @property {string} activeSlots.3.localizedNames.PT-BR
 * @property {string} activeSlots.3.localizedNames.ZH-TW
 * @property {string} activeSlots.3.localizedNames.ES-ES
 * @property {string} activeSlots.3.localizedNames.ZH-CN
 * @property {object} activeSlots.3.localizedDescriptions
 * @property {string} activeSlots.3.localizedDescriptions.IT-IT
 * @property {string} activeSlots.3.localizedDescriptions.RU-RU
 * @property {string} activeSlots.3.localizedDescriptions.PL-PL
 * @property {string} activeSlots.3.localizedDescriptions.TR-TR
 * @property {string} activeSlots.3.localizedDescriptions.ID-ID
 * @property {string} activeSlots.3.localizedDescriptions.FR-FR
 * @property {string} activeSlots.3.localizedDescriptions.JA-JP
 * @property {string} activeSlots.3.localizedDescriptions.EN-US
 * @property {string} activeSlots.3.localizedDescriptions.DE-DE
 * @property {string} activeSlots.3.localizedDescriptions.AR-SA
 * @property {string} activeSlots.3.localizedDescriptions.KO-KR
 * @property {string} activeSlots.3.localizedDescriptions.PT-BR
 * @property {string} activeSlots.3.localizedDescriptions.ZH-TW
 * @property {string} activeSlots.3.localizedDescriptions.ES-ES
 * @property {string} activeSlots.3.localizedDescriptions.ZH-CN
 * @property {string} activeSlots.3.target
 * @property {number} activeSlots.3.castingTime
 * @property {number} activeSlots.3.hitDelay
 * @property {number} activeSlots.3.standTime
 * @property {number} activeSlots.3.disruptionFactor
 * @property {number} activeSlots.3.recastDelay
 * @property {number} activeSlots.3.energyUsage
 * @property {number} activeSlots.3.castRange
 * @property {string} activeSlots.3.category
 * @property {string} activeSlots.3.uiType
 * @property {null} activeSlots.3.maxCharges
 * @property {object[]} activeSlots.3.buffOverTime
 * @property {string} activeSlots.3.buffOverTime.target
 * @property {string} activeSlots.3.buffOverTime.type
 * @property {number} activeSlots.3.buffOverTime.time
 * @property {number} activeSlots.3.buffOverTime.value
 * @property {null} activeSlots.3.buffOverTime.effectAreaRadius
 * @property {null} activeSlots.3.directAttributeChange
 * @property {null} activeSlots.3.root
 * @property {null} activeSlots.3.stun
 * @property {object[]} activeSlots.3.attributeChangeOverTime
 * @property {string} activeSlots.3.attributeChangeOverTime.attribute
 * @property {number} activeSlots.3.attributeChangeOverTime.interval
 * @property {number} activeSlots.3.attributeChangeOverTime.initialInterval
 * @property {number} activeSlots.3.attributeChangeOverTime.change
 * @property {number} activeSlots.3.attributeChangeOverTime.count
 * @property {null} activeSlots.3.attributeChangeOverTime.effectType
 * @property {null} activeSlots.3.attributeChangeOverTime.effectAreaRadius
 * @property {null} activeSlots.3.silence
 * @property {null} activeSlots.3.damageShield
 * @property {null} activeSlots.3.channeling
 * @property {null} activeSlots.3.knockback
 * @property {null} activeSlots.3.spellEffectArea
 * @property {null} activeSlots.3.invisibility
 * @property {object} passiveSlots
 * @property {object[]} passiveSlots.1
 * @property {string} passiveSlots.1.spellType
 * @property {string} passiveSlots.1.uniqueName
 * @property {null} passiveSlots.1.uiAtlas
 * @property {string} passiveSlots.1.uiSprite
 * @property {number} passiveSlots.1.revision
 * @property {null|string} passiveSlots.1.nameLocaTag
 * @property {null|string} passiveSlots.1.descriptionLocaTag
 * @property {object} passiveSlots.1.localizedNames
 * @property {string} passiveSlots.1.localizedNames.IT-IT
 * @property {string} passiveSlots.1.localizedNames.RU-RU
 * @property {string} passiveSlots.1.localizedNames.PL-PL
 * @property {string} passiveSlots.1.localizedNames.TR-TR
 * @property {string} passiveSlots.1.localizedNames.ID-ID
 * @property {string} passiveSlots.1.localizedNames.FR-FR
 * @property {string} passiveSlots.1.localizedNames.JA-JP
 * @property {string} passiveSlots.1.localizedNames.EN-US
 * @property {string} passiveSlots.1.localizedNames.DE-DE
 * @property {string} passiveSlots.1.localizedNames.AR-SA
 * @property {string} passiveSlots.1.localizedNames.KO-KR
 * @property {string} passiveSlots.1.localizedNames.PT-BR
 * @property {string} passiveSlots.1.localizedNames.ZH-TW
 * @property {string} passiveSlots.1.localizedNames.ES-ES
 * @property {string} passiveSlots.1.localizedNames.ZH-CN
 * @property {object} passiveSlots.1.localizedDescriptions
 * @property {string} passiveSlots.1.localizedDescriptions.IT-IT
 * @property {string} passiveSlots.1.localizedDescriptions.RU-RU
 * @property {string} passiveSlots.1.localizedDescriptions.PL-PL
 * @property {string} passiveSlots.1.localizedDescriptions.TR-TR
 * @property {string} passiveSlots.1.localizedDescriptions.ID-ID
 * @property {string} passiveSlots.1.localizedDescriptions.FR-FR
 * @property {string} passiveSlots.1.localizedDescriptions.JA-JP
 * @property {string} passiveSlots.1.localizedDescriptions.EN-US
 * @property {string} passiveSlots.1.localizedDescriptions.DE-DE
 * @property {string} passiveSlots.1.localizedDescriptions.AR-SA
 * @property {string} passiveSlots.1.localizedDescriptions.KO-KR
 * @property {string} passiveSlots.1.localizedDescriptions.PT-BR
 * @property {string} passiveSlots.1.localizedDescriptions.ZH-TW
 * @property {string} passiveSlots.1.localizedDescriptions.ES-ES
 * @property {string} passiveSlots.1.localizedDescriptions.ZH-CN
 * @property {null} passiveSlots.1.buff
 * @property {null} passiveSlots.1.reflectDamage
 * @property {object} localizedNames
 * @property {string} localizedNames.IT-IT
 * @property {string} localizedNames.RU-RU
 * @property {string} localizedNames.PL-PL
 * @property {string} localizedNames.TR-TR
 * @property {string} localizedNames.ID-ID
 * @property {string} localizedNames.FR-FR
 * @property {string} localizedNames.JA-JP
 * @property {string} localizedNames.EN-US
 * @property {string} localizedNames.DE-DE
 * @property {string} localizedNames.AR-SA
 * @property {string} localizedNames.KO-KR
 * @property {string} localizedNames.PT-BR
 * @property {string} localizedNames.ZH-TW
 * @property {string} localizedNames.ES-ES
 * @property {string} localizedNames.ZH-CN
 * @property {object} localizedDescriptions
 * @property {string} localizedDescriptions.IT-IT
 * @property {string} localizedDescriptions.RU-RU
 * @property {string} localizedDescriptions.PL-PL
 * @property {string} localizedDescriptions.TR-TR
 * @property {string} localizedDescriptions.ID-ID
 * @property {string} localizedDescriptions.FR-FR
 * @property {string} localizedDescriptions.JA-JP
 * @property {string} localizedDescriptions.EN-US
 * @property {string} localizedDescriptions.DE-DE
 * @property {string} localizedDescriptions.AR-SA
 * @property {string} localizedDescriptions.KO-KR
 * @property {string} localizedDescriptions.PT-BR
 * @property {string} localizedDescriptions.ZH-TW
 * @property {string} localizedDescriptions.ES-ES
 * @property {string} localizedDescriptions.ZH-CN
 * @property {string} slotType
 * @property {boolean} unlockedToEquip
 * @property {boolean} twoHanded
 * @property {null} unequipInCombat
 * @property {number} maxQualityLevel
 * @property {number} abilityPower
 * @property {number} physicalSpellDamageBonus
 * @property {number} magicspellDamageBonus
 * @property {number} attackDamage
 * @property {number} attackSpeed
 * @property {number} attackRange
 * @property {number} weight
 * @property {number} activeSpellSlots
 * @property {number} passiveSpellSlots
 * @property {number} durability
 * @property {number} durabilityLossAttack
 * @property {number} durabilityLossSpelluse
 * @property {number} durabilityLossReceivedattack
 * @property {number} durabilityLossReceivedspell
 * @property {number} hitpointsMax
 * @property {number} itemPower
 * @property {number} hitpointsRegenerationBonus
 * @property {string} itemPowerProgressionType
 * @property {string} attackType
 * @property {null} fxboneName
 * @property {string} mainhandAnimationType
 * @property {object} craftingRequirements
 * @property {number} craftingRequirements.time
 * @property {number} craftingRequirements.silver
 * @property {number} craftingRequirements.craftingFocus
 * @property {object[]} craftingRequirements.craftResourceList
 * @property {string} craftingRequirements.craftResourceList.uniqueName
 * @property {number} craftingRequirements.craftResourceList.count
 * @property {null} transformation
 * @property {string} spriteName
 * @property {boolean} stackable
 * @property {boolean} equipable
 */

if (fs.existsSync(filepath)) {
	fs.unlinkSync(filepath);
}

fs.writeFileSync(filepath, "[");
fs.writeFileSync(simpleFilepath, "export const albionData = [");

let currentCount = 0;
const maxIndex = items.length - 1;

for await (const _item of items) {
	/*
		{
			"LocalizationNameVariable": "@ITEMS_UNIQUE_HIDEOUT",
			"LocalizationDescriptionVariable": "@ITEMS_UNIQUE_HIDEOUT_DESC",
			"LocalizedNames": {
				"EN-US": "Hideout Construction Kit",
				"DE-DE": "Unterschlupf-Baukasten",
				"FR-FR": "Kit de construction de repaire",
				"RU-RU": "Набор для постройки убежища",
				"PL-PL": "Zestaw do budowy Kryjówki",
				"ES-ES": "Kit de construcción de escondites",
				"PT-BR": "Kit de Construção de Esconderijo",
				"IT-IT": "Kit di costruzione nascondigli",
				"ZH-CN": "藏身地堡建筑工具包",
				"KO-KR": "은신처 건설키트",
				"JA-JP": "隠れ家建設キット",
				"ZH-TW": "藏身地堡建設工具組",
				"ID-ID": "Kit Konstruksi Persembunyian",
				"TR-TR": "Sığınak İnşa Seti",
				"AR-SA": "طقم بناء المخبأ"
			},
			"LocalizedDescriptions": {
				"EN-US": "Hideout construction kits are used to place Guild Hideouts in the Outlands.",
				"DE-DE": "Mit einem Unterschlupf-Baukasten kannst du in den Outlands deinen Unterschlupf errichten.",
				"FR-FR": "Les kits de construction de repaire sont utilisés pour placer des cachettes de guilde dans les Terres Lointaines.",
				"RU-RU": "Наборы для постройки убежища используются для размещения убежищ гильдий в Запределье.",
				"PL-PL": "Zestawy do budowy Kryjówki służą do umieszczania Kryjówek Gildii na Rubieżach.",
				"ES-ES": "Los kits de construcción de escondites se utilizan para colocar escondites de gremios en las Tierras Lejanas",
				"PT-BR": "Kits de construção de Esconderijo são usados para colocar Esconderijos de Guilda em Terras Distantes.",
				"IT-IT": "I kit di costruzione nascondigli permettono di posizionare nascondigli di gilda nelle Terre Esterne.",
				"ZH-CN": "在异域修建公会的藏身地堡时，可使用藏身地堡建筑工具包。",
				"KO-KR": "아웃랜드의 길드 은신처에서 은신처 건설키트를 사용할 수 있습니다.",
				"JA-JP": "隠れ家建設キットを使うと、ギルドの隠れ家を辺境地に配置できます。",
				"ZH-TW": "可使用藏身地堡建設工具組將公會藏身地堡放置於異域。",
				"ID-ID": "Kit konstruksi persembunyian digunakan untuk menempatkan Persembunyian Guild di Outlands.",
				"TR-TR": "Sığınak İnşa Setleri, Dış Diyarlara Lonca Sığınakları yerleştirmek için kullanılır.",
				"AR-SA": "تُستخدم أطقم بناء المخابئ لوضع مخابئ الطائفة في القارة النائية."
			},
			"Index": "1",
			"UniqueName": "UNIQUE_HIDEOUT"
		}
	*/

	let trailingComma = "";

	if (currentCount < maxIndex) {
		trailingComma = ",";
	}

	// Append to simple file
	const simpleItem = {
		LocalizationNameVariable: _item.LocalizationNameVariable,
		LocalizedNames: {
			"EN-US": _item.LocalizedNames?.["EN-US"] ?? "missing",
			"ES-ES": _item.LocalizedNames?.["ES-ES"] ?? "missing",
			"FR-FR": _item.LocalizedNames?.["FR-FR"] ?? "missing",
		},
		UniqueName: _item.UniqueName,
	};

	fs.appendFileSync(simpleFilepath, `${JSON.stringify(simpleItem)}${trailingComma}\n`);

	_item.LocalizationDescriptionVariable = undefined;
	_item.LocalizedNames = {
		"EN-US": _item.LocalizedNames?.["EN-US"] ?? "missing",
		"ES-ES": _item.LocalizedNames?.["ES-ES"] ?? "missing",
		"FR-FR": _item.LocalizedNames?.["FR-FR"] ?? "missing",
	};
	_item.LocalizedDescriptions = undefined;
	_item.Index = undefined;

	// Find itemData
	const itemData = await getOrFetchItemData(_item.UniqueName);

	if (itemData) {
		_item._itemData = itemData;
	}

	currentCount++;

	// Append to a filea
	fs.appendFileSync(filepath, `${JSON.stringify(_item)}${trailingComma}\n`);
}

fs.appendFileSync(filepath, "]");
