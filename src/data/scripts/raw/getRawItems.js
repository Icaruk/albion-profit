// node src\data\scripts\raw\getRawItems.js

import fs from "node:fs";
import path from "node:path";
import dame from "dame";

const filename = "rawItems.json";
const metadataFilename = "rawItemsMetadata.json";
const url =
	"https://raw.githubusercontent.com/ao-data/ao-bin-dumps/refs/heads/master/formatted/items.json";

const filepath = path.join("./src/data/scripts/raw", filename);
const metadataFilepath = path.join("./src/data/scripts/raw", metadataFilename);

const { response, isError } = await dame.get(url);

if (isError) {
	console.error("Error fetching data:", response);
	process.exit(1);
}

/** @type {Buffer} */
const buffer = response;

const text = buffer.toString("utf8");
const json = JSON.parse(text);

// Delete "LocalizedDescriptions" from each "json" item
for (const _item of json) {
	_item.LocalizedDescriptions = undefined;
	_item.LocalizationDescriptionVariable = undefined;
	_item.Index = undefined;
}

fs.writeFileSync(filepath, JSON.stringify(json));

// Get file size in MB
const stats = fs.statSync(filepath);
const fileSizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

const metadata = {
	date: new Date().toISOString(),
	url,
	fileSizeMB: Number.parseFloat(fileSizeInMB),
	itemCount: json.length,
};

fs.writeFileSync(metadataFilepath, JSON.stringify(metadata, null, 4));

console.log(`Success ${metadata.itemCount} items in ${fileSizeInMB} MB`);
