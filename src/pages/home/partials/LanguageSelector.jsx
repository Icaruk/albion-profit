import { globalStore } from "@/mobx/rootStore";
import { Avatar, Center, Group, Select, Text } from "@mantine/core";
import { observer } from "mobx-react-lite";

function FlagLabel({ imageSrc, text }) {
	return (
		<Group>
			<Avatar src={imageSrc} size={16} />
			<Text style={{ zIndex: 1 }}>{text}</Text>
		</Group>
	);
}

function getFlagRenderOptions({ language, withText = true }) {
	const obj = {
		es: {
			image: "images/flags/es.png",
			text: "Español",
		},
		en: {
			image: "images/flags/en.png",
			text: "English",
		},
		fr: {
			image: "images/flags/fr.png",
			text: "Français",
		},
	};

	const img = obj[language].image;
	const text = withText ? obj[language].text : null;

	return <FlagLabel imageSrc={img} text={text} />;
}

export const LanguageSelector = observer(() => {
	return (
		<Select
			w={150}
			withCheckIcon
			value={globalStore.language}
			data={[
				{ label: "English", value: "en" },
				{ label: "Español", value: "es" },
				{ label: "Français", value: "fr" },
			]}
			onChange={(_val) => {
				globalStore.setLanguage(_val);
			}}
			renderOption={({ option /*checked*/ }) => {
				return getFlagRenderOptions({ language: option.value });
			}}
			leftSectionProps={{
				style: {
					marginLeft: 8,
				},
			}}
			leftSection={getFlagRenderOptions({ language: globalStore.language, withText: false })}
		/>
	);
});
