import { configure } from "mobx";
import { GlobalStore } from "./stores/globalStore";

configure({
	enforceActions: "never",
});

class RootStore {
	estoEsRoot = true;

	constructor() {
		this.globalStore = new GlobalStore(this);
	}
}

const rootStore = new RootStore();

export const globalStore = rootStore.globalStore;
