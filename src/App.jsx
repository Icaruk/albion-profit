import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { theme } from "./theme";
import Home from "./pages/home/Home";
import { BrowserRouter } from "react-router-dom";
import { Routes } from "react-router-dom";
import { Route } from "react-router-dom";
import { BASENAME } from "../BASENAME";

export default function App() {
	return (
		<MantineProvider theme={theme} defaultColorScheme="dark">
			<BrowserRouter basename={BASENAME}>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>
		</MantineProvider>
	);
}
