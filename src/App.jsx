import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BASENAME } from "../BASENAME";
import Home from "./pages/home/Home";
import { theme } from "./theme";

export default function App() {
	return (
		<MantineProvider theme={theme} defaultColorScheme="dark">
			<Notifications />
			<BrowserRouter basename={BASENAME}>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>
		</MantineProvider>
	);
}
