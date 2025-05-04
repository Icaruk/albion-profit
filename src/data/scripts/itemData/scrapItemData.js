// node src\data\scripts\itemData\scrapItemData.js

import fs from "node:fs";
import path from "node:path";
import dame from "dame";
import { albionData } from "../../items.js";

const filename = "itemData2.json";
const filepath = path.join("./src/data/scripts/itemData", filename);

fs.writeFileSync(filepath, "[");

const t0 = performance.now();
let count = 0;
let errorCount = 0;
const totalCount = albionData.length;

for await (const _item of albionData) {
	const itemId = _item?.UniqueName;

	const subt0 = performance.now();
	console.log(`[${count}/${totalCount}] Requesting ${itemId}`);

	const { isError, response } = await dame.get(
		`https://gameinfo.albiononline.com/api/gameinfo/items/${itemId}/data`,
	);

	if (isError) {
		errorCount++;
		await new Promise((resolve) => setTimeout(resolve, 600));
	} else {
		await new Promise((resolve) => setTimeout(resolve, 100));
	}

	console.log(`  error=${isError} ~ took`, (performance.now() - subt0) / 1000);
	count++;

	if (isError) {
		continue;
	}

	// Append to a file
	fs.appendFileSync(filepath, `${JSON.stringify(response)},`);
}

console.log("All requests took", (performance.now() - t0) / 1000);
