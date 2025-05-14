export function formatHundeds(value) {
	return new Intl.NumberFormat("es-ES", {}).format(value);
}
