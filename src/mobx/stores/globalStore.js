import { makeAutoObservable } from "mobx";
import persist from "../utils/persist";

import { IndexedDB } from "@/pages/home/Home";
import { setLanguageTag } from "@/paraglide/runtime.js";

const defaultProperties = {
	language: "en",
	server: "europe",
	debugMode: false,
	bindQuantity: true,
	indexedDb: null,
};

export class GlobalStore {
	language = defaultProperties.language;
	server = defaultProperties.server;
	debugMode = defaultProperties.debugMode;
	bindQuantity = defaultProperties.bindQuantity;
	indexedDb = defaultProperties.indexedDb;

	constructor() {
		makeAutoObservable(this);

		Object.assign(this, defaultProperties);
		persist(this, "globalStore");

		this.setLanguage(this.language);
	}

	/**
	 * @return {"ES-ES" | "EN-EN" | "FR-FR"}
	 */
	getItemLangKey = () => {
		const language = this.language ?? "";

		const languageToItemKey = {
			en: "EN-US",
			es: "ES-ES",
			fr: "FR-FR",
		};

		return languageToItemKey[language];
	};

	/** @param {"en" | "es" | "fr"} lang */
	setLanguage = (language) => {
		if (!language) return;

		setLanguageTag(language);
		this.language = language;
	};

	/**
	 * @param {"west" | "east" | "europe"} server
	 */
	setServer = (server) => {
		if (!server) return;

		this.server = server;
	};

	/**
	 * @returns {IndexedDB}
	 */
	getIndexedDb() {
		return this.indexedDb;
	}
}
