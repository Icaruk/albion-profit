import { makeAutoObservable } from "mobx";
import construct from "../utils/construct";
import persist from "../utils/persist";

import { setLanguageTag } from "@/paraglide/runtime.js";

const defaultProperties = {
	language: "en",
	server: "europe",
	debugMode: false,
};

export class GlobalStore {
	constructor() {
		construct(this, defaultProperties);

		makeAutoObservable(this);
		persist(this, "globalStore");
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

	reset() {
		construct(this, defaultProperties);
	}
}
