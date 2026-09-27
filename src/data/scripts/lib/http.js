const RETRY_DELAYS_MS = [2000, 8000, 32000];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Fetch a URL and parse its body as JSON, with retries and exponential backoff.
 *
 * Status handling:
 * - 404            -> `{ ok: false, status: 404 }`, permanent, NOT retried.
 * - 429 / 5xx      -> retried with backoff (rate limit / server issues).
 * - Other 4xx      -> `{ ok: false, status }`, permanent, NOT retried.
 * - Network error / timeout / empty or invalid body -> retried with backoff.
 *
 * Retries exhausted -> `{ ok: false, status: 0, error }`.
 *
 * @param {string} url
 * @param {{ timeoutMs?: number }} options
 * @returns {Promise<{ ok: boolean, status: number, data: unknown, error: Error | null }>}
 */
export async function fetchJson(url, { timeoutMs = 15000 } = {}) {
	let lastError = null;

	for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
		if (attempt > 0) {
			console.warn(
				`  Retry ${attempt}/${RETRY_DELAYS_MS.length} for ${url} in ${RETRY_DELAYS_MS[attempt - 1]}ms`,
			);
			await sleep(RETRY_DELAYS_MS[attempt - 1]);
		}

		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);

		try {
			const response = await fetch(url, { signal: controller.signal });

			if (response.status === 404) {
				return { ok: false, status: 404, data: null, error: null };
			}

			if (response.status === 429 || response.status >= 500) {
				lastError = new Error(`HTTP ${response.status}`);
				continue;
			}

			if (!response.ok) {
				return {
					ok: false,
					status: response.status,
					data: null,
					error: new Error(`HTTP ${response.status}`),
				};
			}

			const text = await response.text();

			if (!text) {
				lastError = new Error("Empty body");
				continue;
			}

			try {
				return { ok: true, status: response.status, data: JSON.parse(text), error: null };
			} catch {
				lastError = new Error("Invalid JSON body");
			}
		} catch (error) {
			lastError = error;
		} finally {
			clearTimeout(timer);
		}
	}

	return { ok: false, status: 0, data: null, error: lastError };
}
