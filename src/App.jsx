import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BASENAME } from "../BASENAME";
import Home from "./pages/home/Home";
import { theme } from "./theme";
import { useEffect } from "react";
import { Helmet } from "react-helmet";

export default function App() {
	return (
		<MantineProvider theme={theme} defaultColorScheme="dark">
			<Notifications />
			<BrowserRouter basename={BASENAME}>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>

			<Helmet>
				{/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
				<script
					async
					src="https://www.googletagmanager.com/gtag/js?id=G-NZ50J7EJH3"
				></script>

				<script>
					{`
						window.dataLayer = window.dataLayer || [];
						function gtag(){dataLayer.push(arguments);}
						gtag('js', new Date());

						gtag('config', 'G-NZ50J7EJH3');
					`}
				</script>
			</Helmet>
		</MantineProvider>
	);
}
