export class IndexedDB {
	db;

	init = async () => {
		return new Promise((resolve, reject) => {
			let db;
			const request = window.indexedDB.open("albion-profit", 2);

			request.onerror = (event) => {
				const errMsg = "Could not init IndexedDB";
				console.error(errMsg);
				reject(errMsg);
			};

			// This event is only triggered when the database is first created
			// or when the version changes
			request.onupgradeneeded = (event) => {
				const db = event.target.result;

				// Create the groups object store with id as the key path
				if (!db.objectStoreNames.contains("groups")) {
					db.createObjectStore("groups", { keyPath: "id" });
					console.log("Created 'groups' object store");
				}
			};

			request.onsuccess = (event) => {
				db = event.target.result;

				db.onerror = (event) => {
					console.error(`Database error: ${event.target.error?.message}`);
				};

				console.log("IndexedDB initialized");

				this.db = db;

				resolve(db);
			};
		});
	};

	add = async (storeName, data) => {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(storeName, "readwrite");
			const objectStore = transaction.objectStore(storeName);

			const request = objectStore.put(data);

			request.onsuccess = (event) => {
				console.log(`[IDB] ADD ${storeName} ${data.id}`);
				resolve(event.target.result);
			};

			request.onerror = (event) => {
				console.error(`[IDB] ADD ERROR ${storeName}: ${event.target.error.message}`);
				reject(event.target.error);
			};
		});
	};

	getAll = async (storeName) => {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(storeName, "readonly");
			const objectStore = transaction.objectStore(storeName);
			const request = objectStore.getAll();

			request.onsuccess = (event) => {
				console.log(`[IDB] GET ALL ${storeName}`);
				resolve(event.target.result);
			};

			request.onerror = (event) => {
				console.error(`[IDB] GET ALL ERROR ${storeName}: ${event.target.error.message}`);
				reject(event.target.error);
			};
		});
	};

	deleteOne = async (storeName, id) => {
		return new Promise((resolve, reject) => {
			const transaction = this.db.transaction(storeName, "readwrite");
			const objectStore = transaction.objectStore(storeName);
			const request = objectStore.delete(id);

			request.onsuccess = (event) => {
				console.log(`[IDB] DELETE ${storeName} ${id} `);
				resolve(event.target.result);
			};

			request.onerror = (event) => {
				console.log(
					`[IDB] ERROR DELETE ${storeName} ${id}: ${event.target.error.message} `,
				);
				reject(event.target.error);
			};
		});
	};
}
