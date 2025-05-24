// @ts-check

import { makeAutoObservable } from "mobx";
import persist from "../utils/persist";

import { IndexedDB } from "@/pages/home/utils/IndexedDB/IndexedDB";
import { setLanguageTag } from "@/paraglide/runtime.js";

/**
 * @typedef {"ES-ES" | "EN-EN" | "FR-FR"} LanguageKeys
 */

/**
 * @typedef {"en" | "es" | "fr"} LanguageCodes
 */

/**
 * @typedef {"west" | "east" | "europe"} Regions
 */

const defaultProperties = {
	/** @type {LanguageCodes} */
	language: "en",
	/** @type {Regions} */
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
	 * @return {LanguageKeys}
	 */
	getItemLangKey = () => {
		const language = this.language ?? "";

		/** @type {{ [key in LanguageCodes]: string }} */
		const languageToItemKey = {
			en: "EN-US",
			es: "ES-ES",
			fr: "FR-FR",
		};

		return languageToItemKey[language];
	};

	/** @param {LanguageCodes} language */
	setLanguage = (language) => {
		if (!language) return;

		setLanguageTag(language);
		this.language = language;
	};

	/**
	 * @param {Regions} server
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
