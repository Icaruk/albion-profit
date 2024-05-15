// node src\data\scripts\items\processItemsJson.js

import fs from "node:fs";
import path from "node:path";
import items from "./items.json" assert { type: "json" };

const filename = "items_p.json";
const filepath = path.join("./src/data/scripts/items", filename);

if (fs.existsSync(filepath)) {
	fs.unlinkSync(filepath);
}

fs.writeFileSync(filepath, "[");

let currentCount = 0;
const maxIndex = items.length - 1;

for (const _item of items) {
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

	_item.LocalizationDescriptionVariable = undefined;
	_item.LocalizedNames = {
		"EN-US": _item.LocalizedNames?.["EN-US"] ?? "missing",
		"ES-ES": _item.LocalizedNames?.["ES-ES"] ?? "missing",
		"FR-FR": _item.LocalizedNames?.["FR-FR"] ?? "missing",
	};
	_item.LocalizedDescriptions = undefined;
	_item.Index = undefined;

	let trailingComma = "";
	if (currentCount < maxIndex) {
		trailingComma = ",";
	}

	currentCount++;

	// Append to a filea
	fs.appendFileSync(filepath, `${JSON.stringify(_item)}${trailingComma}\n`);
}

fs.appendFileSync(filepath, "]");
