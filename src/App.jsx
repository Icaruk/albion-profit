import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/charts/styles.css";

import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { BASENAME } from "../BASENAME";
import Home from "./pages/home/Home";
import { theme } from "./theme";

export default function App() {
	useEffect(() => {
		const gaScript = document.createElement("script");
		gaScript.src = "https://www.googletagmanager.com/gtag/js?id=G-NZ50J7EJH3";
		gaScript.async = true;
		document.head.appendChild(gaScript);

		window.dataLayer = window.dataLayer || [];
		function gtag(...args) {
			window.dataLayer.push(args);
		}
		gtag("js", new Date());
		gtag("config", "G-NZ50J7EJH3");

		const cfScript = document.createElement("script");
		cfScript.src = "https://static.cloudflareinsights.com/beacon.min.js";
		cfScript.defer = true;
		cfScript.setAttribute("data-cf-beacon", '{"token": "1d315b1d70084cadab4c46e4a912bab6"}');
		document.head.appendChild(cfScript);
	}, []);

	return (
		<MantineProvider theme={theme} defaultColorScheme="dark">
			<Notifications />
			<BrowserRouter basename={BASENAME}>
				<Routes>
					<Route path="/" element={<Home />} />
				</Routes>
			</BrowserRouter>

			<Helmet>
				{/* Primary Meta Tags */}
				<title>Albion Profit Calculator - Crafting & Trading Tool</title>
				<meta name="title" content="Albion Profit Calculator - Crafting & Trading Tool" />
				<meta
					name="description"
					content="Calculate crafting profits, track market prices, and optimize your Albion Online trading with our comprehensive profit calculator. Perfect for crafters and traders."
				/>
				<meta
					name="keywords"
					content="Albion Online, profit calculator, crafting calculator, market prices, trading tool, Albion economy, item crafting"
				/>
				<meta name="author" content="Albion Profit" />

				{/* Open Graph / Facebook */}
				<meta property="og:type" content="website" />
				<meta property="og:url" content="https://icaruk.github.io/albion-profit/" />
				<meta
					property="og:title"
					content="Albion Profit Calculator - Crafting & Trading Tool"
				/>
				<meta
					property="og:description"
					content="Calculate crafting profits, track market prices, and optimize your Albion Online trading with our comprehensive profit calculator."
				/>
				<meta
					property="og:image"
					content="https://github.com/user-attachments/assets/22761220-9fc7-438c-a001-84ec4b5ead13"
				/>

				{/* Twitter */}
				<meta property="twitter:card" content="summary_large_image" />
				<meta property="twitter:url" content="https://icaruk.github.io/albion-profit/" />
				<meta
					property="twitter:title"
					content="Albion Profit Calculator - Crafting & Trading Tool"
				/>
				<meta
					property="twitter:description"
					content="Calculate crafting profits, track market prices, and optimize your Albion Online trading with our comprehensive profit calculator."
				/>
				<meta
					property="twitter:image"
					content="https://github.com/user-attachments/assets/22761220-9fc7-438c-a001-84ec4b5ead13"
				/>

				{/* Canonical URL */}
				<link rel="canonical" href="https://icaruk.github.io/albion-profit/" />
			</Helmet>
		</MantineProvider>
	);
}
