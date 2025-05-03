import { autorun, configure, toJS } from "mobx";
import { GlobalStore } from "./stores/globalStore";
import { GroupStore } from "./stores/groupStore";

configure({
	enforceActions: "never",
});

class RootStore {
	isRoot = true;

	constructor() {
		this.globalStore = new GlobalStore(this);
		this.groupStore = new GroupStore(this);
	}
}

const rootStore = new RootStore();

export const globalStore = rootStore.globalStore;
export const groupStore = rootStore.groupStore;
