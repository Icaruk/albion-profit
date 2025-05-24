export function formatHundeds(value) {
	if (!value || Number.isNaN(value)) {
		value = 0;
	}

	return new Intl.NumberFormat("es-ES", {}).format(value);
}
