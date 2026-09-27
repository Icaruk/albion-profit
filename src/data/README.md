# Item data

The app consumes two generated files and refreshes them through a single pipeline script.

## Generated files (do not edit by hand)

| File | Consumed by | Contents |
| --- | --- | --- |
| `src/data/items.js` | `ItemSelector`, `ProductRow`, `utils/findSimpleItemDataById` | One entry per item: `LocalizationNameVariable`, `LocalizedNames` (EN-US / ES-ES / FR-FR), `UniqueName`. |
| `src/data/itemsWithAllData.json` | `utils/findItemById` | The same entries, enriched with `_itemData` (category, crafting requirements, enchantments) scraped from the official gameinfo API. |

Both files are regenerated from the caches below, so manual edits are always overwritten. The caches themselves are gitignored: a fresh clone gets fully enriched outputs from git, and the caches are only rebuilt when the pipeline runs.

## Pipeline

```
pnpm run data:update
```

Runs four steps in order:

1. **Download** — fetches the full item list from [ao-bin-dumps](https://github.com/ao-data/ao-bin-dumps) (`formatted/items.json`, trimmed to the fields we need) plus the item definitions dump (`items.json`, the parsed game `items.xml`). Cached in `src/data/scripts/cache/raw-items.json` and `src/data/scripts/cache/raw-item-definitions.json`.
2. **Extract** — reads the item definitions dump and fills `src/data/scripts/cache/item-data.json` with every item's category, base recipe, enchantment recipes and enchanted (`@1`…`@N`) variants. This is the primary data source: one bulk download, no requests per item.
3. **Scrape (fallback)** — for item ids still missing from the item data cache (e.g. brand new items not yet in the dump), requests `https://gameinfo.albiononline.com/api/gameinfo/items/{id}/data` and stores a trimmed copy (`categoryId`, `craftingRequirements`, `enchantments`).
4. **Build** — merges both caches into the two generated files and writes run stats to `src/data/scripts/cache/metadata.json`.

### Extraction rules

- `categoryId` comes from the dump's `@craftingcategory` (or from `@shopsubcategory2` for refined resources); existing cached values always win to keep the vocabulary stable.
- Refined resources (`metalbar`, `leather`, `fiber`, `stoneblock`, `planks`) get **no** recipe: the app synthesizes those at runtime and emitting the dump recipe would double it.
- `potion` and `cooked` items get **no** base recipe: the app reconstructs enchant-0 recipes from the enchant-1 entry (dropping its last resource, the extract) — same shape the legacy gameinfo data had.
- Enchanted variants (`@N`) get their own cache entry with the recipe of their enchantment level, so enchanted picks resolve locally without hitting the worker fallback.

### Flags

| Flag | Effect |
| --- | --- |
| `--skip-download` | Reuse the existing raw items and definitions caches. |
| `--skip-scrape` | Rebuild outputs from the existing caches without scraping. |
| `--refresh-scrape` | Discard the item data cache, then re-extract from the dump and scrape the gaps. |

### Environment

| Variable | Default | Effect |
| --- | --- | --- |
| `SCRAPE_CONCURRENCY` | `2` | Parallel scrape workers. |
| `SCRAPE_DELAY_MS` | `300` | Delay between requests per worker. |

### Error handling

- `404` from the gameinfo API is cached as `null` — the item is known to have no data and will not be requested again.
- `429` / `5xx` / network errors are retried up to 3 times with backoff (`2s → 8s → 32s`). If all attempts fail, the item stays out of the cache and is retried on the next run.
- The cache is flushed to disk every 50 items, so an interrupted run keeps its progress.

## Runtime fallback

`utils/findItemById` reads `itemsWithAllData.json`. When an entry has no `_itemData` (item missing from the cache, e.g. brand new items), it falls back to the Cloudflare proxy of the same gameinfo endpoint: `https://albion.icaruk.workers.dev/items/{id}/data`.
