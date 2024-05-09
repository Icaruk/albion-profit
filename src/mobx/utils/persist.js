import { autorun, set, toJS } from "mobx";

/**
 * Hace persistente un store de MobX, cargando al inicio y guardando ante cada cambio.
 * @param {*} _this Instancia del store de MobX (cuando ya es un Obervable)
 * @param {string} storageKey Nombre de la key del storage donde se cargará y guardará la store
 */
export default function persist(_this, storageKey, options = {}) {
	const load = localStorage.getItem(storageKey);
	if (load) set(_this, JSON.parse(load));

	autorun(() => {
		const value = toJS(_this);

		if (options.excludeKey) {
			options.excludeKey.forEach((_excludedKey) => delete value[_excludedKey]);
		}

		localStorage.setItem(storageKey, JSON.stringify(value));
	});
}
