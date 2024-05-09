export default function construct(instance, defaultProperties) {
	for (const _key in defaultProperties) {
		instance[_key] = defaultProperties[_key];
	};
}